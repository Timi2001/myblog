import Link from 'next/link';
import Image from 'next/image';
import { Article, Category } from '@/types';
import { cn } from '@/utils/cn';

interface ArticleCardProps {
  article: Article & { category?: Category | null };
  className?: string;
}

export function ArticleCard({ article, className }: ArticleCardProps) {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <article className={cn(
      "group bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all duration-200 h-full flex flex-col",
      className
    )}>
      <Link href={`/articles/${article.slug}`} className="block h-full flex flex-col">
        {article.featuredImage && (
          <div className="aspect-video relative overflow-hidden flex-shrink-0">
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          </div>
        )}
        
        <div className="p-4 sm:p-6 flex-1 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
            {article.category && (
              <span 
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0"
                style={{ 
                  backgroundColor: article.category.color ? `${article.category.color}20` : '#3b82f620',
                  color: article.category.color || '#3b82f6'
                }}
              >
                {article.category.name}
              </span>
            )}
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {formatDate(article.publishedAt || article.createdAt)}
            </span>
          </div>
          
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 group-hover:text-primary transition-colors leading-tight line-clamp-2">
            {article.title}
          </h2>
          
          {article.excerpt && (
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-1 leading-relaxed">
              {article.excerpt}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-auto pt-2">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {article.readingTime} min read
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {article.viewCount} views
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}