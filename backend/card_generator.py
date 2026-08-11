"""
Génération programmatique des cartes de visite imprimables (recto/verso),
en remplacement du travail manuel fait jusqu'ici dans Canva.

Approche : un template unique (fond couleur + motif de vagues + blob dégradé
+ nom/poste + logo Rivo + logo client + QR code au verso) paramétré par les
couleurs et informations du profil. Ce n'est pas un pixel-perfect du rendu
Canva d'origine — c'est une approximation générée par code, pensée pour être
ajustée par petites itérations plutôt que redessinée à la main.
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
FONT_PATH = os.path.join(ASSETS_DIR, "fonts", "Inter-Variable.ttf")

# Format d'export : proche du ratio des maquettes fournies (~1.78:1),
# taille confortable pour l'impression. À ajuster si l'imprimeur donne
# un format/bleed précis en mm.
CARD_W, CARD_H = 1800, 1013

SITE_URL = "https://card.rivostudiotech.com"

DEFAULT_BG = "#1F6B4A"      # vert par défaut si le profil n'a pas de bg_color
DEFAULT_ACCENT = "#E8622C"  # orange par défaut pour le blob / accents


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
        return tuple(int(c + (255 - c) * amount) for c in rgb)
    return tuple(int(c * (1 + amount)) for c in rgb)


def _font(size, weight=700, optical=None):
    f = ImageFont.truetype(FONT_PATH, size)
    try:
        f.set_variation_by_axes([optical or min(32, max(14, size // 4)), weight])
    except Exception:
        pass
    return f


def _draw_wave_texture(base_rgb, w, h):
    """Bandes ondulées discrètes, superposées au fond uni."""
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    lighter = _shade(base_rgb, 0.06)
    band_count = 9
    spacing = h / band_count
    for i in range(-1, band_count + 2):
        base_y = i * spacing
        points = []
        for x in range(0, w + 20, 20):
            offset = math.sin((x / w) * math.pi * 2.3 + i * 0.7) * (spacing * 0.35)
            points.append((x, base_y + offset))
        draw.line(points, fill=(*lighter, 35), width=3)
    return layer


def _draw_blob(w, h, color_a, color_b):
    """Dégradé radial doux, positionné pour déborder du coin supérieur droit."""
    size = int(max(w, h) * 1.1)
    yy, xx = np.mgrid[0:size, 0:size]
    cx, cy = size * 0.62, size * 0.38
    max_r = size * 0.55
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / max_r
    dist = np.clip(dist, 0, 1)
    t = (1 - dist) ** 1.6  # intensité au centre, s'estompe vers les bords

    a = np.array(color_a, dtype=np.float32)
    b = np.array(color_b, dtype=np.float32)
    rgb = a[None, None, :] * t[:, :, None] + b[None, None, :] * (1 - t[:, :, None])
    alpha = (t * 200).astype(np.uint8)

    arr = np.dstack([rgb.astype(np.uint8), alpha])
    blob = Image.fromarray(arr, mode="RGBA").filter(ImageFilter.GaussianBlur(size * 0.03))

    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    # positionne le blob pour qu'il déborde du coin haut-droit du canvas
    layer.alpha_composite(blob, (w - int(size * 0.72), -int(size * 0.28)))
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

    canvas = Image.new("RGBA", (CARD_W, CARD_H), (*bg_rgb, 255))
    canvas.alpha_composite(_draw_wave_texture(bg_rgb, CARD_W, CARD_H))
    canvas.alpha_composite(_draw_blob(CARD_W, CARD_H, accent_rgb, bg_rgb))
    return canvas, bg_rgb, accent_rgb


def render_front(profile, overrides=None):
    overrides = overrides or {}
    bg_color = overrides.get("bg_color") or profile.get("bg_color")
    accent_color = overrides.get("accent_color") or profile.get("icon_color") or profile.get("button_color")
    name = overrides.get("name") or profile.get("name") or ""
    job = overrides.get("job") or profile.get("job") or ""

    canvas, bg_rgb, accent_rgb = _base_canvas(bg_color, accent_color)
    is_light_bg = _luminance(bg_rgb) > 0.6
    text_rgb = (20, 20, 20) if is_light_bg else (255, 255, 255)

    logo = _recolor_logo(text_rgb)
    _paste_contain(canvas, logo, (90, 70, 300, 110), anchor="top-left")

    draw = ImageDraw.Draw(canvas)
    name_font = _font(120, weight=800)
    job_font = _font(48, weight=600)

    name_y = CARD_H * 0.42
    # gère les noms longs sur 2 lignes si nécessaire
    max_width = CARD_W * 0.62
    words = name.split()
    lines, current = [], ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textlength(trial, font=name_font) > max_width and current:
            lines.append(current)
            current = word
        else:
            current = trial
    if current:
        lines.append(current)
    lines = lines[:2] or [""]

    line_height = name_font.size * 1.05
    total_h = line_height * len(lines)
    y = name_y - total_h / 2
    for line in lines:
        draw.text((95, y), line, font=name_font, fill=(*text_rgb, 255))
        y += line_height

    if job:
        draw.text((98, y + 10), job.upper(), font=job_font, fill=(*accent_rgb, 255))

    logo_url = profile.get("logo_url")
    if logo_url:
        client_logo = _fetch_remote_image(logo_url)
        if client_logo:
            _paste_contain(canvas, client_logo, (CARD_W - 420, CARD_H - 260, 340, 190), anchor="bottom-right")

    return canvas.convert("RGB")


def render_back(profile, overrides=None):
    overrides = overrides or {}
    bg_color = overrides.get("bg_color") or profile.get("bg_color")
    accent_color = overrides.get("accent_color") or profile.get("icon_color") or profile.get("button_color")

    canvas, bg_rgb, accent_rgb = _base_canvas(bg_color, accent_color)
    is_light_bg = _luminance(bg_rgb) > 0.6
    text_rgb = (20, 20, 20) if is_light_bg else (255, 255, 255)

    logo = _recolor_logo(text_rgb)
    _paste_contain(canvas, logo, (90, 70, 300, 110), anchor="top-left")

    unique_link = profile.get("unique_link", "")
    qr_url = f"{SITE_URL}/p/{unique_link}"
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=14, border=2)
    qr.add_data(qr_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")

    qr_size = 460
    qr_img = qr_img.resize((qr_size, qr_size), Image.LANCZOS)

    # petit badge blanc arrondi derrière le QR pour la lisibilité au scan
    pad = 36
    plate = Image.new("RGBA", (qr_size + pad * 2, qr_size + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(plate).rounded_rectangle(
        [0, 0, plate.width, plate.height], radius=28, fill=(255, 255, 255, 255)
    )
    plate.alpha_composite(qr_img, (pad, pad))

    # icône Rivo au centre du QR (haute correction d'erreur → tolère l'occlusion)
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
