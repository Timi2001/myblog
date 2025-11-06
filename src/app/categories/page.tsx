import { Metadata } from 'next';
import Link from 'next/link';
import { Category } from '@/types';

export const metadata: Metadata = {
  title: 'All Categories',
  description: 'Browse all article categories to find content that interests you.',
  openGraph: {
    title: 'All Categories',
    description: 'Browse all article categories to find content that interests you.',
    type: 'website',
  },
};

async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/categories`,
      {
        next: { revalidate: 60 } // Revalidate every 60 seconds
      }
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function getCategoryArticleCount(categoryId: string): Promise<number> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/articles?categoryId=${categoryId}&limit=1`,
      {
        next: { revalidate: 60 }
      }
    );
    
    if (!response.ok) {
      return 0;
    }
    
    const data = await response.json();
    return data.success ? data.data.pagination.totalCount : 0;
  } catch (error) {
    console.error('Error fetching article count:', error);
    return 0;
  }
}

function CategoryCard({ category, articleCount }: { category: Category; articleCount: number }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="block p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all"
    >
      <div className="flex items-center mb-3">
        <div
          className="w-4 h-4 rounded-full mr-3"
          style={{ backgroundColor: category.color }}
        />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {category.name}
        </h3>
      </div>
      
      {category.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {category.description}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {articleCount} {articleCount === 1 ? 'article' : 'articles'}
        </span>
        
        <svg 
          className="h-5 w-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5l7 7-7 7" 
          />
        </svg>
      </div>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 animate-pulse">
          <div className="flex items-center mb-3">
            <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 mr-3" />
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="space-y-2 mb-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  // Get article counts for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => ({
      category,
      articleCount: await getCategoryArticleCount(category.id)
    }))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          All Categories
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Browse articles by category to find content that interests you
        </p>
      </div>

      {/* Categories Grid */}
      <section>
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No categories yet
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Categories will appear here once they are created.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriesWithCounts.map(({ category, articleCount }) => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                articleCount={articleCount}
              />
            ))}
          </div>
        )}
      </section>

      {/* Back to Home */}
      <div className="text-center mt-12">
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}