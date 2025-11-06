import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Different robots.txt for production vs development
  const robotsTxt = isProduction ? `User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Disallow search and filter pages with parameters
Disallow: /search?*
Disallow: /*?page=*
Disallow: /*?filter=*

# Allow important SEO files
Allow: /sitemap.xml
Allow: /rss.xml
Allow: /atom.xml
Allow: /feed.json
Allow: /robots.txt
Allow: /favicon.ico
Allow: /*.css
Allow: /*.js

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay for respectful crawling
Crawl-delay: 1

# Specific rules for major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 2` : `# Development environment - disallow all crawling
User-agent: *
Disallow: /

# Allow only essential files for testing
Allow: /robots.txt
Allow: /sitemap.xml`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': isProduction 
        ? 'public, max-age=86400, s-maxage=86400' // 24 hours in production
        : 'no-cache, no-store, must-revalidate', // No cache in development
    },
  });
}