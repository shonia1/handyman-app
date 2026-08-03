// src/components/SEO.jsx
import { Helmet } from "react-helmet-async";

const SEO = ({
  title = "Handyman – ხელოსნების პლატფორმა",
  description = "იპოვეთ ხელოსანი ან გამოაქვეყნეთ დავალება. სანტექნიკა, ელექტრიკა, შეკეთება და სხვა.",
  keywords = "ხელოსანი, დავალება, სანტექნიკა, ელექტრიკა, შეკეთება, თბილისი",
  image = "/logo512.png",
  url = "",
  type = "website",
  author = "Handyman Team",
}) => {
  const siteUrl = import.meta.env.VITE_SITE_URL || "https://handyman-ge.vercel.app"; // ✅ ცვლადი
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image.startsWith("http") ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={fullUrl} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Handyman" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#4f46e5" />
    </Helmet>
  );
};

export default SEO;