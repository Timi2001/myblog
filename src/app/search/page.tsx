import { Metadata } from 'next';
import { Suspense } from 'react';
import { ArticleCard } from '@/components/ui/article-card';
import { Pagination } from '@/components/ui/pagination';
import { SearchForm } from '@/components/ui/search-form';
import { CategoryFilter } from '@/components/ui/category-filter';
import { Article, Category } from '@/types';

interface SearchPageProps {
  searchParams: {
    q?: string;
    page?: string;
    categoryId?: string;
  };
}

async function searchArticles(query: string, page: number = 1, categoryId?: string) {
  if (!query || query.trim().length === 0) {
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
        },
        query: ''
      }
    };
  }

  try {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: '10'
    });
    
    if (categoryId) {
      params.append('categoryId', categoryId);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/search?${params}`,
      {
        next: { revalidate: 60 }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to search articles');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching articles:', error);
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
        },
        query: query
      }
    };
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/categories`,
      {
        next: { revalidate: 60 }
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

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || '';
  
  if (!query) {
    return {
      title: 'Search Articles',
      description: 'Search through all our blog articles to find what you\'re looking for',
    };
  }

  // For search results, we'll use a simplified version since we don't have results count here
  const { generateSiteMetadata } = await import('@/lib/metadata');
  
  return generateSiteMetadata(
    `Search Results for "${query}"`,
    `Search results for "${query}" on our blog`,
    undefined,
    `/search?q=${encodeURIComponent(query)}`,
    'website'
  );
}

function SearchResults({ 
  articles, 
  query, 
  totalCount 
}: { 
  articles: (Article & { category?: Category | null })[];
  query: string;
  totalCount: number;
}) {
  if (!query || query.trim().length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Enter a search term
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Use the search box above to find articles by title or content.
        </p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          No results found for "{query}"
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Try adjusting your search terms or browse our categories to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Search Results for "{query}"
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Found {totalCount} {totalCount === 1 ? 'article' : 'articles'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </>
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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const page = parseInt(searchParams.page || '1');
  const categoryId = searchParams.categoryId;
  
  const [searchResult, categories] = await Promise.all([
    searchArticles(query, page, categoryId),
    getCategories()
  ]);
  
  const { articles, pagination } = searchResult.data;

  // Build search URL for pagination and filtering
  const buildSearchUrl = (newPage?: number, newCategoryId?: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (newPage && newPage !== 1) params.set('page', newPage.toString());
    if (newCategoryId) params.set('categoryId', newCategoryId);
    
    return `/search${params.toString() ? `?${params.toString()}` : ''}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Search Articles
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          Find articles by searching through titles and content
        </p>
        
        {/* Search Form */}
        <div className="max-w-2xl mx-auto">
          <SearchForm initialQuery={query} />
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-8">
          <CategoryFilter 
            categories={categories}
            selectedCategoryId={categoryId}
            baseUrl="/search"
            searchQuery={query}
          />
        </div>
      )}

      {/* Search Results */}
      <section>
        <Suspense fallback={<LoadingSkeleton />}>
          <SearchResults 
            articles={articles} 
            query={query}
            totalCount={pagination.totalCount}
          />
        </Suspense>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              basePath={buildSearchUrl()}
              searchParams={searchParams}
            />
          </div>
        )}
      </section>
    </div>
  );
}