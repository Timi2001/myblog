'use client';

import Link from 'next/link';
import { Category } from '@/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId?: string;
  baseUrl: string;
  searchQuery?: string;
  className?: string;
}

export function CategoryFilter({ 
  categories, 
  selectedCategoryId, 
  baseUrl,
  searchQuery,
  className = ''
}: CategoryFilterProps) {
  const buildUrl = (categoryId?: string) => {
    const params = new URLSearchParams();
    
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    
    if (categoryId) {
      params.set('categoryId', categoryId);
    }
    
    return `${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;
  };

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Filter by Category
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {/* All Categories */}
        <Link
          href={buildUrl()}
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !selectedCategoryId
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All Categories
        </Link>

        {/* Individual Categories */}
        {categories.map((category) => (
          <Link
            key={category.id}
            href={buildUrl(category.id)}
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategoryId === category.id
                ? 'text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            style={
              selectedCategoryId === category.id
                ? { backgroundColor: category.color }
                : {}
            }
          >
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: category.color }}
            />
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}