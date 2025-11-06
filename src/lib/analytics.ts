import { analytics } from './firebase';
import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';

// Google Analytics 4 integration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Initialize Google Analytics 4
export function initializeGA4(measurementId: string) {
  if (typeof window === 'undefined') return;

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href,
  });
}

// Enhanced Google Analytics 4 event tracking
export function trackGA4Event(eventName: string, parameters: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
}

// Analytics event types
export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
}

// Track page views
export function trackPageView(page_title: string, page_location: string, additional_params: Record<string, any> = {}) {
  const params = {
    page_title,
    page_location,
    ...additional_params,
  };

  // Firebase Analytics
  if (analytics) {
    logEvent(analytics, 'page_view', params);
  }

  // Google Analytics 4
  trackGA4Event('page_view', {
    page_title,
    page_location,
    ...additional_params,
  });
}

// Track article views
export function trackArticleView(articleId: string, articleTitle: string, category: string, readingTime?: number) {
  const params = {
    article_id: articleId,
    article_title: articleTitle,
    category,
    content_type: 'article',
    ...(readingTime && { estimated_reading_time: readingTime }),
  };

  // Firebase Analytics
  if (analytics) {
    logEvent(analytics, 'article_view', params);
  }

  // Google Analytics 4
  trackGA4Event('page_view', {
    ...params,
    content_group1: category,
    custom_parameter_1: articleId,
  });

  // Also track as content view for GA4
  trackGA4Event('view_item', {
    item_id: articleId,
    item_name: articleTitle,
    item_category: category,
    content_type: 'article',
  });
}

// Track search events
export function trackSearch(searchTerm: string, resultsCount: number) {
  if (analytics) {
    logEvent(analytics, 'search', {
      search_term: searchTerm,
      results_count: resultsCount,
    });
  }
}

// Track social sharing
export function trackSocialShare(platform: string, articleId: string, articleTitle: string) {
  if (analytics) {
    logEvent(analytics, 'share', {
      method: platform,
      content_type: 'article',
      item_id: articleId,
      content_title: articleTitle,
    });
  }
}

// Track newsletter subscription
export function trackNewsletterSubscription(method: string = 'form') {
  if (analytics) {
    logEvent(analytics, 'newsletter_signup', {
      method,
    });
  }
}

// Track contact form submission
export function trackContactFormSubmission() {
  if (analytics) {
    logEvent(analytics, 'contact_form_submit');
  }
}

// Track category navigation
export function trackCategoryView(categoryId: string, categoryName: string) {
  if (analytics) {
    logEvent(analytics, 'category_view', {
      category_id: categoryId,
      category_name: categoryName,
    });
  }
}

// Track engagement events
export function trackEngagement(eventName: string, parameters?: Record<string, any>) {
  if (analytics) {
    logEvent(analytics, eventName, parameters);
  }
}

// Track reading time (when user finishes reading an article)
export function trackReadingComplete(articleId: string, readingTime: number, actualTimeSpent: number) {
  if (analytics) {
    logEvent(analytics, 'reading_complete', {
      article_id: articleId,
      estimated_reading_time: readingTime,
      actual_time_spent: actualTimeSpent,
      engagement_rate: Math.min(actualTimeSpent / (readingTime * 60), 2), // Cap at 200%
    });
  }
}

// Track scroll depth
export function trackScrollDepth(articleId: string, scrollPercentage: number) {
  if (analytics) {
    // Only track significant scroll milestones
    const milestones = [25, 50, 75, 90, 100];
    const milestone = milestones.find(m => scrollPercentage >= m && scrollPercentage < m + 5);
    
    if (milestone) {
      logEvent(analytics, 'scroll_depth', {
        article_id: articleId,
        scroll_percentage: milestone,
      });
    }
  }
}

// Set user properties for analytics
export function setAnalyticsUserProperties(properties: Record<string, any>) {
  if (analytics) {
    setUserProperties(analytics, properties);
  }
}

// Set user ID for analytics
export function setAnalyticsUserId(userId: string) {
  if (analytics) {
    setUserId(analytics, userId);
  }
}

// Custom hook for tracking page views in Next.js
export function usePageTracking() {
  if (typeof window !== 'undefined' && analytics) {
    // Track initial page load
    trackPageView(document.title, window.location.href);
    
    // Track route changes (for SPA navigation)
    const handleRouteChange = () => {
      trackPageView(document.title, window.location.href);
    };
    
    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }
}

// Reading progress tracker
export class ReadingProgressTracker {
  private articleId: string;
  private startTime: number;
  private scrollMilestones: Set<number> = new Set();
  private isTracking: boolean = false;

  constructor(articleId: string) {
    this.articleId = articleId;
    this.startTime = Date.now();
  }

  start() {
    if (this.isTracking) return;
    
    this.isTracking = true;
    this.startTime = Date.now();
    
    // Track scroll events
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);
      
      trackScrollDepth(this.articleId, scrollPercentage);
    };

    // Track when user leaves the page
    const handleBeforeUnload = () => {
      this.stop();
    };

    // Track when user becomes inactive
    const handleVisibilityChange = () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Store event listeners for cleanup
    (this as any).cleanup = () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }

  pause() {
    // Implementation for pausing tracking when tab is not visible
  }

  resume() {
    // Implementation for resuming tracking when tab becomes visible
  }

  stop() {
    if (!this.isTracking) return;
    
    const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
    
    // Only track if user spent at least 10 seconds reading
    if (timeSpent >= 10) {
      trackEngagement('reading_session_end', {
        article_id: this.articleId,
        time_spent: timeSpent,
      });
    }

    this.isTracking = false;
    
    // Cleanup event listeners
    if ((this as any).cleanup) {
      (this as any).cleanup();
    }
  }
}