'use client';

import { useState, useEffect } from 'react';
import { analyticsDataService, AnalyticsSummary, ArticleAnalytics } from '@/lib/analytics-data';

interface AnalyticsDashboardProps {
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
  },
  {
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 90 Days'
  }
];

export function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>(DATE_RANGES[1]); // Default to last 7 days
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [articleAnalytics, setArticleAnalytics] = useState<ArticleAnalytics[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'realtime'>('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedRange]);

  useEffect(() => {
    // Load real-time metrics and set up auto-refresh
    loadRealTimeMetrics();
    const interval = setInterval(loadRealTimeMetrics, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [summaryData, articlesData] = await Promise.all([
        analyticsDataService.getAnalyticsSummary(selectedRange.start, selectedRange.end),
        analyticsDataService.getArticleAnalytics()
      ]);

      setSummary(summaryData);
      setArticleAnalytics(articlesData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeMetrics = async () => {
    try {
      const metrics = await analyticsDataService.getRealTimeMetrics();
      setRealTimeMetrics(metrics);
    } catch (error) {
      console.error('Error loading real-time metrics:', error);
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

  if (loading && !summary) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
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
          Analytics Dashboard
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
            { id: 'articles', label: 'Articles' },
            { id: 'realtime', label: 'Real-time' }
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
      {activeTab === 'overview' && summary && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    {formatNumber(summary.totalPageViews)}
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
                    {formatNumber(summary.uniqueVisitors)}
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
                    {formatDuration(summary.averageSessionDuration)}
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
                    {summary.bounceRate.toFixed(1)}%
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
                {summary.topPages.slice(0, 5).map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {page.page === '/' ? 'Homepage' : page.page}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(page.views / summary.topPages[0].views) * 100}%` 
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

            {/* Top Referrers */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Referrers</h3>
              <div className="space-y-3">
                {summary.topReferrers.slice(0, 5).map((referrer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {new URL(referrer.referrer).hostname}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(referrer.visits / summary.topReferrers[0].visits) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                        {formatNumber(referrer.visits)}
                      </span>
                    </div>
                  </div>
                ))}
                {summary.topReferrers.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No referrer data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Device and Country Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Device Breakdown */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Device Types</h3>
              <div className="space-y-3">
                {Object.entries(summary.deviceBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([device, count], index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {device}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(count / Object.values(summary.deviceBreakdown)[0]) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                          {formatNumber(count)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Country Breakdown */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Countries</h3>
              <div className="space-y-3">
                {Object.entries(summary.countryBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([country, count], index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {country}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                          <div 
                            className="bg-orange-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(count / Object.values(summary.countryBreakdown)[0]) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                          {formatNumber(count)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Articles Tab */}
      {activeTab === 'articles' && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Article Performance</h3>
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
                    Avg. Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Shares
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Comments
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {articleAnalytics.slice(0, 10).map((article, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Article {article.articleId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatNumber(article.views)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDuration(article.averageTimeSpent)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatNumber(article.socialShares)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatNumber(article.comments)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Real-time Tab */}
      {activeTab === 'realtime' && realTimeMetrics && (
        <div className="space-y-8">
          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {realTimeMetrics.activeUsers}
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
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Views (24h)</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatNumber(realTimeMetrics.pageViewsLast24h)}
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
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Trending</p>
                  <p className="text-lg font-semibold text-green-600">
                    {realTimeMetrics.pageViewsLast24h > 0 ? '↗' : '→'} Live
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Pages (Real-time) */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Top Pages (Last 24 Hours)
            </h3>
            <div className="space-y-3">
              {realTimeMetrics.topPagesLast24h.map((page: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {page.page === '/' ? 'Homepage' : page.page}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${realTimeMetrics.topPagesLast24h.length > 0 ? (page.views / realTimeMetrics.topPagesLast24h[0].views) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                      {formatNumber(page.views)}
                    </span>
                  </div>
                </div>
              ))}
              {realTimeMetrics.topPagesLast24h.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}