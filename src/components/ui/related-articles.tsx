'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article, Category } from '@/types';

interface RelatedArticlesProps {
  currentArticleId: string;
  categoryId: string;
  tags: string[];
  limit?: number;
  className?: string;
}

interface ArticleWithCategory extends Article {
  category?: Category;
}

export function RelatedArticles({ 
  currentArticleId, 
  categoryId, 
  tags, 
  limit = 3,
  className = '' 
}: RelatedArticlesProps) {
  const [relatedArticles, setRelatedArticles] = useState<ArticleWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRelatedArticles();
  }, [currentArticleId, categoryId, tags]);

  const fetchRelatedArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch articles from the same category
      const response = await fetch(`/api/articles?categoryId=${categoryId}&limit=10`);
      const result = await response.json();

      if (result.success) {
        // Filter out current article and calculate relevance scores
        const articles = result.data.articles
          .filter((article: Article) => article.id !== currentArticleId)
          .map((article: Article) => {
            let score = 0;
            
            // Same category gets base score
            if (article.categoryId === categoryId) {
              score += 10;
            }
            
            // Matching tags get additional points
            const matchingTags = article.tags.filter(tag => tags.includes(tag));
            score += matchingTags.length * 5;
            
            // More recent articles get slight boost
            const daysSincePublished = article.publishedAt 
              ? (Date.now() - new Date(article.publishedAt.seconds * 1000).getTime()) / (1000 * 60 * 60 * 24)
              : 999;
            
            if (daysSincePublished < 30) score += 2;
            if (daysSincePublished < 7) score += 1;
            
            return { ...article, relevanceScore: score };
          })
          .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
          .slice(0, limit);

        setRelatedArticles(articles);
      } else {
        setError('Failed to fetch related articles');
      }
    } catch (err) {
      console.error('Error fetching related articles:', err);
      setError('Failed to fetch related articles');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Related Articles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || relatedArticles.length === 0) {
    return null; // Don't show anything if there are no related articles
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Related Articles
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedArticles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="group block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Featured Image */}
            {article.featuredImage && (
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src={article.featuredImage}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            
            {/* Content */}
            <div className="p-4">
              {/* Category Badge */}
              {article.category && (
                <div className="mb-2">
                  <span 
                    className="inline-block px-2 py-1 text-xs font-medium text-white rounded-full"
                    style={{ backgroundColor: article.category.color || '#3B82F6' }}
                  >
                    {article.category.name}
                  </span>
                </div>
              )}
              
              {/* Title */}
              <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                {article.title}
              </h4>
              
              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                  {article.excerpt}
                </p>
              )}
              
              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {article.readingTime} min read
                </span>
                <span>
                  {article.publishedAt 
                    ? new Date(article.publishedAt.seconds * 1000).toLocaleDateString()
                    : 'Draft'
                  }
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}