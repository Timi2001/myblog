import { NextRequest, NextResponse } from 'next/server';
import { articleService } from '@/lib/firestore';
import { siteConfigService } from '@/lib/firestore';
import { generateAtom10, RSSChannel } from '@/lib/rss-utils';

// Atom feed generation
export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Fetch site configuration and articles
    const [brandingConfig, seoConfig, allArticles] = await Promise.all([
      siteConfigService.getBranding(),
      siteConfigService.getSeo(),
      articleService.getAll('published') // Get all published articles
    ]);

    const articles = allArticles.slice(0, 50) || []; // Limit to 50 most recent articles
    
    // Site information
    const siteName = brandingConfig?.siteName || 'My Personal Blog';
    const siteDescription = seoConfig?.metaDescription || 'A personal blog sharing insights, experiences, and knowledge';
    const siteUrl = baseUrl;
    
    // Prepare RSS channel data for Atom conversion
    const rssChannel: RSSChannel = {
      title: siteName,
      description: siteDescription,
      link: siteUrl,
      feedUrl: `${siteUrl}/atom.xml`,
      language: 'en-US',
      copyright: `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`,
      managingEditor: 'Blog Author',
      webMaster: 'webmaster@example.com',
      items: articles.map((article: any) => ({
        title: article.title,
        description: article.excerpt || article.title,
        link: `${siteUrl}/articles/${article.slug}`,
        guid: `${siteUrl}/articles/${article.slug}`,
        pubDate: article.publishedAt 
          ? new Date(article.publishedAt.seconds * 1000)
          : new Date(article.createdAt.seconds * 1000),
        author: 'Blog Author',
        category: article.category?.name || 'Blog',
        content: article.content,
        enclosure: article.featuredImage ? {
          url: article.featuredImage,
          type: 'image/jpeg',
          length: '0'
        } : undefined
      }))
    };

    // Generate Atom XML using utility function
    const atomXml = generateAtom10(rssChannel);

    return new NextResponse(atomXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating Atom feed:', error);
    return new NextResponse('Error generating Atom feed', { status: 500 });
  }
}

