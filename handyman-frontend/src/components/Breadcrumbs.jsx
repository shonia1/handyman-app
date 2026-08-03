import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  const siteUrl = import.meta.env.VITE_SITE_URL || "https://handyman-ge.vercel.app"; // ✅ ცვლადი

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "მთავარი",
        "item": `${siteUrl}/`
      },
      ...pathnames.map((name, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": decodeURIComponent(name),
        "item": `${siteUrl}/${pathnames.slice(0, index + 1).join('/')}`
      }))
    ]
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-indigo-600">🏠 მთავარი</Link>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          return (
            <span key={name}>
              <span className="mx-2">/</span>
              {isLast ? (
                <span className="text-gray-700 font-medium">{decodeURIComponent(name)}</span>
              ) : (
                <Link to={routeTo} className="hover:text-indigo-600">{decodeURIComponent(name)}</Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
};

export default Breadcrumbs;