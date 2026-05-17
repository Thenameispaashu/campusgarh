import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME      = 'CampusGarh';
const SITE_URL       = 'https://campusgarh.com';
const TWITTER_HANDLE = '@campusgarh';
const DEFAULT_FAVICON = '/ms-icon-150x150.png';
const DEFAULT_IMAGE   = `${SITE_URL}/ms-icon-150x150.png`;
const DEFAULT_DESCRIPTION = "Discover 5,000+ colleges, compare courses, and explore entrance exams across India. Read genuine student reviews and ground reports. Get free personalised admission guidance from expert counselors.";

const SEOHead = ({
  title,
  description,
  keywords,
  canonical,
  image,
  imageAlt,
  favicon,
  schema,
  type = 'website',
  noindex = false,
  article,
}) => {
  const fullTitle    = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Find Top Colleges, Courses & Entrance Exams in India`;
  const metaDesc     = description || DEFAULT_DESCRIPTION;
  const url          = canonical || (typeof window !== 'undefined' ? window.location.href : SITE_URL);
  const faviconUrl   = favicon || DEFAULT_FAVICON;
  const ogImage      = image || DEFAULT_IMAGE;
  const ogImageAlt   = imageAlt || fullTitle;

  // Helmet alone can't reliably update favicon in all browsers
  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
    return () => { link.href = DEFAULT_FAVICON; };
  }, [faviconUrl]);

  // Support single schema object or array of schemas
  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content="en_IN" />
      <meta property="og:type"        content={type} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:image:alt"   content={ogImageAlt} />
      <meta property="og:url"         content={url} />

      {/* Article OG tags — only for blog/news pages */}
      {article?.publishedTime && <meta property="article:published_time" content={article.publishedTime} />}
      {article?.modifiedTime  && <meta property="article:modified_time"  content={article.modifiedTime}  />}
      {article?.author        && <meta property="article:author"         content={article.author}         />}
      {article?.section       && <meta property="article:section"        content={article.section}        />}

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content={TWITTER_HANDLE} />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image"       content={ogImage} />
      <meta name="twitter:image:alt"   content={ogImageAlt} />

      {/* JSON-LD Structured Data — supports multiple schemas */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
