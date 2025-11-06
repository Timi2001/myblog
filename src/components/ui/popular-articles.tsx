'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { enhancedAnalyticsService, ArticlePerformance } from '@/lib/analytics-enhanced';

interface PopularArticlesProps {
  period?: '24h' | '7d' | '30d' | 'all';
  limit?: number;
  className?: string;
  showImages?: boolean;
  showMetrics?: boolean;
}

export function PopularArticles({ 
  period = '7d', 
  limit = 5, 
  className = '',
  showImages = true,
  showMetrics = true
}: PopularArticlesProps) {
  const [articles, setArticles] = useState<ArticlePerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPopularArticles();
  }, [period, limit]);

  const loadPopularArticles = async () => {
    setLoading(true);
    try {
      const popularArticles = await enhancedAnalyticsService.getPopularArticles(period, limit);
      setArticles(popularArticles);
    } catch (error) {
      console.error('Error loading popular articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getPeriodLabel = (period: string): string => {
    switch (period) {
      case '24h': return 'Last 24 Hours';
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case 'all': return 'All Time';
      default: return 'Popular';
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="flex space-x-3">
              {showImages && <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>}
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Popular Articles ({getPeriodLabel(period)})
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No popular articles found for this period.
        </p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Popular Articles ({getPeriodLabel(period)})
      </h3>
      
      <div className="space-y-4">
        {articles.map((article, index) => (
          <div key={article.id} className="flex items-start space-x-3 group">
            {/* Rank Number */}
            <div className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {index + 1}
              </span>
            </div>

            {/* Article Image */}
            {showImages && (
              <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                {/* Placeholder for article image - you'd need to fetch this from article data */}
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
              </div>
            )}

            {/* Article Content */}
            <div className="flex-1 min-w-0">
              <Link 
                href={`/articles/${article.slug || article.articleId}`}
                className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              >
                <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-tight">
                  {article.title || `Article ${article.articleId}`}
                </h4>
              </Link>
              
              {showMetrics && (
                <div className="mt-1 flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {formatNumber(article.views)} views
                  </span>
                  
                  {article.averageTimeSpent > 0 && (
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {Math.round(article.averageTimeSpent / 60)}m read
                    </span>
                  )}

                  {article.trending && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      🔥 Trending
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Link 
          href="/popular"
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          View all popular articles →
        </Link>
      </div>
    </div>
  );
}