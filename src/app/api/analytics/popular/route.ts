import { NextRequest, NextResponse } from 'next/server';
import { enhancedAnalyticsService } from '@/lib/analytics-enhanced';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as '24h' | '7d' | '30d' | 'all' || '7d';
    const limit = parseInt(searchParams.get('limit') || '10');

    const popularArticles = await enhancedAnalyticsService.getPopularArticles(period, limit);

    return NextResponse.json({
      success: true,
      data: popularArticles,
    });
  } catch (error) {
    console.error('Error fetching popular articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch popular articles' },
      { status: 500 }
    );
  }
}