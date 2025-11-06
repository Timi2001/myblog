import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Article, Category, Tag, Comment, Subscriber, SiteConfig, PageView } from '@/types';

// Collections
export const COLLECTIONS = {
  ARTICLES: 'articles',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  COMMENTS: 'comments',
  SUBSCRIBERS: 'subscribers',
  SITE_CONFIG: 'siteConfig',
  PAGE_VIEWS: 'pageViews',
} as const;

// Generic Firestore operations
export async function getDocument<T>(collectionName: string, id: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
}

export async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
}

export async function addDocument<T>(
  collectionName: string,
  data: Omit<T, 'id'>
): Promise<string> {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, data);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
}

export async function updateDocument<T>(
  collectionName: string,
  id: string,
  data: Partial<Omit<T, 'id'>>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}

export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}

// Specific service functions
export const articleService = {
  getAll: (status?: Article['status']) => {
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
    if (status) {
      constraints.unshift(where('status', '==', status));
    }
    return getDocuments<Article>(COLLECTIONS.ARTICLES, constraints);
  },
  
  getBySlug: async (slug: string): Promise<Article | null> => {
    const articles = await getDocuments<Article>(COLLECTIONS.ARTICLES, [
      where('slug', '==', slug),
      limit(1)
    ]);
    return articles[0] || null;
  },
  
  getByCategory: (categoryId: string) => {
    return getDocuments<Article>(COLLECTIONS.ARTICLES, [
      where('categoryId', '==', categoryId),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc')
    ]);
  },
  
  create: (data: Omit<Article, 'id'>) => addDocument<Article>(COLLECTIONS.ARTICLES, data),
  update: (id: string, data: Partial<Omit<Article, 'id'>>) => updateDocument<Article>(COLLECTIONS.ARTICLES, id, data),
  delete: (id: string) => deleteDocument(COLLECTIONS.ARTICLES, id),
};

export const categoryService = {
  getAll: () => getDocuments<Category>(COLLECTIONS.CATEGORIES, [orderBy('name')]),
  getBySlug: async (slug: string): Promise<Category | null> => {
    const categories = await getDocuments<Category>(COLLECTIONS.CATEGORIES, [
      where('slug', '==', slug),
      limit(1)
    ]);
    return categories[0] || null;
  },
  create: (data: Omit<Category, 'id'>) => addDocument<Category>(COLLECTIONS.CATEGORIES, data),
  update: (id: string, data: Partial<Omit<Category, 'id'>>) => updateDocument<Category>(COLLECTIONS.CATEGORIES, id, data),
  delete: (id: string) => deleteDocument(COLLECTIONS.CATEGORIES, id),
};

export const subscriberService = {
  getAll: () => getDocuments<Subscriber>(COLLECTIONS.SUBSCRIBERS, [orderBy('subscribedAt', 'desc')]),
  getByEmail: async (email: string): Promise<Subscriber | null> => {
    const subscribers = await getDocuments<Subscriber>(COLLECTIONS.SUBSCRIBERS, [
      where('email', '==', email),
      limit(1)
    ]);
    return subscribers[0] || null;
  },
  create: (data: Omit<Subscriber, 'id'>) => addDocument<Subscriber>(COLLECTIONS.SUBSCRIBERS, data),
  update: (id: string, data: Partial<Omit<Subscriber, 'id'>>) => updateDocument<Subscriber>(COLLECTIONS.SUBSCRIBERS, id, data),
  delete: (id: string) => deleteDocument(COLLECTIONS.SUBSCRIBERS, id),
};

export const tagService = {
  getAll: () => getDocuments<Tag>(COLLECTIONS.TAGS, [orderBy('name')]),
  getBySlug: async (slug: string): Promise<Tag | null> => {
    const tags = await getDocuments<Tag>(COLLECTIONS.TAGS, [
      where('slug', '==', slug),
      limit(1)
    ]);
    return tags[0] || null;
  },
  create: (data: Omit<Tag, 'id'>) => addDocument<Tag>(COLLECTIONS.TAGS, data),
  update: (id: string, data: Partial<Omit<Tag, 'id'>>) => updateDocument<Tag>(COLLECTIONS.TAGS, id, data),
  delete: (id: string) => deleteDocument(COLLECTIONS.TAGS, id),
};

