'use client';

import Head from 'next/head';
import { useSiteConfig } from '@/hooks/use-site-config';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  noIndex?: boolean;
  canonical?: string;
}

export function MetaTags({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  tags = [],
  noIndex = false,
  canonical,
}: MetaTagsProps) {
  const { config } = useSiteConfig();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  const siteName = config.branding.siteName || 'My Personal Blog';
  const siteDescription = config.seo?.metaDescription || 'A personal blog sharing insights and experiences';
  
  const metaTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDescription = description || siteDescription;
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const canonicalUrl = canonical || fullUrl;
  const imageUrl = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : undefined;
  
  const allKeywords = [
    ...keywords,
    ...tags,
    ...(config.seo?.keywords || [])
  ].filter((keyword, index, array) => array.indexOf(keyword) === index);

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      {allKeywords.length > 0 && (
        <meta name="keywords" content={allKeywords.join(', ')} />
      )}
      <meta name="author" content={author || siteName} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      <meta 
        name="robots" 
        content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} 
      />
      <meta name="googlebot" content="index, follow" />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      {imageUrl && (
        <>
          <meta property="og:image" content={imageUrl} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={title || siteName} />
          <meta property="og:image:type" content="image/jpeg" />
        </>
      )}
      
      {/* Article specific Open Graph tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {tags.length > 0 && tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
          {tags[0] && <meta property="article:section" content={tags[0]} />}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@yourblog" />
      <meta name="twitter:creator" content={author ? `@${author.replace(/\s+/g, '').toLowerCase()}` : '@yourblog'} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {imageUrl && (
        <>
          <meta name="twitter:image" content={imageUrl} />
          <meta name="twitter:image:alt" content={title || siteName} />
        </>
      )}
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#3b82f6" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
      <meta name="application-name" content={siteName} />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Language and Locale */}
      <meta httpEquiv="content-language" content="en-US" />
      <meta name="language" content="en-US" />
      
      {/* RSS Feed Discovery */}
      <link 
        rel="alternate" 
        type="application/rss+xml" 
        title={`${siteName} RSS Feed`}
        href={`${baseUrl}/rss.xml`} 
      />
      
      {/* Sitemap Reference */}
      <link rel="sitemap" type="application/xml" href={`${baseUrl}/sitemap.xml`} />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      
      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      
      {/* Dublin Core Metadata */}
      <meta name="DC.title" content={metaTitle} />
      <meta name="DC.description" content={metaDescription} />
      <meta name="DC.creator" content={author || siteName} />
      <meta name="DC.language" content="en-US" />
      <meta name="DC.format" content="text/html" />
      <meta name="DC.type" content={type === 'article' ? 'Text' : 'Collection'} />
      {publishedTime && <meta name="DC.date" content={publishedTime} />}
      
      {/* Schema.org Microdata */}
      <meta itemProp="name" content={metaTitle} />
      <meta itemProp="description" content={metaDescription} />
      {imageUrl && <meta itemProp="image" content={imageUrl} />}
    </Head>
  );
}

// Utility component for JSON-LD structured data
interface JSONLDProps {
  data: object;
}

export function JSONLD({ data }: JSONLDProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Component for multiple structured data schemas
interface MultipleStructuredDataProps {
  schemas: object[];
}

export function MultipleStructuredData({ schemas }: MultipleStructuredDataProps) {
  return (
    <>
      {schemas.map((schema, index) => (
        <JSONLD key={index} data={schema} />
      ))}
    </>
  );
}