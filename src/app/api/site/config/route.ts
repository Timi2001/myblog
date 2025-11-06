import { NextRequest, NextResponse } from 'next/server';
import { siteConfigService } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const [branding, seo, theme, layout] = await Promise.all([
      siteConfigService.getBranding(),
      siteConfigService.getSeo(),
      siteConfigService.getTheme(),
      siteConfigService.getLayout(),
    ]);

    // Return public configuration data
    const config = {
      branding: {
        siteName: branding?.siteName || 'My Personal Blog',
        tagline: branding?.tagline || 'Sharing thoughts and experiences',
        logo: branding?.logo,
        favicon: branding?.favicon,
      },
      seo: {
        metaTitle: seo?.metaTitle || 'My Personal Blog',
        metaDescription: seo?.metaDescription || 'A personal blog sharing insights, experiences, and knowledge',
        keywords: seo?.keywords || ['blog', 'personal', 'writing', 'technology'],
        googleAnalyticsId: seo?.googleAnalyticsId,
      },
      theme: {
        primaryColor: theme?.primaryColor || '#3B82F6',
        secondaryColor: theme?.secondaryColor || '#1F2937',
        fontFamily: theme?.fontFamily || 'Inter',
        headerStyle: theme?.headerStyle || 'modern',
        layoutStyle: theme?.layoutStyle || 'grid',
      },
      layout: {
        showSidebar: layout?.showSidebar ?? true,
        sidebarPosition: layout?.sidebarPosition || 'right',
        articlesPerPage: layout?.articlesPerPage || 10,
        showAuthorBio: layout?.showAuthorBio ?? true,
        showRelatedPosts: layout?.showRelatedPosts ?? true,
      },
    };

    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching site configuration:', error);
    
    // Return default configuration on error
    const defaultConfig = {
      branding: {
        siteName: 'My Personal Blog',
        tagline: 'Sharing thoughts and experiences',
      },
      seo: {
        metaTitle: 'My Personal Blog',
        metaDescription: 'A personal blog sharing insights, experiences, and knowledge',
        keywords: ['blog', 'personal', 'writing', 'technology'],
      },
      theme: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1F2937',
        fontFamily: 'Inter',
        headerStyle: 'modern',
        layoutStyle: 'grid',
      },
      layout: {
        showSidebar: true,
        sidebarPosition: 'right',
        articlesPerPage: 10,
        showAuthorBio: true,
        showRelatedPosts: true,
      },
    };

    return NextResponse.json({
      success: true,
      data: defaultConfig
    });
  }
}