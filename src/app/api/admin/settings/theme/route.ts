import { NextRequest, NextResponse } from 'next/server';
import { siteConfigService } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const theme = await siteConfigService.getTheme();
    
    return NextResponse.json({
      success: true,
      data: theme
    });
  } catch (error) {
    console.error('Error fetching theme settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch theme settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate color format (basic hex validation)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (body.primaryColor && !hexColorRegex.test(body.primaryColor)) {
      return NextResponse.json(
        { success: false, error: 'Invalid primary color format' },
        { status: 400 }
      );
    }
    
    if (body.secondaryColor && !hexColorRegex.test(body.secondaryColor)) {
      return NextResponse.json(
        { success: false, error: 'Invalid secondary color format' },
        { status: 400 }
      );
    }

    // Validate enum values
    const validHeaderStyles = ['modern', 'classic', 'minimal'];
    const validLayoutStyles = ['grid', 'list', 'masonry'];
    
    if (body.headerStyle && !validHeaderStyles.includes(body.headerStyle)) {
      return NextResponse.json(
        { success: false, error: 'Invalid header style' },
        { status: 400 }
      );
    }
    
    if (body.layoutStyle && !validLayoutStyles.includes(body.layoutStyle)) {
      return NextResponse.json(
        { success: false, error: 'Invalid layout style' },
        { status: 400 }
      );
    }

    await siteConfigService.updateTheme({
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      fontFamily: body.fontFamily,
      headerStyle: body.headerStyle,
      layoutStyle: body.layoutStyle,
    });

    return NextResponse.json({
      success: true,
      message: 'Theme settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating theme settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update theme settings' },
      { status: 500 }
    );
  }
}