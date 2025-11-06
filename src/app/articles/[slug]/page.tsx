import { Metadata } from 'next';
import { SocialShare } from '@/components/ui/social-share';
import { RelatedArticles } from '@/components/ui/related-articles';
import { ArticleAnalytics } from '@/components/analytics/article-analytics';
import { ArticleStructuredData, BreadcrumbStructuredData } from '@/components/seo/structured-data';
import { CommentsSection } from '@/components/ui/comments-section';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Article, Category } from '@/types';

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getArticle(slug: string): Promise<(Article & { category?: Category | null }) | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/articles/${slug}`,
      {
        next: { revalidate: 300 } // Revalidate every 5 minutes for articles
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    };
  }

  // Import the metadata function dynamically to avoid circular imports
  const { generateArticleMetadata } = await import('@/lib/metadata');
  
  return generateArticleMetadata({
    ...article,
    category: article.category ? { name: article.category.name } : undefined
  }, 'Blog Author'); // You can make author configurable
}

function formatDate(timestamp: any) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

function formatContent(content: string) {
  // Check if content is HTML (from rich text editor) or plain text
  const isHTML = content.includes('<') && content.includes('>');
  
  if (isHTML) {
    // Render HTML content directly (sanitized by Tiptap)
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }
  
  // Fallback for plain text content
  return content
    .split('\n\n')
    .map((paragraph, index) => (
      <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
        {paragraph}
      </p>
    ));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Breadcrumb items for structured data
  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    ...(article.category ? [{ name: article.category.name, url: `${baseUrl}/category/${article.category.slug}` }] : []),
    { name: article.title, url: `${baseUrl}/articles/${article.slug}` },
  ];

  return (
    <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-4xl">
      {/* Structured Data */}
      <ArticleStructuredData 
        article={{
          ...article,
          category: article.category ? { name: article.category.name } : undefined
        }} 
        author="Blog Author" 
      />
      <BreadcrumbStructuredData items={breadcrumbItems} />
      
      {/* Analytics Tracking */}
      <ArticleAnalytics
        articleId={article.id}
        articleTitle={article.title}
        category={article.category?.name || 'Uncategorized'}
        readingTime={article.readingTime}
      />
      
      {/* Breadcrumb */}
      <nav className="mb-6 sm:mb-8">
        <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 overflow-x-auto">
          <li className="flex-shrink-0">
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300 touch-target">
              Home
            </Link>
          </li>
          <li className="flex-shrink-0">/</li>
          {article.category && (
            <>
              <li className="flex-shrink-0">
                <Link 
                  href={`/category/${article.category.slug}`}
                  className="hover:text-gray-700 dark:hover:text-gray-300 touch-target"
                >
                  {article.category.name}
                </Link>
              </li>
              <li className="flex-shrink-0">/</li>
            </>
          )}
          <li className="text-gray-700 dark:text-gray-300 truncate min-w-0">
            {article.title}
          </li>
        </ol>
      </nav>

      {/* Article Header */}
      <header className="mb-6 sm:mb-8 lg:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          {article.category && (
            <span 
              className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0"
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

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-4 sm:pb-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
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
          
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs sm:text-sm font-medium">Tags:</span>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {article.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {article.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    +{article.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {article.featuredImage && (
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none mb-8 sm:mb-12 lg:mb-16 prose-img:rounded-lg prose-img:shadow-lg prose-headings:scroll-mt-20">
        {formatContent(article.content)}
      </div>

      {/* Social Share */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mb-8">
        <SocialShare
          url={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/articles/${article.slug}`}
          title={article.title}
          description={article.excerpt}
          articleId={article.id}
          className="justify-center"
        />
      </div>

      {/* Related Articles */}
      <RelatedArticles
        currentArticleId={article.id}
        categoryId={article.categoryId}
        tags={article.tags}
        limit={3}
        className="border-t border-gray-200 dark:border-gray-700 pt-8 mb-8"
      />

      {/* Comments Section */}
      <CommentsSection 
        articleId={article.id}
        className="border-t border-gray-200 dark:border-gray-700 pt-8 mb-8"
      />

      {/* Article Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {formatDate(article.updatedAt)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {article.viewCount} views
          </div>
        </div>
      </footer>
    </article>
  );
}