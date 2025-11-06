'use client';

import React from 'react';
import { 
  ChartBarIcon as BarChart3,
  ArrowTrendingUpIcon as TrendingUp,
  UsersIcon as Users,
  EyeIcon as Eye,
  ClockIcon as Clock,
  ExclamationCircleIcon as AlertCircle,
  ArrowPathIcon as RefreshCw,
  WifiIcon as Wifi,
  NoSymbolIcon as WifiOff
} from '@heroicons/react/24/outline';

interface FallbackProps {
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  type?: 'loading' | 'error' | 'offline' | 'empty';
}

/**
 * Generic analytics fallback component
 */
export function AnalyticsFallback({ 
  title = "Analytics Unavailable",
  message = "Unable to load analytics data at the moment.",
  showRetry = true,
  onRetry,
  type = 'error'
}: FallbackProps) {
  const getIcon = () => {
    switch (type) {
      case 'loading':
        return <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />;
      case 'offline':
        return <WifiOff className="h-8 w-8 text-gray-400" />;
      case 'empty':
        return <BarChart3 className="h-8 w-8 text-gray-400" />;
      default:
        return <AlertCircle className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'loading':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'offline':
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
      case 'empty':
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
      default:
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    }
  };

  return (
    <div className={`p-6 rounded-lg border ${getColors()}`}>
      <div className="text-center">
        <div className="flex justify-center mb-3">
          {getIcon()}
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {message}
        </p>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Fallback for analytics overview cards
 */
export function AnalyticsOverviewFallback() {
  const cards = [
    { icon: Eye, label: 'Page Views', color: 'blue' },
    { icon: Users, label: 'Visitors', color: 'green' },
    { icon: Clock, label: 'Avg. Session', color: 'purple' },
    { icon: TrendingUp, label: 'Bounce Rate', color: 'orange' },
    { icon: Wifi, label: 'Real-time', color: 'red' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.label}
              </p>
              <div className="mt-2 flex items-center">
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className={`p-2 bg-${card.color}-100 dark:bg-${card.color}-900/20 rounded-lg`}>
              <card.icon className={`h-5 w-5 text-${card.color}-600 dark:text-${card.color}-400`} />
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Fallback for analytics charts
 */
export function AnalyticsChartFallback({ 
  title = "Chart", 
  height = "h-64" 
}: { 
  title?: string; 
  height?: string; 
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div className={`${height} bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chart data unavailable
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Fallback for analytics tables
 */
export function AnalyticsTableFallback({ 
  title = "Data Table",
  rows = 5 
}: { 
  title?: string; 
  rows?: number; 
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Table data temporarily unavailable
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Fallback for real-time analytics
 */
export function RealTimeAnalyticsFallback() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Real-time Activity
        </h3>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Offline</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Active Visitors</span>
          <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Pages</h4>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between py-1">
              <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-3 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          Real-time data will resume when connection is restored
        </p>
      </div>
    </div>
  );
}

/**
 * Comprehensive analytics dashboard fallback
 */
export function AnalyticsDashboardFallback({ 
  onRetry 
}: { 
  onRetry?: () => void 
}) {
  return (
    <div className="space-y-6">
      {/* Overview Cards Fallback */}
      <AnalyticsOverviewFallback />
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-6">
          <AnalyticsChartFallback title="Page Views Over Time" height="h-80" />
          <AnalyticsChartFallback title="Traffic Sources" height="h-64" />
        </div>
        
        {/* Sidebar Column */}
        <div className="space-y-6">
          <RealTimeAnalyticsFallback />
          <AnalyticsTableFallback title="Top Pages" rows={5} />
          <AnalyticsTableFallback title="Popular Articles" rows={3} />
        </div>
      </div>
      
      {/* Retry Section */}
      {onRetry && (
        <div className="text-center py-8">
          <AnalyticsFallback
            title="Analytics Dashboard Unavailable"
            message="The analytics service is temporarily unavailable. The admin panel continues to work normally for all other features."
            showRetry={true}
            onRetry={onRetry}
            type="error"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Minimal analytics widget fallback
 */
export function AnalyticsWidgetFallback({ 
  widgetName,
  compact = false 
}: { 
  widgetName: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div className="text-center">
          <BarChart3 className="h-4 w-4 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {widgetName} unavailable
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
      <div className="text-center">
        <BarChart3 className="h-6 w-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {widgetName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Temporarily unavailable
        </p>
      </div>
    </div>
  );
}