import { NextRequest, NextResponse } from 'next/server';
import { analyticsDataService } from '@/lib/analytics-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type') || 'summary';

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    switch (type) {
      case 'summary':
        const summary = await analyticsDataService.getAnalyticsSummary(start, end);
        return NextResponse.json({
          success: true,
          data: summary,
        });

      case 'articles':
        const articles = await analyticsDataService.getArticleAnalytics();
        return NextResponse.json({
          success: true,
          data: articles,
        });

      case 'popular':
        const limit = parseInt(searchParams.get('limit') || '10');
        const popular = await analyticsDataService.getPopularArticles(limit);
        return NextResponse.json({
          success: true,
          data: popular,
        });

      case 'realtime':
        const realtime = await analyticsDataService.getRealTimeMetrics();
        return NextResponse.json({
          success: true,
          data: realtime,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid analytics type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}