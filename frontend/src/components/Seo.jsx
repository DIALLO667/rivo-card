import { Helmet } from "react-helmet-async";

const SITE_URL = "https://card.rivostudiotech.com";
const DEFAULT_IMAGE = "https://res.cloudinary.com/dwe9byiww/video/upload/w_1200,so_1/v1784264377/video-nfc_rcyvuq.jpg";

export default function Seo({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  noindex = false,
  jsonLd,
}) {
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Rivo Card" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
