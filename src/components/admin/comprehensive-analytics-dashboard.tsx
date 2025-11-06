'use client';

import { useState, useEffect } from 'react';
import { enhancedAnalyticsService, AnalyticsDashboardData, RealTimeVisitor } from '@/lib/analytics-enhanced';

interface ComprehensiveAnalyticsDashboardProps {
  className?: string;
}

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

const DATE_RANGES: DateRange[] = [
  {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 24 Hours'
  },
  {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 7 Days'
  },
  {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 30 Days'
  }
];

export function ComprehensiveAnalyticsDashboard({ className = '' }: ComprehensiveAnalyticsDashboardProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>(DATE_RANGES[1]);
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardData | null>(null);
  const [realTimeVisitors, setRealTimeVisitors] = useState<RealTimeVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'trending' | 'realtime'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, [selectedRange]);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = enhancedAnalyticsService.subscribeToRealTimeUpdates((visitors) => {
      setRealTimeVisitors(visitors);
    });

    // Cleanup old real-time data periodically
    const cleanupInterval = setInterval(() => {
      enhancedAnalyticsService.cleanupRealTimeData();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => {
      unsubscribe();
      clearInterval(cleanupInterval);
    };
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await enhancedAnalyticsService.getDashboardData(selectedRange);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  if (loading && !dashboardData) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">
          Comprehensive Analytics
        </h1>
        
        {/* Date Range Selector */}
        <div className="flex items-center space-x-2">
          <label htmlFor="dateRange" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Period:
          </label>
          <select
            id="dateRange"
            value={DATE_RANGES.findIndex(range => range.label === selectedRange.label)}
            onChange={(e) => setSelectedRange(DATE_RANGES[parseInt(e.target.value)])}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            {DATE_RANGES.map((range, index) => (
              <option key={index} value={index}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'articles', label: 'Top Articles' },
            { id: 'trending', label: 'Trending' },
            { id: 'realtime', label: `Real-time (${realTimeVisitors.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>     
 {/* Overview Tab */}
      {activeTab === 'overview' && dashboardData && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Page Views</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatNumber(dashboardData.overview.totalPageViews)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Visitors</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatNumber(dashboardData.overview.uniqueVisitors)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Session</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatDuration(dashboardData.overview.averageSessionDuration)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bounce Rate</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatPercentage(dashboardData.overview.bounceRate)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Live Visitors</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {dashboardData.overview.realTimeVisitors}
                  </p>
                </div>
              </div>
            </div>
          </div>    
      {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Pages */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Pages</h3>
              <div className="space-y-3">
                {dashboardData.topPages.slice(0, 5).map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {page.title || (page.page === '/' ? 'Homepage' : page.page)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {page.uniqueViews} unique • {formatDuration(page.averageTime)} avg time
                      </p>
                    </div>
                    <div className="ml-4 flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${dashboardData.topPages.length > 0 ? (page.views / dashboardData.topPages[0].views) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                        {formatNumber(page.views)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Traffic Sources</h3>
              <div className="space-y-3">
                {dashboardData.trafficSources.slice(0, 5).map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {source.source}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: `${source.percentage}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 w-16 text-right">
                        {formatNumber(source.visits)} ({formatPercentage(source.percentage)})
                      </span>
                    </div>
                  </div>
                ))}
                {dashboardData.trafficSources.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No referrer data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Device Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(dashboardData.deviceBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([device, count], index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {formatNumber(count)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {device}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}      {
/* Top Articles Tab */}
      {activeTab === 'articles' && dashboardData && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Performing Articles</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Engagement Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {dashboardData.topArticles.map((article, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {article.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        /{article.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatNumber(article.views)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {article.engagementScore.toFixed(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={`/articles/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Article
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trending Tab */}
      {activeTab === 'trending' && dashboardData && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Trending Content
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.trendingContent.map((content, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {content.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Rank #{content.trendingRank}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        🔥 Trending
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">24h views:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatNumber(content.views24h)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">7d views:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatNumber(content.views7d)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Growth:</span>
                      <span className={`font-medium ${content.viewsGrowth > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                        {content.viewsGrowth > 0 ? '+' : ''}{formatPercentage(content.viewsGrowth)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <a
                      href={`/articles/${content.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View Article →
                    </a>
                  </div>
                </div>
              ))}
            </div>
            {dashboardData.trendingContent.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No trending content at the moment
              </p>
            )}
          </div>
        </div>
      )}  
    {/* Real-time Tab */}
      {activeTab === 'realtime' && (
        <div className="space-y-6">
          {/* Real-time Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Visitors</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {realTimeVisitors.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pages Being Viewed</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {dashboardData?.realTimeData.currentPageViews.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-lg font-semibold text-green-600">
                    Live
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Visitors List */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Visitors</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Current Page
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Session Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pages Viewed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {realTimeVisitors.map((visitor, index) => {
                    const sessionDuration = visitor.sessionStart 
                      ? Math.floor((Date.now() - visitor.sessionStart.toDate().getTime()) / 1000)
                      : 0;
                    
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {visitor.currentPage === '/' ? 'Homepage' : visitor.currentPage}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {visitor.device || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {visitor.browser || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {visitor.country || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatDuration(sessionDuration)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {visitor.pagesViewed}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {realTimeVisitors.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No active visitors at the moment</p>
                </div>
              )}
            </div>
          </div>

          {/* Current Page Views */}
          {dashboardData?.realTimeData.currentPageViews && dashboardData.realTimeData.currentPageViews.length > 0 && (
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Pages Being Viewed Right Now
              </h3>
              <div className="space-y-3">
                {dashboardData.realTimeData.currentPageViews.map((pageView, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {pageView.page === '/' ? 'Homepage' : pageView.page}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(pageView.viewers / Math.max(...dashboardData.realTimeData.currentPageViews.map(pv => pv.viewers))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                        {pageView.viewers}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}