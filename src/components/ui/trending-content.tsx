'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { enhancedAnalyticsService, TrendingContent } from '@/lib/analytics-enhanced';

interface TrendingContentProps {
  limit?: number;
  className?: string;
  showGrowth?: boolean;
  layout?: 'list' | 'grid';
}

export function TrendingContentComponent({ 
  limit = 5, 
  className = '',
  showGrowth = true,
  layout = 'list'
}: TrendingContentProps) {
  const [trendingContent, setTrendingContent] = useState<TrendingContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendingContent();
  }, [limit]);

  const loadTrendingContent = async () => {
    setLoading(true);
    try {
      const trending = await enhancedAnalyticsService.getTrendingContent(limit);
      setTrendingContent(trending);
    } catch (error) {
      console.error('Error loading trending content:', error);
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

  const formatGrowth = (growth: number): string => {
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className={layout === 'grid' ? 'p-4 border rounded-lg' : 'flex space-x-3'}>
              {layout === 'list' && <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>}
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                {showGrowth && <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (trendingContent.length === 0) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="mr-2">🔥</span>
          Trending Now
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No trending content at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <span className="mr-2">🔥</span>
        Trending Now
      </h3>
      
      <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
        {trendingContent.map((content, index) => (
          <div 
            key={content.articleId} 
            className={`group ${
              layout === 'grid' 
                ? 'border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow' 
                : 'flex items-start space-x-3'
            }`}
          >
            {/* Trending Rank */}
            <div className={`flex-shrink-0 ${layout === 'grid' ? 'mb-3' : ''}`}>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">
                    {content.trendingRank}
                  </span>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  🔥 #{content.trendingRank}
                </span>
              </div>
            </div>

            {/* Content Image (for grid layout) */}
            {layout === 'grid' && content.featuredImage && (
              <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded mb-3 overflow-hidden">
                <Image
                  src={content.featuredImage}
                  alt={content.title}
                  width={300}
                  height={128}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            )}

            {/* Content Image (for list layout) */}
            {layout === 'list' && (
              <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                {content.featuredImage ? (
                  <Image
                    src={content.featuredImage}
                    alt={content.title}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-400 to-pink-500"></div>
                )}
              </div>
            )}

            {/* Article Content */}
            <div className="flex-1 min-w-0">
              <Link 
                href={`/articles/${content.slug}`}
                className="block group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors"
              >
                <h4 className={`font-medium text-gray-900 dark:text-white line-clamp-2 leading-tight ${
                  layout === 'grid' ? 'text-base mb-2' : 'text-sm'
                }`}>
                  {content.title}
                </h4>
              </Link>
              
              {content.category && (
                <div className="mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {content.category}
                  </span>
                </div>
              )}

              {/* Metrics */}
              <div className={`flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 ${
                layout === 'grid' ? 'mt-3' : 'mt-1'
              }`}>
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {formatNumber(content.views24h)} today
                </span>
                
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {formatNumber(content.views7d)} this week
                </span>

                {showGrowth && content.viewsGrowth > 0 && (
                  <span className={`flex items-center font-medium ${
                    content.viewsGrowth > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
                  }`}>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {formatGrowth(content.viewsGrowth)}
                  </span>
                )}
              </div>

              {/* Engagement Score (for grid layout) */}
              {layout === 'grid' && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Engagement Score</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {content.engagementScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Link 
          href="/trending"
          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium flex items-center"
        >
          <span className="mr-1">🔥</span>
          View all trending content →
        </Link>
      </div>
    </div>
  );
}