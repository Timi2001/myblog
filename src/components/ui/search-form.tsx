'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchFormProps {
  initialQuery?: string;
  placeholder?: string;
  className?: string;
}

function SearchFormInner({ 
  initialQuery = '', 
  placeholder = 'Search articles...',
  className = ''
}: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      return;
    }

    // Preserve existing search params (like categoryId) but update query and reset page
    const params = new URLSearchParams(searchParams);
    params.set('q', query.trim());
    params.delete('page'); // Reset to first page on new search
    
    router.push(`/search?${params.toString()}`);
  };

  const handleClear = () => {
    setQuery('');
    // Navigate to search page without query
    router.push('/search');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 sm:py-4 pl-12 pr-16 sm:pr-20 text-sm sm:text-base text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
        />
        
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
          <svg 
            className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-12 sm:right-16 flex items-center pr-1 sm:pr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 touch-target"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Search Button */}
        <button
          type="submit"
          disabled={!query.trim()}
          className="absolute inset-y-0 right-0 flex items-center px-3 sm:px-4 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-r-lg transition-colors touch-target"
          aria-label="Search"
        >
          <span className="sr-only">Search</span>
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
}

export function SearchForm(props: SearchFormProps) {
  return (
    <Suspense fallback={
      <div className={`relative ${props.className || ''}`}>
        <div className="relative">
          <input
            type="text"
            placeholder={props.placeholder || 'Search articles...'}
            className="w-full px-4 py-3 pl-12 pr-20 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            disabled
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    }>
      <SearchFormInner {...props} />
    </Suspense>
  );
}