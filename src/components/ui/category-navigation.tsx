'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Category } from '@/types';

interface CategoryNavigationProps {
  className?: string;
  showAll?: boolean;
  maxCategories?: number;
}

export function CategoryNavigation({ 
  className = '',
  showAll = false,
  maxCategories = 6
}: CategoryNavigationProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      
      if (result.success) {
        const categoriesToShow = showAll 
          ? result.data 
          : result.data.slice(0, maxCategories);
        setCategories(categoriesToShow);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 sm:h-10 w-20 sm:w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
        Browse by Category
      </h3>
      
      <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="inline-flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors touch-target"
          >
            <div
              className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full mr-2"
              style={{ backgroundColor: category.color }}
            />
            <span className="truncate max-w-[120px] sm:max-w-none">{category.name}</span>
          </Link>
        ))}
        
        {!showAll && (
          <Link
            href="/categories"
            className="inline-flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors touch-target"
          >
            <span className="hidden sm:inline">View All Categories</span>
            <span className="sm:hidden">View All</span>
            <svg className="ml-1 h-3 sm:h-4 w-3 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}