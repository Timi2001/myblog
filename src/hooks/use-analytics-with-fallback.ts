'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { analyticsDataService } from '@/lib/analytics-data';
import { enhancedAnalyticsService } from '@/lib/analytics-enhanced';
import { analyticsCircuitBreaker } from '@/lib/analytics-retry';
import { handleError } from '@/lib/error-handling';

interface AnalyticsState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  retryCount: number;
  isStale: boolean;
}

interface UseAnalyticsOptions {
  refreshInterval?: number;
  maxRetries?: number;
  staleTime?: number;
  fallbackData?: any;
  enableCache?: boolean;
}

/**
 * Hook for analytics data with graceful degradation and fallback states
 */
export function useAnalyticsWithFallback<T>(
  fetchFunction: () => Promise<T>,
  options: UseAnalyticsOptions = {}
) {
  const {
    refreshInterval = 30000, // 30 seconds
    maxRetries = 3,
    staleTime = 300000, // 5 minutes
    fallbackData = null,
    enableCache = true,
  } = options;

  const [state, setState] = useState<AnalyticsState<T>>({
    data: fallbackData,
    loading: true,
    error: null,
    lastUpdated: null,
    retryCount: 0,
    isStale: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (isRetry = false) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      // Check cache first
      if (enableCache && cacheRef.current) {
        const cacheAge = Date.now() - cacheRef.current.timestamp;
        if (cacheAge < staleTime) {
          setState(prev => ({
            ...prev,
            data: cacheRef.current!.data,
            loading: false,
            error: null,
            isStale: cacheAge > staleTime / 2, // Mark as stale if older than half the stale time
          }));
          return;
        }
      }

      if (!isRetry) {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }

      const data = await fetchFunction();
      
      // Update cache
      if (enableCache) {
        cacheRef.current = { data, timestamp: Date.now() };
      }

      setState(prev => ({
        ...prev,
        data,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        retryCount: 0,
        isStale: false,
      }));

    } catch (error) {
      const err = error as Error;
      
      // Don't update state if request was aborted
      if (err.name === 'AbortError') {
        return;
      }

      handleError(err, {
        context: 'analytics-hook',
        isRetry,
        retryCount: state.retryCount,
      });

      setState(prev => {
        const newRetryCount = prev.retryCount + 1;
        
        return {
          ...prev,
          loading: false,
          error: err,
          retryCount: newRetryCount,
          // Keep existing data if available, even if stale
          data: prev.data || fallbackData,
          isStale: true,
        };
      });

      // Auto-retry if under limit and error is retryable
      if (state.retryCount < maxRetries && isRetryableError(err)) {
        const delay = Math.min(1000 * Math.pow(2, state.retryCount), 10000);
        setTimeout(() => fetchData(true), delay);
      }
    }
  }, [fetchFunction, enableCache, staleTime, fallbackData, maxRetries, state.retryCount]);

  const retry = useCallback(() => {
    setState(prev => ({ ...prev, retryCount: 0 }));
    fetchData(false);
  }, [fetchData]);

  const refresh = useCallback(() => {
    // Clear cache to force fresh data
    if (cacheRef.current) {
      cacheRef.current = null;
    }
    fetchData(false);
  }, [fetchData]);

  // Initial fetch and setup interval
  useEffect(() => {
    fetchData(false);

    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        // Only auto-refresh if not in error state or circuit breaker is closed
        const circuitState = analyticsCircuitBreaker.getState();
        if (!state.error && circuitState.state !== 'open') {
          fetchData(false);
        }
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, refreshInterval, state.error]);

  return {
    ...state,
    retry,
    refresh,
    canRetry: state.retryCount < maxRetries,
    hasData: state.data !== null,
    isCached: enableCache && cacheRef.current !== null,
  };
}

/**
 * Hook for analytics dashboard data with comprehensive fallback
 */
export function useAnalyticsDashboard(dateRange?: { start: Date; end: Date }) {
  const defaultDateRange = {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    end: new Date(),
  };

  const range = dateRange || defaultDateRange;

  return useAnalyticsWithFallback(
    () => enhancedAnalyticsService.getDashboardData(range),
    {
      refreshInterval: 60000, // 1 minute for dashboard
      staleTime: 120000, // 2 minutes
      fallbackData: {
        overview: {
          totalPageViews: 0,
          uniqueVisitors: 0,
          averageSessionDuration: 0,
          bounceRate: 0,
          realTimeVisitors: 0,
        },
        topPages: [],
        topArticles: [],
        trendingContent: [],
        trafficSources: [],
        deviceBreakdown: {},
        realTimeData: {
          activeVisitors: [],
          currentPageViews: [],
        },
      },
    }
  );
}

/**
 * Hook for real-time analytics with frequent updates
 */
export function useRealTimeAnalytics() {
  return useAnalyticsWithFallback(
    () => enhancedAnalyticsService.getRealTimeVisitors(),
    {
      refreshInterval: 10000, // 10 seconds for real-time
      staleTime: 30000, // 30 seconds
      fallbackData: [],
    }
  );
}

/**
 * Hook for analytics summary with caching
 */
export function useAnalyticsSummary(startDate: Date, endDate: Date) {
  return useAnalyticsWithFallback(
    () => analyticsDataService.getAnalyticsSummary(startDate, endDate),
    {
      refreshInterval: 300000, // 5 minutes for summary
      staleTime: 600000, // 10 minutes
      enableCache: true,
      fallbackData: {
        totalPageViews: 0,
        uniqueVisitors: 0,
        averageSessionDuration: 0,
        bounceRate: 0,
        topPages: [],
        topReferrers: [],
        deviceBreakdown: {},
        countryBreakdown: {},
      },
    }
  );
}

/**
 * Hook for popular articles with fallback
 */
export function usePopularArticles(period: '24h' | '7d' | '30d' | 'all' = '7d') {
  return useAnalyticsWithFallback(
    () => enhancedAnalyticsService.getPopularArticles(period, 10),
    {
      refreshInterval: 180000, // 3 minutes
      staleTime: 300000, // 5 minutes
      fallbackData: [],
    }
  );
}

/**
 * Utility function to check if an error is retryable
 */
function isRetryableError(error: Error): boolean {
  const retryablePatterns = [
    'network',
    'timeout',
    'unavailable',
    'deadline-exceeded',
    'resource-exhausted',
    'aborted',
    'internal',
  ];

  const errorMessage = error.message.toLowerCase();
  return retryablePatterns.some(pattern => errorMessage.includes(pattern));
}

/**
 * Hook for analytics health check
 */
export function useAnalyticsHealth() {
  const [isHealthy, setIsHealthy] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      // Simple health check - try to get real-time visitors count
      await enhancedAnalyticsService.getRealTimeVisitors();
      setIsHealthy(true);
      setLastCheck(new Date());
    } catch (error) {
      setIsHealthy(false);
      setLastCheck(new Date());
      handleError(error as Error, { context: 'analytics-health-check' });
    }
  }, []);

  useEffect(() => {
    checkHealth();
    
    // Check health every 2 minutes
    const interval = setInterval(checkHealth, 120000);
    
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    isHealthy,
    lastCheck,
    checkHealth,
    circuitBreakerState: analyticsCircuitBreaker.getState(),
  };
}