import { NextRequest, NextResponse } from 'next/server';
import { enhancedAnalyticsService } from '@/lib/analytics-enhanced';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const trendingContent = await enhancedAnalyticsService.getTrendingContent(limit);

    return NextResponse.json({
      success: true,
      data: trendingContent,
    });
  } catch (error) {
    console.error('Error fetching trending content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trending content' },
      { status: 500 }
    );
  }
}