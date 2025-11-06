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
  onSnapshot,
  writeBatch
} from 'firebase/firestore';

// Enhanced analytics interfaces
export interface PageViewEvent {
  id?: string;
  articleId?: string;
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
  timeOnPage?: number;
  scrollDepth?: number;
  exitPage?: boolean;
}

export interface RealTimeVisitor {
  id?: string;
  sessionId: string;
  userId?: string;
  currentPage: string;
  lastSeen: Timestamp;
  country?: string;
  device?: string;
  browser?: string;
  referrer?: string;
  pagesViewed: number;
  sessionStart: Timestamp;
}

export interface ArticlePerformance {
  id?: string;
  articleId: string;
  title: string;
  slug: string;
  views: number;
  uniqueViews: number;
  averageTimeSpent: number;
  bounceRate: number;
  socialShares: number;
  comments: number;
  lastViewed: Timestamp;
  trending: boolean;
  trendingScore: number;
  category?: string;
}

export interface TrendingContent {
  articleId: string;
  title: string;
  slug: string;
  views24h: number;
  views7d: number;
  viewsGrowth: number;
  engagementScore: number;
  trendingRank: number;
  category?: string;
  featuredImage?: string;
}

export interface AnalyticsDashboardData {
  overview: {
    totalPageViews: number;
    uniqueVisitors: number;
    averageSessionDuration: number;
    bounceRate: number;
    realTimeVisitors: number;
  };
  topPages: Array<{
    page: string;
    title: string;
    views: number;
    uniqueViews: number;
    averageTime: number;
  }>;
  topArticles: Array<{
    articleId: string;
    title: string;
    slug: string;
    views: number;
    engagementScore: number;
  }>;
  trendingContent: TrendingContent[];
  trafficSources: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
  deviceBreakdown: Record<string, number>;
  realTimeData: {
    activeVisitors: RealTimeVisitor[];
    currentPageViews: Array<{
      page: string;
      viewers: number;
    }>;
  };
}

// Enhanced Analytics Service
export class EnhancedAnalyticsService {
  private pageViewsCollection = collection(db, 'analytics_pageviews');
  private realTimeVisitorsCollection = collection(db, 'analytics_realtime_visitors');
  private articlePerformanceCollection = collection(db, 'analytics_article_performance');
  private trendingContentCollection = collection(db, 'analytics_trending');
  private sessionsCollection = collection(db, 'analytics_sessions');

  // Track enhanced page view with real-time updates
  async trackPageView(data: Omit<PageViewEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Add page view event
      const pageViewRef = doc(this.pageViewsCollection);
      batch.set(pageViewRef, {
        ...data,
        timestamp: serverTimestamp(),
      });

      // Update real-time visitor
      await this.updateRealTimeVisitor(data);

      // Update article performance if it's an article page
      if (data.articleId) {
        await this.updateArticlePerformance(data.articleId, data.timeOnPage);
      }

      await batch.commit();
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // Update real-time visitor data
  async updateRealTimeVisitor(data: Omit<PageViewEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const visitorQuery = query(
        this.realTimeVisitorsCollection,
        where('sessionId', '==', data.sessionId),
        limit(1)
      );
      
      const visitorSnapshot = await getDocs(visitorQuery);
      
      if (visitorSnapshot.empty) {
        // Create new real-time visitor
        await addDoc(this.realTimeVisitorsCollection, {
          sessionId: data.sessionId,
          userId: data.userId,
          currentPage: data.page,
          lastSeen: serverTimestamp(),
          country: data.country,
          device: data.device,
          browser: data.browser,
          referrer: data.referrer,
          pagesViewed: 1,
          sessionStart: serverTimestamp(),
        });
      } else {
        // Update existing visitor
        const visitorDoc = visitorSnapshot.docs[0];
        await updateDoc(visitorDoc.ref, {
          currentPage: data.page,
          lastSeen: serverTimestamp(),
          pagesViewed: increment(1),
        });
      }
    } catch (error) {
      console.error('Error updating real-time visitor:', error);
    }
  }

  // Update article performance metrics
  async updateArticlePerformance(articleId: string, timeSpent?: number): Promise<void> {
    try {
      const articleDocRef = doc(this.articlePerformanceCollection, articleId);
      const articleDoc = await getDoc(articleDocRef);

      if (articleDoc.exists()) {
        const currentData = articleDoc.data();
        const updateData: any = {
          views: increment(1),
          lastViewed: serverTimestamp(),
        };

        if (timeSpent && timeSpent > 0) {
          const currentAverage = currentData.averageTimeSpent || 0;
          const currentViews = currentData.views || 0;
          const newAverage = ((currentAverage * currentViews) + timeSpent) / (currentViews + 1);
          updateData.averageTimeSpent = newAverage;
        }

        await updateDoc(articleDocRef, updateData);
      } else {
        // Create new article performance record
        await updateDoc(articleDocRef, {
          articleId,
          views: 1,
          uniqueViews: 1,
          averageTimeSpent: timeSpent || 0,
          bounceRate: 0,
          socialShares: 0,
          comments: 0,
          lastViewed: serverTimestamp(),
          trending: false,
          trendingScore: 0,
        });
      }

      // Update trending status
      await this.updateTrendingStatus(articleId);
    } catch (error) {
      console.error('Error updating article performance:', error);
    }
  }

