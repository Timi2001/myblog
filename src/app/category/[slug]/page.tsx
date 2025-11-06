import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ArticleCard } from '@/components/ui/article-card';
import { Pagination } from '@/components/ui/pagination';
import { Article, Category } from '@/types';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: {
    page?: string;
  };
}

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/categories`,
      {
        next: { revalidate: 60 }
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    if (data.success) {
      return data.data.find((cat: Category) => cat.slug === slug) || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

async function getCategoryArticles(categoryId: string, page: number = 1) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/articles?categoryId=${categoryId}&page=${page}&limit=10`,
      {
        next: { revalidate: 60 }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching category articles:', error);
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

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  
  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
    };
  }

  // Import the metadata function dynamically to avoid circular imports
  const { generateCategoryMetadata } = await import('@/lib/metadata');
  
  return generateCategoryMetadata(category);
}

function ArticleGrid({ articles }: { articles: (Article & { category?: Category | null })[] }) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          No articles in this category yet
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Check back soon for new content!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
          <div className="aspect-video bg-gray-200 dark:bg-gray-700"></div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
            <div className="flex justify-between">
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const page = parseInt(searchParams.page || '1');
  
  const category = await getCategory(slug);
  
  if (!category) {
    notFound();
  }

  const result = await getCategoryArticles(category.id, page);
  const { articles, pagination } = result.data;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            {category.name}
          </h1>
        </div>
        
        {category.description && (
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {category.description}
          </p>
        )}
        
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {pagination.totalCount} {pagination.totalCount === 1 ? 'article' : 'articles'} in this category
        </div>
      </div>

      {/* Articles Section */}
      <section>
        <Suspense fallback={<LoadingSkeleton />}>
          <ArticleGrid articles={articles} />
        </Suspense>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              basePath={`/category/${slug}`}
            />
          </div>
        )}
      </section>
    </div>
  );
}