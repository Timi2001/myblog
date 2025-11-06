import { NextRequest, NextResponse } from 'next/server';
import { siteConfigService } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const seo = await siteConfigService.getSeo();
    
    return NextResponse.json({
      success: true,
      data: seo
    });
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SEO settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.metaTitle || !body.metaDescription) {
      return NextResponse.json(
        { success: false, error: 'Meta title and description are required' },
        { status: 400 }
      );
    }

    // Validate meta description length (recommended max 160 characters)
    if (body.metaDescription.length > 160) {
      return NextResponse.json(
        { success: false, error: 'Meta description should be 160 characters or less' },
        { status: 400 }
      );
    }

    // Process keywords
    let keywords = [];
    if (body.keywords) {
      if (Array.isArray(body.keywords)) {
        keywords = body.keywords;
      } else if (typeof body.keywords === 'string') {
        keywords = body.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k);
      }
    }

    await siteConfigService.updateSeo({
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      keywords: keywords,
      googleAnalyticsId: body.googleAnalyticsId,
    });

    return NextResponse.json({
      success: true,
      message: 'SEO settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating SEO settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update SEO settings' },
      { status: 500 }
    );
  }
}