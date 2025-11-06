import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  increment, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  getDoc,
  startAfter,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { AnalyticsDocumentManager } from './analytics-utils';

// Analytics data interfaces
export interface PageView {
  id?: string;
  page: string;
  title: string;
  referrer?: string;
  userAgent?: string;
  timestamp: Timestamp;
  sessionId: string;
  userId?: string;
  country?: string;
  device?: string;
  browser?: string;
}

export interface ArticleAnalytics {
  id?: string;
  articleId: string;
  views: number;
  uniqueViews: number;
  averageTimeSpent: number;
  bounceRate: number;
  socialShares: number;
  comments: number;
  lastUpdated: Timestamp;
}

export interface UserSession {
  id?: string;
  sessionId: string;
  userId?: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  pageViews: number;
  duration?: number;
  referrer?: string;
  country?: string;
  device?: string;
  browser?: string;
}

export interface AnalyticsSummary {
  totalPageViews: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ page: string; views: number }>;
  topReferrers: Array<{ referrer: string; visits: number }>;
  deviceBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
}

// Analytics data service
export class AnalyticsDataService {
  private pageViewsCollection = collection(db, 'analytics_pageviews');
  private articleAnalyticsCollection = collection(db, 'analytics_articles');
  private sessionsCollection = collection(db, 'analytics_sessions');
  private summaryDoc = doc(db, 'analytics_summary', 'current');

