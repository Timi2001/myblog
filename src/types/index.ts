import { Timestamp } from 'firebase/firestore';

// Core data models for the blog system
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  categoryId: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  metaTitle?: string;
  metaDescription?: string;
  readingTime: number;
  viewCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}

// Input type for creating articles (without auto-generated fields)
export interface CreateArticleInput {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  categoryId: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  metaTitle?: string;
  metaDescription?: string;
}

// Input type for updating articles
export interface UpdateArticleInput extends Partial<CreateArticleInput> {
  id: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdAt: Timestamp;
}

// Input type for creating categories
export interface CreateCategoryInput {
  name: string;
  description?: string;
  color?: string;
}

// Input type for updating categories
export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: Timestamp;
}

// Input type for creating tags
export interface CreateTagInput {
  name: string;
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

// Input type for creating comments
export interface CreateCommentInput {
  articleId: string;
  authorName: string;
  authorEmail: string;
  content: string;
}

export interface Subscriber {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  subscribedAt: Timestamp;
}

// Input type for newsletter subscription
export interface SubscribeInput {
  email: string;
}

// Input type for creating subscribers (without auto-generated fields)
export interface CreateSubscriberInput {
  email: string;
  status: 'active' | 'unsubscribed';
  subscribedAt: any; // FieldValue from Firestore
}

export interface SiteConfig {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    headerStyle: 'modern' | 'classic' | 'minimal';
    layoutStyle: 'grid' | 'list' | 'masonry';
    updatedAt: Timestamp;
  };
  branding: {
    siteName: string;
    tagline: string;
    logo?: string;
    favicon?: string;
    updatedAt: Timestamp;
  };
  layout: {
    showSidebar: boolean;
    sidebarPosition: 'left' | 'right';
    articlesPerPage: number;
    showAuthorBio: boolean;
    showRelatedPosts: boolean;
    updatedAt: Timestamp;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    googleAnalyticsId?: string;
    updatedAt: Timestamp;
  };
}

export interface PageView {
  id: string;
  articleId: string;
  timestamp: Timestamp;
  userAgent: string;
  referrer: string;
}

// Firebase document types (for Firestore operations)
export type FirebaseDocument<T> = T & {
  id: string;
};

// Firestore collection names (for type safety)
export const COLLECTIONS = {
  ARTICLES: 'articles',
  CATEGORIES: 'categories', 
  TAGS: 'tags',
  COMMENTS: 'comments',
  SUBSCRIBERS: 'subscribers',
  SITE_CONFIG: 'siteConfig',
  PAGE_VIEWS: 'pageViews'
} as const;

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Search and filter types
export interface SearchParams {
  query?: string;
  categoryId?: string;
  tags?: string[];
  status?: Article['status'];
}

// Contact form types
export interface ContactFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Analytics types
export interface ArticleAnalytics {
  articleId: string;
  views: number;
  averageReadTime: number;
  bounceRate: number;
  socialShares: number;
}

export interface SiteAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  totalArticles: number;
  totalSubscribers: number;
  popularArticles: Array<{
    articleId: string;
    title: string;
    views: number;
  }>;
}