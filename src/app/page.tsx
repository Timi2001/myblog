import { Suspense } from 'react';
import { ArticleCard } from '@/components/ui/article-card';
import { Pagination } from '@/components/ui/pagination';
import { CategoryNavigation } from '@/components/ui/category-navigation';
import { HeroSection } from '@/components/ui/hero-section';
import { PopularArticles } from '@/components/ui/popular-articles';
import { TrendingContentComponent } from '@/components/ui/trending-content';
import { CollectionPageStructuredData, BlogStructuredData } from '@/components/seo/structured-data';
import { Article, Category } from '@/types';
import { generateSiteMetadata } from '@/lib/metadata';

export async function generateMetadata() {
  return generateSiteMetadata();
}

interface HomePageProps {
  searchParams: {
    page?: string;
  };
}

async function getArticles(page: number = 1) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/articles?page=${page}&limit=10`, {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return {
      success: false,
      data: {
        articles: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          limit: 10
        }
      }
    };
  }
}

function ArticleGrid({ articles }: { articles: (Article & { category?: Category | null })[] }) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12 lg:py-16">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          No articles yet
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
          Check back soon for new content!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
          <div className="aspect-video bg-gray-200 dark:bg-gray-700"></div>
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function Home({ searchParams }: HomePageProps) {
  const page = parseInt(searchParams.page || '1');
  const result = await getArticles(page);
  
  const { articles, pagination } = result.data;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Prepare structured data for articles
  const articlesForStructuredData = articles.map((article: Article) => ({
    title: article.title,
    url: `${baseUrl}/articles/${article.slug}`,
    datePublished: article.publishedAt 
      ? new Date(article.publishedAt.seconds * 1000).toISOString()
      : new Date().toISOString(),
    author: 'Blog Author',
  }));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* Structured Data */}
      <BlogStructuredData
        siteName="My Personal Blog"
        siteUrl={baseUrl}
        description="A modern personal blog sharing insights, experiences, and knowledge"
        author="Blog Author"
      />
      
      {articles.length > 0 && (
        <CollectionPageStructuredData
          name="Latest Articles"
          description="Browse the latest articles from our blog"
          url={baseUrl}
          articles={articlesForStructuredData}
        />
      )}

      {/* Hero Section */}
      <HeroSection />

      {/* Category Navigation */}
      <CategoryNavigation className="mb-8 sm:mb-12 lg:mb-16" />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
        {/* Main Articles Section */}
        <section className="lg:col-span-3">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white mb-6 sm:mb-8 lg:mb-12">
            Latest Articles
          </h2>
          
          <Suspense fallback={<LoadingSkeleton />}>
            <ArticleGrid articles={articles} />
          </Suspense>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 sm:mt-12 lg:mt-16">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
                basePath="/"
              />
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-8">
          {/* Trending Content */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <TrendingContentComponent 
              limit={5} 
              showGrowth={true}
              layout="list"
            />
          </div>

          {/* Popular Articles */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <PopularArticles 
              period="7d" 
              limit={5}
              showImages={false}
              showMetrics={true}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
