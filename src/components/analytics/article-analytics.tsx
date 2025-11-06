'use client';

import { useArticleAnalytics, usePerformanceTracking, useErrorTracking } from '@/hooks/use-analytics';

interface ArticleAnalyticsProps {
  articleId: string;
  articleTitle: string;
  category: string;
  readingTime: number;
}

export function ArticleAnalytics({ 
  articleId, 
  articleTitle, 
  category, 
  readingTime 
}: ArticleAnalyticsProps) {
  // Use the enhanced analytics hook
  useArticleAnalytics(articleId, articleTitle, category, readingTime);
  
  // Track performance metrics for this article
  usePerformanceTracking();
  
  // Track any errors that occur
  useErrorTracking();

  // This component doesn't render anything visible
  return null;
}