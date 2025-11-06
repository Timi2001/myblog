'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { 
  trackPageView, 
  trackArticleView, 
  ReadingProgressTracker,
  initializeGA4,
  trackGA4Event
} from '@/lib/analytics';
import { analyticsDataService } from '@/lib/analytics-data';
import { enhancedAnalyticsService } from '@/lib/analytics-enhanced';

// Generate session ID
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get device type
function getDeviceType(): string {
  if (typeof window === 'undefined') return 'Unknown';
  
  const userAgent = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'Tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'Mobile';
  }
  return 'Desktop';
}

// Get browser name
function getBrowserName(): string {
  if (typeof window === 'undefined') return 'Unknown';
  
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Other';
}

// Get country (simplified - in production, use a geolocation service)
function getCountry(): string {
  if (typeof window === 'undefined') return 'Unknown';
  
  // This is a simplified version. In production, you'd use:
  // - A geolocation API service
  // - Server-side detection
  // - User's timezone as a fallback
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const countryMap: Record<string, string> = {
    'America/New_York': 'United States',
    'America/Los_Angeles': 'United States',
    'Europe/London': 'United Kingdom',
    'Europe/Paris': 'France',
    'Europe/Berlin': 'Germany',
    'Asia/Tokyo': 'Japan',
    'Asia/Shanghai': 'China',
    'Australia/Sydney': 'Australia',
  };
  
  return countryMap[timezone] || 'Unknown';
}

// Main analytics hook
export function useAnalytics() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | undefined>(undefined);
  const sessionStartRef = useRef<number | undefined>(undefined);
  const lastPageRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Initialize session
    if (!sessionIdRef.current) {
      sessionIdRef.current = generateSessionId();
      sessionStartRef.current = Date.now();
      
      // Start session tracking
      analyticsDataService.startSession({
        sessionId: sessionIdRef.current,
        pageViews: 0,
        referrer: document.referrer || '',
        country: getCountry(),
        device: getDeviceType(),
        browser: getBrowserName(),
      }).catch(console.error);
    }

    // Track page view
    const pageTitle = document.title;
    const pageLocation = window.location.href;
    
    trackPageView(pageTitle, pageLocation, {
      session_id: sessionIdRef.current,
      device_type: getDeviceType(),
      browser: getBrowserName(),
    });

    // Track in our database (both old and enhanced systems)
    analyticsDataService.trackPageView({
      page: pathname,
      title: pageTitle,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent,
      sessionId: sessionIdRef.current!,
      country: getCountry(),
      device: getDeviceType(),
      browser: getBrowserName(),
    }).catch(console.error);

    // Track in enhanced analytics system
    enhancedAnalyticsService.trackPageView({
      page: pathname,
      title: pageTitle,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent,
      sessionId: sessionIdRef.current!,
      country: getCountry(),
      device: getDeviceType(),
      browser: getBrowserName(),
    }).catch(console.error);

    lastPageRef.current = pathname;

    // Cleanup function for session end
    return () => {
      if (sessionStartRef.current) {
        const sessionDuration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
        if (sessionDuration > 10) { // Only track sessions longer than 10 seconds
          analyticsDataService.endSession(sessionIdRef.current!, sessionDuration).catch(console.error);
        }
      }
    };
  }, [pathname]);

  // Initialize Google Analytics 4 on mount
  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (gaId) {
      initializeGA4(gaId);
    }
  }, []);

  const trackEvent = useCallback((eventName: string, parameters: Record<string, any> = {}) => {
    trackGA4Event(eventName, {
      ...parameters,
      session_id: sessionIdRef.current,
    });
  }, []);

  return {
    trackEvent,
    sessionId: sessionIdRef.current,
  };
}

// Hook for article analytics
export function useArticleAnalytics(articleId: string, articleTitle: string, category: string, readingTime: number) {
  const trackerRef = useRef<ReadingProgressTracker | null>(null);
  const hasTrackedView = useRef(false);
  const startTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Track article view (only once per page load)
    if (!hasTrackedView.current) {
      trackArticleView(articleId, articleTitle, category, readingTime);
      analyticsDataService.trackArticleView(articleId).catch(console.error);
      
      // Track in enhanced analytics system
      enhancedAnalyticsService.updateArticlePerformance(articleId).catch(console.error);
      
      hasTrackedView.current = true;
      startTimeRef.current = Date.now();
    }

    // Initialize reading progress tracker
    trackerRef.current = new ReadingProgressTracker(articleId);
    trackerRef.current.start();

    // Cleanup on unmount
    return () => {
      if (trackerRef.current) {
        trackerRef.current.stop();
      }
      
      // Track reading time when leaving the article
      if (startTimeRef.current) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (timeSpent > 10) { // Only track if spent more than 10 seconds
          analyticsDataService.trackArticleView(articleId, timeSpent).catch(console.error);
          
          // Track in enhanced analytics system
          enhancedAnalyticsService.updateArticlePerformance(articleId, timeSpent).catch(console.error);
        }
      }
    };
  }, [articleId, articleTitle, category, readingTime]);

  return {
    tracker: trackerRef.current,
  };
}

// Hook for engagement tracking
export function useEngagementTracking() {
  const { trackEvent } = useAnalytics();

  const trackClick = useCallback((element: string, location?: string) => {
    trackEvent('click', {
      element_name: element,
      location: location || window.location.pathname,
    });
  }, [trackEvent]);

  const trackScroll = useCallback((percentage: number) => {
    if (percentage >= 25 && percentage % 25 === 0) {
      trackEvent('scroll', {
        scroll_percentage: percentage,
        page: window.location.pathname,
      });
    }
  }, [trackEvent]);

  const trackFormSubmit = useCallback((formName: string, success: boolean) => {
    trackEvent('form_submit', {
      form_name: formName,
      success: success,
    });
  }, [trackEvent]);

  const trackDownload = useCallback((fileName: string, fileType: string) => {
    trackEvent('file_download', {
      file_name: fileName,
      file_type: fileType,
    });
  }, [trackEvent]);

  const trackOutboundClick = useCallback((url: string) => {
    trackEvent('click', {
      link_url: url,
      link_domain: new URL(url).hostname,
      outbound: true,
    });
  }, [trackEvent]);

  return {
    trackClick,
    trackScroll,
    trackFormSubmit,
    trackDownload,
    trackOutboundClick,
  };
}

// Hook for performance tracking
export function usePerformanceTracking() {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    // Track Core Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        trackEvent('web_vital', {
          name: 'LCP',
          value: Math.round(lastEntry.startTime),
          page: window.location.pathname,
        });
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          trackEvent('web_vital', {
            name: 'FID',
            value: Math.round((entry.processingStart || entry.startTime) - entry.startTime),
            page: window.location.pathname,
          });
        });
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }

      // Track CLS on page unload
      const handleBeforeUnload = () => {
        if (clsValue > 0) {
          trackEvent('web_vital', {
            name: 'CLS',
            value: Math.round(clsValue * 1000) / 1000,
            page: window.location.pathname,
          });
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [trackEvent]);
}

// Hook for error tracking
export function useErrorTracking() {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackEvent('exception', {
        description: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        fatal: false,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackEvent('exception', {
        description: event.reason?.toString() || 'Unhandled Promise Rejection',
        fatal: false,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackEvent]);
}