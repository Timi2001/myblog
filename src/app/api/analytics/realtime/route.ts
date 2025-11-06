import { NextRequest, NextResponse } from 'next/server';
import { enhancedAnalyticsService } from '@/lib/analytics-enhanced';

export async function GET(request: NextRequest) {
  try {
    const realTimeVisitors = await enhancedAnalyticsService.getRealTimeVisitors();

    return NextResponse.json({
      success: true,
      data: {
        visitors: realTimeVisitors,
        count: realTimeVisitors.length,
      },
    });
  } catch (error) {
    console.error('Error fetching real-time visitors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch real-time visitors' },
      { status: 500 }
    );
  }
}