  // Calculate and update trending content
  async updateTrendingStatus(articleId: string): Promise<void> {
    try {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get views in last 24 hours and 7 days
      const [views24h, views7d] = await Promise.all([
        this.getArticleViewsInPeriod(articleId, last24Hours, now),
        this.getArticleViewsInPeriod(articleId, last7Days, now)
      ]);

      // Calculate trending score based on recent activity
      const trendingScore = this.calculateTrendingScore(views24h, views7d);
      const isTrending = trendingScore > 10; // Threshold for trending

      // Update trending collection
      const trendingDocRef = doc(this.trendingContentCollection, articleId);
      await updateDoc(trendingDocRef, {
        articleId,
        views24h,
        views7d,
        viewsGrowth: views24h > 0 ? ((views24h / Math.max(views7d - views24h, 1)) * 100) : 0,
        engagementScore: trendingScore,
        trendingRank: 0, // Will be calculated in batch update
        lastUpdated: serverTimestamp(),
      });

      // Update article performance trending status
      const articlePerfRef = doc(this.articlePerformanceCollection, articleId);
      await updateDoc(articlePerfRef, {
        trending: isTrending,
        trendingScore,
      });
    } catch (error) {
      console.error('Error updating trending status:', error);
    }
  }

  // Get article views in a specific time period
  async getArticleViewsInPeriod(articleId: string, startDate: Date, endDate: Date): Promise<number> {
    try {
      const viewsQuery = query(
        this.pageViewsCollection,
        where('articleId', '==', articleId),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate))
      );