export const commentService = {
  getByArticle: (articleId: string) => {
    return getDocuments<Comment>(`${COLLECTIONS.ARTICLES}/${articleId}/${COLLECTIONS.COMMENTS}`, [
      where('status', '==', 'approved'),
      orderBy('createdAt', 'asc')
    ]);
  },
  
  getAllForArticle: (articleId: string) => {
    return getDocuments<Comment>(`${COLLECTIONS.ARTICLES}/${articleId}/${COLLECTIONS.COMMENTS}`, [
      orderBy('createdAt', 'desc')
    ]);
  },
  
  getAllPending: async () => {
    // For now, we'll use a simple approach. In production, you'd want to use collection group queries
    // This is a simplified implementation that gets pending comments from a global collection
    try {
      return await getDocuments<Comment>(COLLECTIONS.COMMENTS, [
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      ]);
    } catch (error) {
      console.error('Error getting pending comments:', error);
      return [];
    }
  },
  
  getByStatus: async (status: 'pending' | 'approved' | 'rejected') => {
    try {
      return await getDocuments<Comment>(COLLECTIONS.COMMENTS, [
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      ]);
    } catch (error) {
      console.error(`Error getting ${status} comments:`, error);
      return [];
    }
  },
  
  getById: async (commentId: string): Promise<Comment | null> => {
    try {
      return await getDocument<Comment>(COLLECTIONS.COMMENTS, commentId);
    } catch (error) {
      console.error('Error getting comment by ID:', error);
      return null;
    }
  },
  
  create: async (articleId: string, data: Omit<Comment, 'id'>) => {
    // Create in both the article subcollection and global collection for easier admin access
    const commentId = await addDocument<Comment>(`${COLLECTIONS.ARTICLES}/${articleId}/${COLLECTIONS.COMMENTS}`, data);
    
    // Also add to global comments collection for admin queries
    try {
      const globalCommentRef = doc(db, COLLECTIONS.COMMENTS, commentId);
      await setDoc(globalCommentRef, { 
        ...data, 
        articleId,
        id: commentId 
      });
    } catch (error) {
      console.warn('Failed to add comment to global collection:', error);
    }
    
    return commentId;
  },
  
  update: async (articleId: string, commentId: string, data: Partial<Omit<Comment, 'id'>>) => {
    // Update in both locations
    await updateDocument<Comment>(`${COLLECTIONS.ARTICLES}/${articleId}/${COLLECTIONS.COMMENTS}`, commentId, data);
    
    try {
      await updateDocument<Comment>(COLLECTIONS.COMMENTS, commentId, data);
    } catch (error) {
      console.warn('Failed to update comment in global collection:', error);
    }
  },
  
  delete: async (articleId: string, commentId: string) => {
    // Delete from both locations
    await deleteDocument(`${COLLECTIONS.ARTICLES}/${articleId}/${COLLECTIONS.COMMENTS}`, commentId);
    
    try {
      await deleteDocument(COLLECTIONS.COMMENTS, commentId);
    } catch (error) {
      console.warn('Failed to delete comment from global collection:', error);
    }
  },
};

export const siteConfigService = {
  getTheme: () => getDocument<SiteConfig['theme']>(COLLECTIONS.SITE_CONFIG, 'theme'),
  getBranding: () => getDocument<SiteConfig['branding']>(COLLECTIONS.SITE_CONFIG, 'branding'),
  getLayout: () => getDocument<SiteConfig['layout']>(COLLECTIONS.SITE_CONFIG, 'layout'),
  getSeo: () => getDocument<SiteConfig['seo']>(COLLECTIONS.SITE_CONFIG, 'seo'),
  
  updateTheme: (data: Partial<SiteConfig['theme']>) => 
    updateDocument(COLLECTIONS.SITE_CONFIG, 'theme', { ...data, updatedAt: serverTimestamp() }),
  
  updateBranding: (data: Partial<SiteConfig['branding']>) => 
    updateDocument(COLLECTIONS.SITE_CONFIG, 'branding', { ...data, updatedAt: serverTimestamp() }),
  
  updateLayout: (data: Partial<SiteConfig['layout']>) => 
    updateDocument(COLLECTIONS.SITE_CONFIG, 'layout', { ...data, updatedAt: serverTimestamp() }),
  
  updateSeo: (data: Partial<SiteConfig['seo']>) => 
    updateDocument(COLLECTIONS.SITE_CONFIG, 'seo', { ...data, updatedAt: serverTimestamp() }),
};

export const analyticsService = {
  recordPageView: (data: Omit<PageView, 'id'>) => 
    addDocument<PageView>(COLLECTIONS.PAGE_VIEWS, data),
  
  getArticleViews: (articleId: string) => {
    return getDocuments<PageView>(COLLECTIONS.PAGE_VIEWS, [
      where('articleId', '==', articleId),
      orderBy('timestamp', 'desc')
    ]);
  },
  
  getRecentViews: (limitCount: number = 100) => {
    return getDocuments<PageView>(COLLECTIONS.PAGE_VIEWS, [
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    ]);
  },
};

// Pagination helper
export async function getPaginatedDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  pageSize: number = 10,
  lastDoc?: DocumentSnapshot
): Promise<{ documents: T[]; lastDocument: DocumentSnapshot | null }> {
  try {
    const collectionRef = collection(db, collectionName);
    const queryConstraints = [...constraints, limit(pageSize)];
    
    if (lastDoc) {
      queryConstraints.push(startAfter(lastDoc));
    }
    
    const q = query(collectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
    
    const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
    
    return { documents, lastDocument };
  } catch (error) {
    console.error(`Error getting paginated documents from ${collectionName}:`, error);
    throw error;
  }
}