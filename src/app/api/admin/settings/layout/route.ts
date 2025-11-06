import { NextRequest, NextResponse } from 'next/server';
import { siteConfigService } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const layout = await siteConfigService.getLayout();
    
    return NextResponse.json({
      success: true,
      data: layout
    });
  } catch (error) {
    console.error('Error fetching layout settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch layout settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate sidebar position
    const validSidebarPositions = ['left', 'right'];
    if (body.sidebarPosition && !validSidebarPositions.includes(body.sidebarPosition)) {
      return NextResponse.json(
        { success: false, error: 'Invalid sidebar position' },
        { status: 400 }
      );
    }

    // Validate articles per page
    if (body.articlesPerPage && (body.articlesPerPage < 1 || body.articlesPerPage > 50)) {
      return NextResponse.json(
        { success: false, error: 'Articles per page must be between 1 and 50' },
        { status: 400 }
      );
    }

    await siteConfigService.updateLayout({
      showSidebar: body.showSidebar,
      sidebarPosition: body.sidebarPosition,
      articlesPerPage: body.articlesPerPage,
      showAuthorBio: body.showAuthorBio,
      showRelatedPosts: body.showRelatedPosts,
    });

    return NextResponse.json({
      success: true,
      message: 'Layout settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating layout settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update layout settings' },
      { status: 500 }
    );
  }
}