      const snapshot = await getDocs(viewsQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting article views:', error);
      return 0;
    }
  }

  // Calculate trending score
  private calculateTrendingScore(views24h: number, views7d: number): number {
    const recentWeight = 0.7;
    const totalWeight = 0.3;
    const velocityBonus = views24h > 0 ? Math.log(views24h + 1) * 2 : 0;
    
    return (views24h * recentWeight) + (views7d * totalWeight) + velocityBonus;
  }

  // Get real-time visitors
  async getRealTimeVisitors(): Promise<RealTimeVisitor[]> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const realtimeQuery = query(
        this.realTimeVisitorsCollection,
        where('lastSeen', '>=', Timestamp.fromDate(fiveMinutesAgo)),
        orderBy('lastSeen', 'desc')
      );

      const snapshot = await getDocs(realtimeQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RealTimeVisitor));
    } catch (error) {
      console.error('Error getting real-time visitors:', error);
      return [];
    }
  }

  // Get trending content
  async getTrendingContent(limitCount: number = 10): Promise<TrendingContent[]> {
    try {
      const trendingQuery = query(
        this.trendingContentCollection,
        orderBy('engagementScore', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(trendingQuery);
      return snapshot.docs.map((doc, index) => ({
        ...doc.data(),
        trendingRank: index + 1
      } as TrendingContent));
    } catch (error) {
      console.error('Error getting trending content:', error);
      return [];
    }
  }

  // Get popular articles
  async getPopularArticles(period: '24h' | '7d' | '30d' | 'all' = '7d', limitCount: number = 10): Promise<ArticlePerformance[]> {
    try {
      let articlesQuery;
      
      if (period === 'all') {
        articlesQuery = query(
          this.articlePerformanceCollection,
          orderBy('views', 'desc'),
          limit(limitCount)
        );
      } else {
        // For time-based queries, we'll use the trending collection which has time-based data
        const trendingQuery = query(
          this.trendingContentCollection,
          orderBy(period === '24h' ? 'views24h' : 'views7d', 'desc'),
          limit(limitCount)
        );
        
        const trendingSnapshot = await getDocs(trendingQuery);
        const trendingArticleIds = trendingSnapshot.docs.map(doc => doc.data().articleId);
        
        // Get full article performance data for trending articles
        const articlePromises = trendingArticleIds.map(async (articleId) => {
          const articleDoc = await getDoc(doc(this.articlePerformanceCollection, articleId));
          return articleDoc.exists() ? { id: articleDoc.id, ...articleDoc.data() } as ArticlePerformance : null;
        });
        
        const articles = await Promise.all(articlePromises);
        return articles.filter(article => article !== null) as ArticlePerformance[];
      }

      const snapshot = await getDocs(articlesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ArticlePerformance));
    } catch (error) {
      console.error('Error getting popular articles:', error);
      return [];
    }
  }

  // Get comprehensive dashboard data
  async getDashboardData(dateRange: { start: Date; end: Date }): Promise<AnalyticsDashboardData> {
    try {
      const [
        realTimeVisitors,
        trendingContent,
        popularArticles,
        pageViewsData
      ] = await Promise.all([
        this.getRealTimeVisitors(),
        this.getTrendingContent(5),
        this.getPopularArticles('7d', 10),
        this.getPageViewsAnalytics(dateRange.start, dateRange.end)
      ]);

      return {
        overview: {
          totalPageViews: pageViewsData.totalViews,
          uniqueVisitors: pageViewsData.uniqueVisitors,
          averageSessionDuration: pageViewsData.avgSessionDuration,
          bounceRate: pageViewsData.bounceRate,
          realTimeVisitors: realTimeVisitors.length,
        },
        topPages: pageViewsData.topPages,
        topArticles: popularArticles.slice(0, 5).map(article => ({
          articleId: article.articleId,
          title: article.title || `Article ${article.articleId}`,
          slug: article.slug || article.articleId,
          views: article.views,
          engagementScore: article.trendingScore,
        })),
        trendingContent,
        trafficSources: pageViewsData.trafficSources,
        deviceBreakdown: pageViewsData.deviceBreakdown,
        realTimeData: {
          activeVisitors: realTimeVisitors,
          currentPageViews: this.calculateCurrentPageViews(realTimeVisitors),
        },
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return this.getEmptyDashboardData();
    }
  }

  // Get page views analytics for a date range
  private async getPageViewsAnalytics(startDate: Date, endDate: Date) {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const pageViewsQuery = query(
      this.pageViewsCollection,
      where('timestamp', '>=', startTimestamp),
      where('timestamp', '<=', endTimestamp)
    );

    const snapshot = await getDocs(pageViewsQuery);
    const pageViews = snapshot.docs.map(doc => doc.data() as PageViewEvent);

    // Calculate metrics
    const totalViews = pageViews.length;
    const uniqueVisitors = new Set(pageViews.map(pv => pv.sessionId)).size;
    
    // Calculate top pages
    const pageViewCounts = pageViews.reduce((acc, pv) => {
      const key = pv.page;
      if (!acc[key]) {
        acc[key] = { page: pv.page, title: pv.title, views: 0, uniqueViews: new Set(), totalTime: 0, timeCount: 0 };
      }
      acc[key].views++;
      acc[key].uniqueViews.add(pv.sessionId);
      if (pv.timeOnPage) {
        acc[key].totalTime += pv.timeOnPage;
        acc[key].timeCount++;
      }
      return acc;
    }, {} as Record<string, any>);

    const topPages = Object.values(pageViewCounts)
      .map((page: any) => ({
        page: page.page,
        title: page.title,
        views: page.views,
        uniqueViews: page.uniqueViews.size,
        averageTime: page.timeCount > 0 ? page.totalTime / page.timeCount : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Calculate traffic sources
    const referrerCounts = pageViews
      .filter(pv => pv.referrer && !pv.referrer.includes(window?.location?.hostname || 'localhost'))
      .reduce((acc, pv) => {
        const domain = new URL(pv.referrer!).hostname;
        acc[domain] = (acc[domain] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const trafficSources = Object.entries(referrerCounts)
      .map(([source, visits]) => ({
        source,
        visits,
        percentage: (visits / totalViews) * 100,
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);

    // Calculate device breakdown
    const deviceBreakdown = pageViews.reduce((acc, pv) => {
      const device = pv.device || 'Unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalViews,
      uniqueVisitors,
      avgSessionDuration: 0, // Would need session data
      bounceRate: 0, // Would need session data
      topPages,
      trafficSources,
      deviceBreakdown,
    };
  }

  // Calculate current page views from real-time visitors
  private calculateCurrentPageViews(visitors: RealTimeVisitor[]) {
    const pageViewCounts = visitors.reduce((acc, visitor) => {
      acc[visitor.currentPage] = (acc[visitor.currentPage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(pageViewCounts)
      .map(([page, viewers]) => ({ page, viewers }))
      .sort((a, b) => b.viewers - a.viewers);
  }

  // Get empty dashboard data as fallback
  private getEmptyDashboardData(): AnalyticsDashboardData {
    return {
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
    };
  }

  // Clean up old real-time visitor data
  async cleanupRealTimeData(): Promise<void> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const oldVisitorsQuery = query(
        this.realTimeVisitorsCollection,
        where('lastSeen', '<', Timestamp.fromDate(oneHourAgo))
      );

      const snapshot = await getDocs(oldVisitorsQuery);
      const batch = writeBatch(db);

      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error cleaning up real-time data:', error);
    }
  }

  // Subscribe to real-time updates
  subscribeToRealTimeUpdates(callback: (visitors: RealTimeVisitor[]) => void): () => void {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const realtimeQuery = query(
      this.realTimeVisitorsCollection,
      where('lastSeen', '>=', Timestamp.fromDate(fiveMinutesAgo)),
      orderBy('lastSeen', 'desc')
    );

    return onSnapshot(realtimeQuery, (snapshot) => {
      const visitors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RealTimeVisitor));
      callback(visitors);
    });
  }
}

// Create singleton instance
export const enhancedAnalyticsService = new EnhancedAnalyticsService();