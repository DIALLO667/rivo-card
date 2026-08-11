// Injecte des balises <title>/Open Graph spécifiques au profil dans le HTML
// servi pour /p/:uniqueLink, avant que le JS (React) ne s'exécute.
// Corrige deux problèmes :
//  - le titre générique du site qui s'affiche avant que le profil ne charge
//  - les aperçus de lien (WhatsApp, Facebook, iMessage...) qui n'exécutent
//    pas le JS et ne voient donc jamais les balises Helmet côté client.

const API_BASE = "https://rivo-card.onrender.com/api";
const SITE_URL = "https://card.rivostudiotech.com";
const DEFAULT_IMAGE =
  "https://res.cloudinary.com/dwe9byiww/video/upload/w_1200,so_1/v1784264377/video-nfc_rcyvuq.jpg";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default async (request, context) => {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/p\/([^/]+)\/?$/);
  if (!match) return context.next();

  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const uniqueLink = decodeURIComponent(match[1]);
  let html = await response.text();

  try {
    const apiRes = await fetch(`${API_BASE}/profiles/public/${uniqueLink}`);
    if (apiRes.ok) {
      const profile = await apiRes.json();
      const name = profile?.name || "Profil";
      const title = profile?.job
        ? `${name} — ${profile.job} | Rivo Card`
        : `${name} | Rivo Card`;
      const description =
        [profile?.job, profile?.company].filter(Boolean).join(" · ") ||
        `Retrouvez toutes les coordonnées de ${name} sur sa carte de visite digitale Rivo Card.`;
      const image = profile?.photo_url || DEFAULT_IMAGE;
      const pageUrl = `${SITE_URL}/p/${uniqueLink}`;

      const t = escapeHtml(title);
      const d = escapeHtml(description);
      const i = escapeHtml(image);

      const metaBlock = `
    <title>${t}</title>
    <meta name="description" content="${d}" />
    <meta name="robots" content="noindex, nofollow" />
    <link rel="canonical" href="${pageUrl}" />
    <meta property="og:type" content="profile" />
    <meta property="og:site_name" content="Rivo Card" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:image" content="${i}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${i}" />
  </head>`;

      html = html
        .replace(/<title>.*?<\/title>/s, "")
        .replace(/<\/head>/, metaBlock);
    }
  } catch (_err) {
    // Best-effort : si l'API est injoignable, on sert le HTML standard sans planter.
  }

  const headers = new Headers(response.headers);
  headers.delete("content-length");

  return new Response(html, {
    status: response.status,
    headers,
  });
};

export const config = { path: "/p/*" };
