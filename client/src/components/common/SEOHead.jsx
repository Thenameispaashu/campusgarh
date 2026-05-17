import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const DEFAULT_FAVICON = '/ms-icon-150x150.png';
const DEFAULT_IMAGE = 'https://campusgarh.com/ms-icon-150x150.png';

const DEFAULT_DESCRIPTION = "Discover 5,000+ colleges, compare courses, and explore entrance exams across India. Read genuine student reviews and ground reports. Get free personalised admission guidance from expert counselors.";

const SEOHead = ({ title, description, keywords, canonical, image, favicon, schema, type = 'website', noindex = false }) => {
  const fullTitle = title ? `${title} | CampusGarh` : "CampusGarh — Find Top Colleges, Courses & Entrance Exams in India";
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const url = canonical || (typeof window !== 'undefined' ? window.location.href : 'https://campusgarh.com');
  const faviconUrl = favicon || DEFAULT_FAVICON;

  // Direct DOM update — Helmet alone nahi kar pata dynamic favicon
  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
    // Reset to default on unmount
    return () => { link.href = DEFAULT_FAVICON; };
  }, [faviconUrl]);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={image || DEFAULT_IMAGE} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="CampusGarh" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image || DEFAULT_IMAGE} />

      {schema && <script type="application/ld+json">{JSON.stringify(schema)}</script>}
    </Helmet>
  );
};

export default SEOHead;
