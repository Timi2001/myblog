import { Metadata } from 'next';
import { siteConfigService } from './firestore';

export async function generateSiteMetadata(
  title?: string,
  description?: string,
  image?: string,
  url?: string,
  type: 'website' | 'article' = 'website',
  publishedTime?: string,
  modifiedTime?: string,
  author?: string,
  tags?: string[]
): Promise<Metadata> {
  try {
    const [branding, seo] = await Promise.all([
      siteConfigService.getBranding(),
      siteConfigService.getSeo(),
    ]);

    const siteName = branding?.siteName || 'My Personal Blog';
    const siteDescription = seo?.metaDescription || 'A personal blog sharing insights, experiences, and knowledge';
    const keywords = seo?.keywords || ['blog', 'personal', 'writing', 'technology'];

    const metaTitle = title ? `${title} | ${siteName}` : (seo?.metaTitle || siteName);
    const metaDescription = description || siteDescription;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
    const imageUrl = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : undefined;

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: keywords.join(', '),
      authors: author ? [{ name: author }] : [{ name: siteName }],
      creator: author || siteName,
      publisher: siteName,
      
      // Open Graph tags
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        siteName: siteName,
        type: type,
        url: fullUrl,
        locale: 'en_US',
        images: imageUrl ? [{
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title || siteName,
          type: 'image/jpeg',
        }] : [],
        ...(type === 'article' && {
          publishedTime: publishedTime,
          modifiedTime: modifiedTime,
          authors: author ? [author] : [siteName],
          tags: tags,
        }),
      },
      
      // Twitter Card tags
      twitter: {
        card: 'summary_large_image',
        site: '@yourblog', // You can make this configurable
        creator: author ? `@${author.replace(/\s+/g, '').toLowerCase()}` : '@yourblog',
        title: metaTitle,
        description: metaDescription,
        images: imageUrl ? [{
          url: imageUrl,
          alt: title || siteName,
        }] : [],
      },
      
      // Additional meta tags
      other: {
        // Facebook App ID (optional)
        'fb:app_id': process.env.FACEBOOK_APP_ID || '',
        
        // Article specific tags
        ...(type === 'article' && {
          'article:author': author || siteName,
          'article:published_time': publishedTime,
          'article:modified_time': modifiedTime,
          'article:section': tags?.[0] || 'Blog',
          'article:tag': tags?.join(', ') || '',
        }),
        
        // Additional SEO tags
        'theme-color': '#3b82f6',
        'msapplication-TileColor': '#3b82f6',
        'msapplication-config': '/browserconfig.xml',
        
        // Canonical URL
        'canonical': fullUrl,
        
        // Language and locale
        'language': 'en-US',
        'content-language': 'en-US',
        
        // Mobile optimization
        'viewport': 'width=device-width, initial-scale=1, shrink-to-fit=no',
        'format-detection': 'telephone=no',
        
        // Security headers
        'referrer': 'strict-origin-when-cross-origin',
        
        // RSS feed discovery
        'alternate': 'application/rss+xml',
        'rss': `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/rss.xml`,
        
        // Sitemap reference
        'sitemap': `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/sitemap.xml`,
        
        // Dublin Core metadata
        'DC.title': metaTitle,
        'DC.description': metaDescription,
        'DC.creator': author || siteName,
        'DC.language': 'en-US',
        'DC.format': 'text/html',
        'DC.type': type === 'article' ? 'Text' : 'Collection',
        
        // Schema.org microdata
        'itemscope': '',
        'itemtype': type === 'article' 
          ? 'https://schema.org/Article' 
          : 'https://schema.org/WebSite',
      },
      
      // Robots and indexing
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
      
      // Verification tags (you can add these to environment variables)
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
        yandex: process.env.YANDEX_VERIFICATION,
        yahoo: process.env.YAHOO_VERIFICATION,
        other: {
          'msvalidate.01': process.env.BING_VERIFICATION || '',
        },
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    
    // Return default metadata on error
    const defaultTitle = title ? `${title} | My Personal Blog` : 'My Personal Blog';
    const defaultDescription = description || 'A personal blog sharing insights, experiences, and knowledge';

    return {
      title: defaultTitle,
      description: defaultDescription,
      keywords: 'blog, personal, writing, technology',
      openGraph: {
        title: defaultTitle,
        description: defaultDescription,
        siteName: 'My Personal Blog',
        type: 'website',
        url: url,
        images: image ? [{ url: image, alt: title || 'My Personal Blog' }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: defaultTitle,
        description: defaultDescription,
        images: image ? [image] : [],
      },
    };
  }
}

export async function getDefaultSiteMetadata(): Promise<Metadata> {
  return generateSiteMetadata();
}

export async function generateArticleMetadata(
  article: {
    title: string;
    excerpt?: string;
    featuredImage?: string;
    slug: string;
    publishedAt?: any;
    updatedAt?: any;
    tags: string[];
    category?: { name: string };
  },
  author?: string
): Promise<Metadata> {
  const publishedTime = article.publishedAt 
    ? new Date(article.publishedAt.seconds * 1000).toISOString()
    : undefined;
  
  const modifiedTime = article.updatedAt 
    ? new Date(article.updatedAt.seconds * 1000).toISOString()
    : undefined;

  return generateSiteMetadata(
    article.title,
    article.excerpt,
    article.featuredImage,
    `/articles/${article.slug}`,
    'article',
    publishedTime,
    modifiedTime,
    author,
    article.tags
  );
}

export async function generateCategoryMetadata(
  category: {
    name: string;
    description?: string;
    slug: string;
  }
): Promise<Metadata> {
  return generateSiteMetadata(
    `${category.name} Articles`,
    category.description || `Browse all articles in the ${category.name} category`,
    undefined,
    `/category/${category.slug}`,
    'website'
  );
}

export async function generateSearchMetadata(
  query: string,
  resultsCount: number
): Promise<Metadata> {
  return generateSiteMetadata(
    `Search Results for "${query}"`,
    `Found ${resultsCount} articles matching "${query}"`,
    undefined,
    `/search?q=${encodeURIComponent(query)}`,
    'website'
  );
}