"""
Génération programmatique des cartes de visite imprimables (recto/verso),
en remplacement du travail manuel fait jusqu'ici dans Canva.

Template unique reproduisant la maquette de référence : fond couleur uni +
motif de vagues concentriques + anneau dégradé (coin haut-droit) + swoosh
flou (coin bas-gauche) + logo Rivo + nom/poste + logo client + QR code au
verso. Paramétré par les couleurs et informations du profil.
"""
import io
import math
import os

import numpy as np
import qrcode
import requests
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "assets")
LOGO_PATH = os.path.join(ASSETS_DIR, "rivo_logo_white.png")
FONT_BLACK = os.path.join(ASSETS_DIR, "fonts", "Poppins-Black.ttf")
FONT_SEMIBOLD = os.path.join(ASSETS_DIR, "fonts", "Poppins-SemiBold.ttf")

# Format d'export : proche du ratio des maquettes fournies (~1.78:1),
# taille confortable pour l'impression. À ajuster si l'imprimeur donne
# un format/bleed précis en mm.
CARD_W, CARD_H = 1800, 1013
SS = 2  # supersampling pour des courbes/anti-aliasing propres

SITE_URL = "https://card.rivostudiotech.com"

DEFAULT_BG = "#1F6B4A"      # vert par défaut si le profil n'a pas de bg_color
DEFAULT_ACCENT = "#E8622C"  # orange par défaut pour l'anneau / accents

_FONT_CACHE = {}


def _hex_to_rgb(value, fallback):
    if not value:
        value = fallback
    value = value.lstrip("#")
    if len(value) == 3:
        value = "".join(c * 2 for c in value)
    try:
        return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))
    except Exception:
        return _hex_to_rgb(fallback, fallback)


def _luminance(rgb):
    r, g, b = [c / 255.0 for c in rgb]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def _shade(rgb, amount):
    """amount > 0 éclaircit, < 0 assombrit."""
    if amount >= 0:
        return tuple(min(255, int(c + (255 - c) * amount)) for c in rgb)
    return tuple(max(0, int(c * (1 + amount))) for c in rgb)


def _font(path, size):
    key = (path, size)
    if key not in _FONT_CACHE:
        _FONT_CACHE[key] = ImageFont.truetype(path, size)
    return _FONT_CACHE[key]


def _draw_wave_texture(base_rgb, w, h):
    """Anneaux concentriques déformés (motif topographique), centrés hors-canvas."""
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    lighter = _shade(base_rgb, 0.10)
    cx, cy = w * -0.05, h * 1.15  # centre hors-cadre, bas-gauche
    max_r = math.hypot(w * 1.2, h * 1.3)
    step = max_r / 26
    for i in range(1, 27):
        r = i * step
        points = []
        for a_deg in range(0, 361, 4):
            a = math.radians(a_deg)
            wobble = math.sin(a * 3 + i * 0.5) * step * 0.28
            rr = r + wobble
            points.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
        draw.line(points, fill=(*lighter, 30), width=3, joint="curve")
    return layer


def _radial_band(w, h, cx, cy, inner_r, outer_r, color_inner, color_outer, blur=0):
    """Anneau (donut) avec dégradé radial entre inner_r et outer_r.

    Calculé à résolution réduite (le flou masque la perte de détail) puis
    remis à l'échelle : un GaussianBlur/numpy en pleine résolution était le
    principal goulot d'étranglement de la génération (plusieurs secondes).
    """
    full_size = int(max(w, h) * 1.3)
    size = min(full_size, 520)  # résolution de calcul plafonnée
    scale = size / max(w, h)

    yy, xx = np.mgrid[0:size, 0:size]
    lcx, lcy = size * (cx / w if w else 0.5), size * (cy / h if h else 0.5)
    dist = np.sqrt((xx - lcx) ** 2 + (yy - lcy) ** 2)
    ir, orr = inner_r * scale, outer_r * scale
    blur_px = blur * scale

    band = np.clip((dist - ir) / max(1.0, (orr - ir)), 0, 1)
    edge_fade = np.clip(np.minimum(dist - (ir - blur_px), (orr + blur_px) - dist) / max(1.0, blur_px + 1), 0, 1)
    alpha = (edge_fade * 255).astype(np.uint8)

    a = np.array(color_inner, dtype=np.float32)
    b = np.array(color_outer, dtype=np.float32)
    t = band[:, :, None]
    rgb = (a[None, None, :] * (1 - t) + b[None, None, :] * t).astype(np.uint8)

    arr = np.dstack([rgb, alpha])
    img = Image.fromarray(arr, mode="RGBA")
    if blur:
        img = img.filter(ImageFilter.GaussianBlur(max(1.0, blur_px * 0.35)))

    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    off_x = int(cx - lcx / scale)
    off_y = int(cy - lcy / scale)
    resized = img.resize((int(size / scale), int(size / scale)), Image.LANCZOS)
    layer.alpha_composite(resized, (off_x, off_y))
    return layer


