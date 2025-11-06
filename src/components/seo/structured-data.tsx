'use client';

import { useSiteConfig } from '@/hooks/use-site-config';

interface ArticleStructuredDataProps {
  article: {
    id: string;
    title: string;
    excerpt?: string;
    featuredImage?: string;
    slug: string;
    publishedAt?: any;
    updatedAt?: any;
    tags: string[];
    category?: { name: string };
    readingTime: number;
  };
  author?: string;
}

export function ArticleStructuredData({ article, author = 'Blog Author' }: ArticleStructuredDataProps) {
  const { config } = useSiteConfig();
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const articleUrl = `${baseUrl}/articles/${article.slug}`;
  const imageUrl = article.featuredImage 
    ? (article.featuredImage.startsWith('http') ? article.featuredImage : `${baseUrl}${article.featuredImage}`)
    : undefined;

  const publishedDate = article.publishedAt 
    ? new Date(article.publishedAt.seconds * 1000).toISOString()
    : new Date().toISOString();
  
  const modifiedDate = article.updatedAt 
    ? new Date(article.updatedAt.seconds * 1000).toISOString()
    : publishedDate;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.title,
    image: imageUrl ? [imageUrl] : [],
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Person',
      name: author,
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: config.branding.siteName,
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: config.branding.logo || `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    url: articleUrl,
    wordCount: article.readingTime * 200, // Approximate word count
    timeRequired: `PT${article.readingTime}M`,
    articleSection: article.category?.name || 'Blog',
    keywords: article.tags.join(', '),
    inLanguage: 'en-US',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface WebsiteStructuredDataProps {
  siteName: string;
  siteUrl: string;
  description: string;
  logo?: string;
}

export function WebsiteStructuredData({ siteName, siteUrl, description, logo }: WebsiteStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description: description,
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      logo: logo ? {
        '@type': 'ImageObject',
        url: logo,
      } : undefined,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-US',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface BlogStructuredDataProps {
  siteName: string;
  siteUrl: string;
  description: string;
  author: string;
}

export function BlogStructuredData({ siteName, siteUrl, description, author }: BlogStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: siteName,
    url: siteUrl,
    description: description,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
    inLanguage: 'en-US',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface OrganizationStructuredDataProps {
  name: string;
  url: string;
  logo?: string;
  description: string;
  contactEmail?: string;
  socialProfiles?: string[];
}

export function OrganizationStructuredData({ 
  name, 
  url, 
  logo, 
  description, 
  contactEmail,
  socialProfiles = []
}: OrganizationStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: name,
    url: url,
    description: description,
    logo: logo ? {
      '@type': 'ImageObject',
      url: logo,
    } : undefined,
    contactPoint: contactEmail ? {
      '@type': 'ContactPoint',
      email: contactEmail,
      contactType: 'customer service',
    } : undefined,
    sameAs: socialProfiles,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface PersonStructuredDataProps {
  name: string;
  url: string;
  image?: string;
  jobTitle?: string;
  description?: string;
  email?: string;
  socialProfiles?: string[];
}

export function PersonStructuredData({ 
  name, 
  url, 
  image, 
  jobTitle, 
  description,
  email,
  socialProfiles = []
}: PersonStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: name,
    url: url,
    image: image,
    jobTitle: jobTitle,
    description: description,
    email: email,
    sameAs: socialProfiles,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface FAQStructuredDataProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface CollectionPageStructuredDataProps {
  name: string;
  description: string;
  url: string;
  articles: Array<{
    title: string;
    url: string;
    datePublished: string;
    author: string;
  }>;
}

export function CollectionPageStructuredData({ 
  name, 
  description, 
  url, 
  articles 
}: CollectionPageStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: name,
    description: description,
    url: url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          headline: article.title,
          url: article.url,
          datePublished: article.datePublished,
          author: {
            '@type': 'Person',
            name: article.author,
          },
        },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}