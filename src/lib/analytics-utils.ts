import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  DocumentReference,
  DocumentData
} from 'firebase/firestore';

/**
 * Utility functions for analytics document lifecycle management
 */

/**
 * Check if a document exists in Firestore
 */
export async function documentExists(docRef: DocumentReference): Promise<boolean> {
  try {
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking document existence:', error);
    return false;
  }
}

/**
 * Ensure a document exists before performing operations on it
 * Creates the document with default data if it doesn't exist
 */
export async function ensureDocumentExists(
  docRef: DocumentReference,
  defaultData: DocumentData
): Promise<boolean> {
  try {
    const exists = await documentExists(docRef);
    
    if (!exists) {
      await setDoc(docRef, {
        ...defaultData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return true; // Document was created
    }
    
    return false; // Document already existed
  } catch (error) {
    console.error('Error ensuring document exists:', error);
    throw error;
  }
}

/**
 * Ensure analytics collection documents exist with proper defaults
 */
export class AnalyticsDocumentManager {
  
  /**
   * Ensure article performance document exists
   * Returns true if document was created, false if it already existed
   */
  static async ensureArticlePerformanceExists(articleId: string): Promise<boolean> {
    const docRef = doc(db, 'analytics_article_performance', articleId);
    
    return await ensureDocumentExists(docRef, {
      articleId,
      views: 0,
      uniqueViews: 0,
      averageTimeSpent: 0,
      bounceRate: 0,
      socialShares: 0,
      comments: 0,
      trending: false,
      trendingScore: 0,
      lastViewed: serverTimestamp(),
    });
  }

  /**
   * Ensure real-time visitor document exists
   * Returns true if document was created, false if it already existed
   */
  static async ensureRealTimeVisitorExists(
    sessionId: string, 
    initialData: {
      userId?: string;
      currentPage: string;
      country?: string;
      device?: string;
      browser?: string;
      referrer?: string;
    }
  ): Promise<boolean> {
    const docRef = doc(db, 'analytics_realtime_visitors', sessionId);
    
    // Filter out undefined values to prevent Firestore errors
    const cleanData: any = {
      sessionId,
      currentPage: initialData.currentPage || '',
      lastSeen: serverTimestamp(),
      pagesViewed: 0,
      sessionStart: serverTimestamp(),
    };

    // Only add optional fields if they have valid values
    if (initialData.userId && initialData.userId !== undefined) {
      cleanData.userId = initialData.userId;
    }
    if (initialData.country && initialData.country !== undefined) {
      cleanData.country = initialData.country;
    }
    if (initialData.device && initialData.device !== undefined) {
      cleanData.device = initialData.device;
    }
    if (initialData.browser && initialData.browser !== undefined) {
      cleanData.browser = initialData.browser;
    }
    if (initialData.referrer && initialData.referrer !== undefined) {
      cleanData.referrer = initialData.referrer;
    }
    
    return await ensureDocumentExists(docRef, cleanData);
  }

  /**
   * Ensure daily summary document exists
   * Returns true if document was created, false if it already existed
   */
  static async ensureDailySummaryExists(date: string): Promise<boolean> {
    const docRef = doc(db, 'analytics_daily_summaries', date);
    
    return await ensureDocumentExists(docRef, {
      date,
      totalViews: 0,
      uniqueVisitors: 0,
      topPages: [],
      lastUpdated: serverTimestamp(),
    });
  }

  /**
   * Ensure trending content document exists
   * Returns true if document was created, false if it already existed
   */
  static async ensureTrendingContentExists(articleId: string): Promise<boolean> {
    const docRef = doc(db, 'analytics_trending', articleId);
    
    return await ensureDocumentExists(docRef, {
      articleId,
      views24h: 0,
      views7d: 0,
      viewsGrowth: 0,
      engagementScore: 0,
      trendingRank: 0,
      lastUpdated: serverTimestamp(),
    });
  }

  /**
   * Ensure legacy analytics article document exists
   * Returns true if document was created, false if it already existed
   */
  static async ensureLegacyArticleAnalyticsExists(articleId: string): Promise<boolean> {
    const docRef = doc(db, 'analytics_articles', articleId);
    
    return await ensureDocumentExists(docRef, {
      articleId,
      views: 0,
      uniqueViews: 0,
      averageTimeSpent: 0,
      bounceRate: 0,
      socialShares: 0,
      comments: 0,
      lastUpdated: serverTimestamp(),
    });
  }
}