def _recolor_logo(rgb):
    logo = Image.open(LOGO_PATH).convert("RGBA")
    alpha = logo.split()[3]
    solid = Image.new("RGBA", logo.size, (*rgb, 0))
    solid.putalpha(alpha)
    return solid


def _fetch_remote_image(url):
    try:
        resp = requests.get(url, timeout=8)
        resp.raise_for_status()
        return Image.open(io.BytesIO(resp.content)).convert("RGBA")
    except Exception:
        return None


def _paste_contain(base, overlay, box, anchor="center"):
    """Colle `overlay` en respectant son ratio dans `box` (x, y, w, h)."""
    bx, by, bw, bh = box
    ratio = min(bw / overlay.width, bh / overlay.height)
    new_size = (max(1, int(overlay.width * ratio)), max(1, int(overlay.height * ratio)))
    resized = overlay.resize(new_size, Image.LANCZOS)
    if anchor == "center":
        x = bx + (bw - new_size[0]) // 2
        y = by + (bh - new_size[1]) // 2
    elif anchor == "bottom-right":
        x = bx + bw - new_size[0]
        y = by + bh - new_size[1]
    else:
        x, y = bx, by
    base.alpha_composite(resized, (x, y))


def _base_canvas(bg_color, accent_color):
    bg_rgb = _hex_to_rgb(bg_color, DEFAULT_BG)
    accent_rgb = _hex_to_rgb(accent_color, DEFAULT_ACCENT)
    secondary_rgb = _shade(bg_rgb, 0.55)  # ton clair de la même teinte pour le swoosh

    canvas = Image.new("RGBA", (CARD_W, CARD_H), (*bg_rgb, 255))
    canvas.alpha_composite(_draw_wave_texture(bg_rgb, CARD_W, CARD_H))

    # anneau net, coin haut-droit : dégradé bg -> accent
    canvas.alpha_composite(_radial_band(
        CARD_W, CARD_H, cx=CARD_W * 1.02, cy=CARD_H * -0.08,
        inner_r=CARD_W * 0.12, outer_r=CARD_W * 0.34,
        color_inner=bg_rgb, color_outer=accent_rgb, blur=2,
    ))

    # swoosh flou, coin bas-gauche : dégradé ton clair -> bg, centré près du coin
    canvas.alpha_composite(_radial_band(
        CARD_W, CARD_H, cx=CARD_W * 0.02, cy=CARD_H * 0.98,
        inner_r=0, outer_r=CARD_W * 0.34,
        color_inner=secondary_rgb, color_outer=bg_rgb, blur=40,
    ))

    return canvas, bg_rgb, accent_rgb


def _name_lines(draw, name, font, max_width):
    """Découpe le nom : dernier mot sur sa propre ligne (comme les maquettes),
    sauf si le nom tient sur une seule ligne."""
    words = name.split()
    if not words:
        return [""]
    if len(words) == 1:
        return [words[0]]
    if draw.textlength(name, font=font) <= max_width:
        return [name]
    return [" ".join(words[:-1]), words[-1]]


