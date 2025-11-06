import { 
  collection, 
  doc, 
  CollectionReference, 
  DocumentReference 
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Article, 
  Category, 
  Tag, 
  Comment, 
  Subscriber, 
  SiteConfig, 
  PageView,
  COLLECTIONS 
} from '@/types';

// Collection references with proper typing
export const articlesCollection = collection(db, COLLECTIONS.ARTICLES) as CollectionReference<Article>;
export const categoriesCollection = collection(db, COLLECTIONS.CATEGORIES) as CollectionReference<Category>;
export const tagsCollection = collection(db, COLLECTIONS.TAGS) as CollectionReference<Tag>;
export const subscribersCollection = collection(db, COLLECTIONS.SUBSCRIBERS) as CollectionReference<Subscriber>;
export const pageViewsCollection = collection(db, COLLECTIONS.PAGE_VIEWS) as CollectionReference<PageView>;

// Site config document references
export const siteConfigDoc = {
  theme: doc(db, COLLECTIONS.SITE_CONFIG, 'theme') as DocumentReference<SiteConfig['theme']>,
  branding: doc(db, COLLECTIONS.SITE_CONFIG, 'branding') as DocumentReference<SiteConfig['branding']>,
  layout: doc(db, COLLECTIONS.SITE_CONFIG, 'layout') as DocumentReference<SiteConfig['layout']>,
  seo: doc(db, COLLECTIONS.SITE_CONFIG, 'seo') as DocumentReference<SiteConfig['seo']>
};

// Helper functions to get document references
export const getArticleDoc = (id: string) => 
  doc(db, COLLECTIONS.ARTICLES, id) as DocumentReference<Article>;

export const getCategoryDoc = (id: string) => 
  doc(db, COLLECTIONS.CATEGORIES, id) as DocumentReference<Category>;

export const getTagDoc = (id: string) => 
  doc(db, COLLECTIONS.TAGS, id) as DocumentReference<Tag>;

export const getSubscriberDoc = (id: string) => 
  doc(db, COLLECTIONS.SUBSCRIBERS, id) as DocumentReference<Subscriber>;

export const getPageViewDoc = (id: string) => 
  doc(db, COLLECTIONS.PAGE_VIEWS, id) as DocumentReference<PageView>;

// Helper function to get comments subcollection for an article
export const getCommentsCollection = (articleId: string) => 
  collection(db, COLLECTIONS.ARTICLES, articleId, COLLECTIONS.COMMENTS) as CollectionReference<Comment>;

export const getCommentDoc = (articleId: string, commentId: string) => 
  doc(db, COLLECTIONS.ARTICLES, articleId, COLLECTIONS.COMMENTS, commentId) as DocumentReference<Comment>;

// Default site configuration data for initialization
export const defaultSiteConfig: SiteConfig = {
  theme: {
    primaryColor: '#3B82F6',
    secondaryColor: '#1F2937',
    fontFamily: 'Inter',
    headerStyle: 'modern',
    layoutStyle: 'grid',
    updatedAt: new Date() as any // Will be replaced with Firestore Timestamp
  },
  branding: {
    siteName: 'My Personal Blog',
    tagline: 'Sharing thoughts and experiences',
    updatedAt: new Date() as any // Will be replaced with Firestore Timestamp
  },
  layout: {
    showSidebar: true,
    sidebarPosition: 'right',
    articlesPerPage: 10,
    showAuthorBio: true,
    showRelatedPosts: true,
    updatedAt: new Date() as any // Will be replaced with Firestore Timestamp
  },
  seo: {
    metaTitle: 'My Personal Blog',
    metaDescription: 'A personal blog sharing insights, experiences, and knowledge',
    keywords: ['blog', 'personal', 'writing', 'technology'],
    updatedAt: new Date() as any // Will be replaced with Firestore Timestamp
  }
};

// Collection initialization function (for admin use)
export const initializeCollections = async () => {
  // This function can be called to set up initial data
  // It should be used carefully and only by admin users
  console.log('Firestore collections are ready to use');
  console.log('Available collections:', Object.values(COLLECTIONS));
};