  // Track page view
  async trackPageView(data: Omit<PageView, 'id' | 'timestamp'>): Promise<void> {
    try {
      await addDoc(this.pageViewsCollection, {
        ...data,
        timestamp: serverTimestamp(),
      });

      // Update daily summary
      await this.updateDailySummary(data.page);
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // Track article view
  async trackArticleView(articleId: string, timeSpent?: number): Promise<void> {
    try {
      // Ensure the document exists before updating
      await AnalyticsDocumentManager.ensureLegacyArticleAnalyticsExists(articleId);
      
      const articleDocRef = doc(this.articleAnalyticsCollection, articleId);
      const articleDoc = await getDoc(articleDocRef);

      if (articleDoc.exists()) {
        const updateData: any = {
          views: increment(1),
          lastUpdated: serverTimestamp(),
        };

        if (timeSpent) {
          const currentData = articleDoc.data();
          const currentAverage = currentData.averageTimeSpent || 0;
          const currentViews = currentData.views || 0;
          const newAverage = ((currentAverage * currentViews) + timeSpent) / (currentViews + 1);
          updateData.averageTimeSpent = newAverage;
        }

        await updateDoc(articleDocRef, updateData);
      }
    } catch (error) {
      console.error('Error tracking article view:', error);
    }
  }

  // Start user session
  async startSession(sessionData: Omit<UserSession, 'id' | 'startTime'>): Promise<void> {
    try {
      await addDoc(this.sessionsCollection, {
        ...sessionData,
        startTime: serverTimestamp(),
        pageViews: 1,
      });
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }

  // End user session
  async endSession(sessionId: string, duration: number): Promise<void> {
    try {
      const sessionQuery = query(
        this.sessionsCollection,
        where('sessionId', '==', sessionId),
        limit(1)
      );
      
      const sessionDocs = await getDocs(sessionQuery);
      
      if (!sessionDocs.empty) {
        const sessionDoc = sessionDocs.docs[0];
        await updateDoc(sessionDoc.ref, {
          endTime: serverTimestamp(),
          duration,
        });
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  // Get analytics summary for date range
  async getAnalyticsSummary(startDate: Date, endDate: Date): Promise<AnalyticsSummary> {
    try {
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);

      // Get page views in date range
      const pageViewsQuery = query(
        this.pageViewsCollection,
        where('timestamp', '>=', startTimestamp),
        where('timestamp', '<=', endTimestamp)
      );

      const pageViewsSnapshot = await getDocs(pageViewsQuery);
      const pageViews = pageViewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PageView));

      // Get sessions in date range
      const sessionsQuery = query(
        this.sessionsCollection,
        where('startTime', '>=', startTimestamp),
        where('startTime', '<=', endTimestamp)
      );

      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessions = sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserSession));

      // Calculate metrics
      const totalPageViews = pageViews.length;
      const uniqueVisitors = new Set(sessions.map(s => s.userId || s.sessionId)).size;
      
      const validSessions = sessions.filter(s => s.duration && s.duration > 0);
      const averageSessionDuration = validSessions.length > 0 
        ? validSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / validSessions.length 
        : 0;

      const singlePageSessions = sessions.filter(s => s.pageViews === 1).length;
      const bounceRate = sessions.length > 0 ? (singlePageSessions / sessions.length) * 100 : 0;

      // Top pages
      const pageViewCounts = pageViews.reduce((acc, pv) => {
        acc[pv.page] = (acc[pv.page] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topPages = Object.entries(pageViewCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([page, views]) => ({ page, views }));

      // Top referrers
      const referrerCounts = pageViews
        .filter(pv => pv.referrer && pv.referrer !== window.location.origin)
        .reduce((acc, pv) => {
          const referrer = pv.referrer!;
          acc[referrer] = (acc[referrer] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const topReferrers = Object.entries(referrerCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([referrer, visits]) => ({ referrer, visits }));

      // Device breakdown
      const deviceBreakdown = sessions.reduce((acc, session) => {
        const device = session.device || 'Unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Country breakdown
      const countryBreakdown = sessions.reduce((acc, session) => {
        const country = session.country || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalPageViews,
        uniqueVisitors,
        averageSessionDuration,
        bounceRate,
        topPages,
        topReferrers,
        deviceBreakdown,
        countryBreakdown,
      };
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return {
        totalPageViews: 0,
        uniqueVisitors: 0,
        averageSessionDuration: 0,
        bounceRate: 0,
        topPages: [],
        topReferrers: [],
        deviceBreakdown: {},
        countryBreakdown: {},
      };
    }
  }

  // Get article analytics
  async getArticleAnalytics(articleId?: string): Promise<ArticleAnalytics[]> {
    try {
      let analyticsQuery;
      
      if (articleId) {
        analyticsQuery = query(
          this.articleAnalyticsCollection,
          where('articleId', '==', articleId)
        );
      } else {
        analyticsQuery = query(
          this.articleAnalyticsCollection,
          orderBy('views', 'desc'),
          limit(50)
        );
      }

      const snapshot = await getDocs(analyticsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ArticleAnalytics));
    } catch (error) {
      console.error('Error getting article analytics:', error);
      return [];
    }
  }

  // Get popular articles
  async getPopularArticles(limitCount: number = 10): Promise<ArticleAnalytics[]> {
    try {
      const popularQuery = query(
        this.articleAnalyticsCollection,
        orderBy('views', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(popularQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ArticleAnalytics));
    } catch (error) {
      console.error('Error getting popular articles:', error);
      return [];
    }
  }

  // Get real-time metrics (last 24 hours)
  async getRealTimeMetrics(): Promise<{
    activeUsers: number;
    pageViewsLast24h: number;
    topPagesLast24h: Array<{ page: string; views: number }>;
  }> {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const timestamp24h = Timestamp.fromDate(last24Hours);

      // Get page views in last 24 hours
      const recentPageViewsQuery = query(
        this.pageViewsCollection,
        where('timestamp', '>=', timestamp24h)
      );

      const recentPageViewsSnapshot = await getDocs(recentPageViewsQuery);
      const recentPageViews = recentPageViewsSnapshot.docs.map(doc => doc.data() as PageView);

      // Get active sessions (last 30 minutes)
      const last30Minutes = new Date(Date.now() - 30 * 60 * 1000);
      const timestamp30m = Timestamp.fromDate(last30Minutes);

      const activeSessionsQuery = query(
        this.sessionsCollection,
        where('startTime', '>=', timestamp30m)
      );

      const activeSessionsSnapshot = await getDocs(activeSessionsQuery);
      const activeUsers = activeSessionsSnapshot.size;

      // Top pages in last 24 hours
      const pageViewCounts = recentPageViews.reduce((acc, pv) => {
        acc[pv.page] = (acc[pv.page] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topPagesLast24h = Object.entries(pageViewCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([page, views]) => ({ page, views }));

      return {
        activeUsers,
        pageViewsLast24h: recentPageViews.length,
        topPagesLast24h,
      };
    } catch (error) {
      console.error('Error getting real-time metrics:', error);
      return {
        activeUsers: 0,
        pageViewsLast24h: 0,
        topPagesLast24h: [],
      };
    }
  }

  // Update daily summary (for performance optimization)
  private async updateDailySummary(page: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Ensure the daily summary document exists
      await AnalyticsDocumentManager.ensureDailySummaryExists(today);
      
      const summaryDocRef = doc(db, 'analytics_daily_summary', today);
      
      await updateDoc(summaryDocRef, {
        [`pages.${page.replace(/[.#$/[\]]/g, '_')}`]: increment(1),
        totalViews: increment(1),
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating daily summary:', error);
    }
  }

  // Batch update daily summaries for multiple operations
  async batchUpdateDailySummary(operations: Array<{
    date: string;
    page: string;
    sessionId?: string;
  }>): Promise<void> {
    try {
      const batch = writeBatch(db);
      const summaryUpdates = new Map<string, {
        totalViews: number;
        pages: Map<string, number>;
        uniqueVisitors: Set<string>;
      }>();

      // Group operations by date
      for (const operation of operations) {
        if (!summaryUpdates.has(operation.date)) {
          summaryUpdates.set(operation.date, {
            totalViews: 0,
            pages: new Map(),
            uniqueVisitors: new Set(),
          });
        }

        const summary = summaryUpdates.get(operation.date)!;
        summary.totalViews++;
        
        const pageKey = operation.page.replace(/[.#$/[\]]/g, '_');
        summary.pages.set(pageKey, (summary.pages.get(pageKey) || 0) + 1);
        
        if (operation.sessionId) {
          summary.uniqueVisitors.add(operation.sessionId);
        }
      }

      // Ensure all daily summary documents exist
      for (const date of summaryUpdates.keys()) {
        await AnalyticsDocumentManager.ensureDailySummaryExists(date);
      }

      // Apply batch updates
      for (const [date, summary] of summaryUpdates) {
        const summaryDocRef = doc(db, 'analytics_daily_summary', date);
        
        const updateData: any = {
          totalViews: increment(summary.totalViews),
          uniqueVisitors: increment(summary.uniqueVisitors.size),
          lastUpdated: serverTimestamp(),
        };

        // Add page-specific increments
        for (const [pageKey, count] of summary.pages) {
          updateData[`pages.${pageKey}`] = increment(count);
        }

        batch.update(summaryDocRef, updateData);
      }

      await batch.commit();
    } catch (error) {
      console.error('Error batch updating daily summaries:', error);
    }
  }
}

// Create singleton instance
export const analyticsDataService = new AnalyticsDataService();