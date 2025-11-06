import { NextRequest, NextResponse } from 'next/server';
import { siteConfigService } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const branding = await siteConfigService.getBranding();
    
    return NextResponse.json({
      success: true,
      data: branding
    });
  } catch (error) {
    console.error('Error fetching branding settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch branding settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.siteName || !body.tagline) {
      return NextResponse.json(
        { success: false, error: 'Site name and tagline are required' },
        { status: 400 }
      );
    }

    await siteConfigService.updateBranding({
      siteName: body.siteName,
      tagline: body.tagline,
      logo: body.logo,
      favicon: body.favicon,
    });

    return NextResponse.json({
      success: true,
      message: 'Branding settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating branding settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update branding settings' },
      { status: 500 }
    );
  }
}