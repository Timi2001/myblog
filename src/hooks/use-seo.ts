'use client';

import { useMemo } from 'react';
import { useSiteConfig } from './use-site-config';
import { seoManager, SEOConfig } from '@/lib/seo';

interface UseSEOOptions {
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
}

export function useSEO(options: UseSEOOptions = {}) {
  const { config, loading } = useSiteConfig();

  const seoData = useMemo(() => {
    if (loading) return null;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const siteName = config.branding.siteName || 'My Personal Blog';
    const siteDescription = config.seo?.metaDescription || 'A personal blog sharing insights and experiences';
    
    const seoConfig: SEOConfig = {
      title: options.title || siteName,
      description: options.description || siteDescription,
      keywords: [
        ...(options.keywords || []),
        ...(options.tags || []),
        ...(config.seo?.keywords || [])
      ].filter((keyword, index, array) => array.indexOf(keyword) === index),
      image: options.image,
      url: options.url,
      type: options.type || 'website',
      publishedTime: options.publishedTime,
      modifiedTime: options.modifiedTime,
      author: options.author,
      tags: options.tags,
      siteName,
    };

    const metadata = seoManager.generateMetadata(seoConfig);
    
    const structuredData = {
      website: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        url: baseUrl,
        description: siteDescription,
        publisher: {
          '@type': 'Organization',
          name: siteName,
          url: baseUrl,
          logo: config.branding.logo ? {
            '@type': 'ImageObject',
            url: config.branding.logo,
          } : undefined,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      organization: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteName,
        url: baseUrl,
        description: siteDescription,
        logo: config.branding.logo ? {
          '@type': 'ImageObject',
          url: config.branding.logo,
        } : undefined,
      },
    };

    // Add article structured data if it's an article
    if (options.type === 'article' && options.title) {
      const articleUrl = options.url ? `${baseUrl}${options.url}` : baseUrl;
      const imageUrl = options.image 
        ? (options.image.startsWith('http') ? options.image : `${baseUrl}${options.image}`)
        : undefined;

      (structuredData as any).article = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: options.title,
        description: options.description || options.title,
        image: imageUrl ? [imageUrl] : [],
        datePublished: options.publishedTime || new Date().toISOString(),
        dateModified: options.modifiedTime || options.publishedTime || new Date().toISOString(),
        author: {
          '@type': 'Person',
          name: options.author || 'Blog Author',
          url: baseUrl,
        },
        publisher: {
          '@type': 'Organization',
          name: siteName,
          url: baseUrl,
          logo: config.branding.logo ? {
            '@type': 'ImageObject',
            url: config.branding.logo,
          } : undefined,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': articleUrl,
        },
        url: articleUrl,
        articleSection: options.tags?.[0] || 'Blog',
        keywords: options.tags?.join(', ') || '',
        inLanguage: 'en-US',
      };
    }

    return {
      metadata,
      structuredData,
      config: seoConfig,
      siteName,
      baseUrl,
    };
  }, [config, loading, options]);

  return {
    ...seoData,
    loading,
  };
}

// Hook for article SEO
export function useArticleSEO(article: {
  title: string;
  excerpt?: string;
  featuredImage?: string;
  slug: string;
  publishedAt?: any;
  updatedAt?: any;
  tags: string[];
  category?: { name: string };
  author?: string;
  readingTime?: number;
}) {
  const publishedTime = article.publishedAt 
    ? new Date(article.publishedAt.seconds * 1000).toISOString()
    : undefined;
  
  const modifiedTime = article.updatedAt 
    ? new Date(article.updatedAt.seconds * 1000).toISOString()
    : undefined;

  return useSEO({
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

// Hook for category SEO
export function useCategorySEO(category: {
  name: string;
  description?: string;
  slug: string;
}) {
  return useSEO({
    title: `${category.name} Articles`,
    description: category.description || `Browse all articles in the ${category.name} category`,
    url: `/category/${category.slug}`,
    keywords: [category.name, 'articles', 'blog', 'category'],
  });
}

// Hook for search SEO
export function useSearchSEO(query: string, resultsCount: number) {
  return useSEO({
    title: `Search Results for "${query}"`,
    description: `Found ${resultsCount} articles matching "${query}"`,
    url: `/search?q=${encodeURIComponent(query)}`,
    keywords: [query, 'search', 'articles', 'blog'],
  });
}

// Utility function to validate SEO data
export function validateSEO(config: SEOConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.title) {
    errors.push('Title is required');
  } else if (config.title.length > 60) {
    errors.push('Title should be 60 characters or less for optimal SEO');
  }
  
  if (!config.description) {
    errors.push('Description is required');
  } else if (config.description.length > 160) {
    errors.push('Description should be 160 characters or less for optimal SEO');
  } else if (config.description.length < 120) {
    errors.push('Description should be at least 120 characters for better SEO');
  }
  
  if (config.keywords && config.keywords.length > 10) {
    errors.push('Too many keywords (max 10 recommended)');
  }
  
  if (config.title && config.description && config.title.toLowerCase() === config.description.toLowerCase()) {
    errors.push('Title and description should be different');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}