import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  siteName?: string;
  locale?: string;
  alternateLocales?: string[];
}

export class SEOManager {
  private baseUrl: string;
  private defaultSiteName: string;
  private defaultAuthor: string;
  private defaultImage: string;

  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    defaultSiteName: string = 'My Personal Blog',
    defaultAuthor: string = 'Blog Author',
    defaultImage: string = '/og-image.jpg'
  ) {
    this.baseUrl = baseUrl;
    this.defaultSiteName = defaultSiteName;
    this.defaultAuthor = defaultAuthor;
    this.defaultImage = defaultImage;
  }

  generateMetadata(config: SEOConfig): Metadata {
    const {
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
      siteName = this.defaultSiteName,
      locale = 'en_US',
      alternateLocales = []
    } = config;

    const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
    const fullUrl = url ? `${this.baseUrl}${url}` : this.baseUrl;
    const imageUrl = this.resolveImageUrl(image);

    return {
      title: fullTitle,
      description,
      keywords: keywords.join(', '),
      authors: author ? [{ name: author }] : [{ name: this.defaultAuthor }],
      creator: author || this.defaultAuthor,
      publisher: siteName,
      
      // Open Graph
      openGraph: {
        title: fullTitle,
        description,
        siteName,
        type,
        url: fullUrl,
        locale,
        alternateLocale: alternateLocales,
        images: imageUrl ? [{
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/jpeg',
        }] : [],
        ...(type === 'article' && {
          publishedTime: publishedTime || undefined,
          modifiedTime: modifiedTime || undefined,
          authors: author ? [author] : [this.defaultAuthor],
          tags: tags || [],
        }),
      },
      
      // Twitter
      twitter: {
        card: 'summary_large_image',
        site: '@yourblog',
        creator: author ? `@${this.sanitizeTwitterHandle(author)}` : '@yourblog',
        title: fullTitle,
        description,
        images: imageUrl ? [{ url: imageUrl, alt: title }] : [],
      },
      
      // Additional metadata
      other: {
        'canonical': fullUrl,
        'og:locale': locale,
        'article:author': author || this.defaultAuthor,
        ...(publishedTime && { 'article:published_time': publishedTime }),
        ...(modifiedTime && { 'article:modified_time': modifiedTime }),
        'article:section': tags[0] || 'Blog',
        'article:tag': tags.join(', '),
        'theme-color': '#3b82f6',
      },
      
      // Robots
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }

  generateArticleMetadata(article: {
    title: string;
    excerpt?: string;
    featuredImage?: string;
    slug: string;
    publishedAt?: any;
    updatedAt?: any;
    tags: string[];
    category?: { name: string };
    author?: string;
  }): Metadata {
    const publishedTime = article.publishedAt 
      ? new Date(article.publishedAt.seconds * 1000).toISOString()
      : undefined;
    
    const modifiedTime = article.updatedAt 
      ? new Date(article.updatedAt.seconds * 1000).toISOString()
      : undefined;

    return this.generateMetadata({
      title: article.title,
      description: article.excerpt || `Read ${article.title} on our blog`,
      image: article.featuredImage,
      url: `/articles/${article.slug}`,
      type: 'article',
      publishedTime,
      modifiedTime,
      author: article.author,
      tags: article.tags,
      keywords: [...article.tags, article.category?.name].filter(Boolean) as string[],
    });
  }

  generateCategoryMetadata(category: {
    name: string;
    description?: string;
    slug: string;
  }): Metadata {
    return this.generateMetadata({
      title: `${category.name} Articles`,
      description: category.description || `Browse all articles in the ${category.name} category`,
      url: `/category/${category.slug}`,
      keywords: [category.name, 'articles', 'blog', 'category'],
    });
  }

  generateSearchMetadata(query: string, resultsCount: number): Metadata {
    return this.generateMetadata({
      title: `Search Results for "${query}"`,
      description: `Found ${resultsCount} articles matching "${query}"`,
      url: `/search?q=${encodeURIComponent(query)}`,
      keywords: [query, 'search', 'articles', 'blog'],
    });
  }

  private resolveImageUrl(image?: string): string | undefined {
    if (!image) return undefined;
    if (image.startsWith('http')) return image;
    if (image.startsWith('/')) return `${this.baseUrl}${image}`;
    return `${this.baseUrl}/${image}`;
  }

  private sanitizeTwitterHandle(name: string): string {
    return name.replace(/\s+/g, '').toLowerCase();
  }
}

// Utility functions for structured data
export function generateArticleStructuredData(article: {
  title: string;
  excerpt?: string;
  featuredImage?: string;
  slug: string;
  publishedAt?: any;
  updatedAt?: any;
  tags: string[];
  category?: { name: string };
  readingTime: number;
  author?: string;
}, siteName: string, baseUrl: string) {
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

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.title,
    image: imageUrl ? [imageUrl] : [],
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Person',
      name: article.author || 'Blog Author',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    url: articleUrl,
    wordCount: article.readingTime * 200,
    timeRequired: `PT${article.readingTime}M`,
    articleSection: article.category?.name || 'Blog',
    keywords: article.tags.join(', '),
    inLanguage: 'en-US',
  };
}

export function generateWebsiteStructuredData(
  siteName: string, 
  siteUrl: string, 
  description: string, 
  logo?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description,
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
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// SEO validation utilities
export function validateSEOConfig(config: SEOConfig): string[] {
  const errors: string[] = [];
  
  if (!config.title) {
    errors.push('Title is required');
  } else if (config.title.length > 60) {
    errors.push('Title should be 60 characters or less');
  }
  
  if (!config.description) {
    errors.push('Description is required');
  } else if (config.description.length > 160) {
    errors.push('Description should be 160 characters or less');
  }
  
  if (config.keywords && config.keywords.length > 10) {
    errors.push('Too many keywords (max 10 recommended)');
  }
  
  return errors;
}

// Create default SEO manager instance
export const seoManager = new SEOManager();