def render_front(profile, overrides=None):
    overrides = overrides or {}
    bg_color = overrides.get("bg_color") or profile.get("bg_color")
    accent_color = overrides.get("accent_color") or profile.get("icon_color") or profile.get("button_color")
    name = (overrides.get("name") or profile.get("name") or "").strip()
    job = (overrides.get("job") or profile.get("job") or "").strip()

    canvas, bg_rgb, accent_rgb = _base_canvas(bg_color, accent_color)
    is_light_bg = _luminance(bg_rgb) > 0.65
    natural_rgb = (20, 20, 20) if is_light_bg else (255, 255, 255)
    text_rgb = _hex_to_rgb(profile.get("name_color"), None) if profile.get("name_color") else natural_rgb
    job_rgb = _hex_to_rgb(profile.get("job_color"), None) if profile.get("job_color") else _shade(bg_rgb, 0.55 if not is_light_bg else -0.1)

    logo = _recolor_logo(natural_rgb)
    _paste_contain(canvas, logo, (95, 75, 300, 110), anchor="top-left")

    draw = ImageDraw.Draw(canvas)
    name_font = _font(FONT_BLACK, 118)
    job_font = _font(FONT_SEMIBOLD, 40)

    max_width = CARD_W * 0.60
    lines = _name_lines(draw, name, name_font, max_width)
    line_height = name_font.size * 1.05
    total_h = line_height * len(lines)
    y = CARD_H * 0.46 - total_h / 2
    for line in lines:
        draw.text((98, y), line, font=name_font, fill=(*text_rgb, 255))
        y += line_height

    if job:
        spaced = "  ".join(list(job.upper()))
        draw.text((100, y + 14), spaced, font=job_font, fill=(*job_rgb, 255))

    logo_url = profile.get("logo_url")
    if logo_url:
        client_logo = _fetch_remote_image(logo_url)
        if client_logo:
            _paste_contain(canvas, client_logo, (CARD_W - 430, CARD_H - 250, 350, 180), anchor="bottom-right")

    return canvas.convert("RGB")


def render_back(profile, overrides=None):
    overrides = overrides or {}
    bg_color = overrides.get("bg_color") or profile.get("bg_color")
    accent_color = overrides.get("accent_color") or profile.get("icon_color") or profile.get("button_color")

    canvas, bg_rgb, accent_rgb = _base_canvas(bg_color, accent_color)
    is_light_bg = _luminance(bg_rgb) > 0.65
    text_rgb = (20, 20, 20) if is_light_bg else (255, 255, 255)

    logo = _recolor_logo(text_rgb)
    _paste_contain(canvas, logo, (95, 75, 300, 110), anchor="top-left")

    unique_link = profile.get("unique_link", "")
    qr_url = f"{SITE_URL}/p/{unique_link}"
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=14, border=2)
    qr.add_data(qr_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")

    qr_size = 460
    qr_img = qr_img.resize((qr_size, qr_size), Image.LANCZOS)

    pad = 36
    plate = Image.new("RGBA", (qr_size + pad * 2, qr_size + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(plate).rounded_rectangle(
        [0, 0, plate.width, plate.height], radius=28, fill=(255, 255, 255, 255)
    )
    plate.alpha_composite(qr_img, (pad, pad))

    icon = _recolor_logo((20, 20, 20))
    icon_box = int(qr_size * 0.2)
    icon_ratio = min(icon_box / icon.width, icon_box / icon.height)
    icon_resized = icon.resize(
        (max(1, int(icon.width * icon_ratio)), max(1, int(icon.height * icon_ratio))), Image.LANCZOS
    )
    icon_bg = Image.new("RGBA", (icon_resized.width + 24, icon_resized.height + 24), (255, 255, 255, 255))
    icon_bg.alpha_composite(icon_resized, (12, 12))
    plate.alpha_composite(
        icon_bg,
        ((plate.width - icon_bg.width) // 2, (plate.height - icon_bg.height) // 2),
    )

    canvas.alpha_composite(plate, ((CARD_W - plate.width) // 2, (CARD_H - plate.height) // 2))

    return canvas.convert("RGB")


def generate_card_png(profile, side="front", overrides=None):
    img = render_front(profile, overrides) if side == "front" else render_back(profile, overrides)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


def generate_card_pdf(profile, overrides=None):
    front = render_front(profile, overrides)
    back = render_back(profile, overrides)
    buf = io.BytesIO()
    front.save(buf, format="PDF", save_all=True, append_images=[back])
    buf.seek(0)
    return buf
