'use client';

import { useSiteConfig } from '@/hooks/use-site-config';
import { SearchForm } from './search-form';

export function HeroSection() {
  const { config, loading } = useSiteConfig();

  if (loading) {
    return (
      <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-pulse">
        <div className="h-8 sm:h-12 lg:h-16 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
        <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-6 sm:mb-8"></div>
        <div className="max-w-sm sm:max-w-md mx-auto">
          <div className="h-10 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center mb-8 sm:mb-12 lg:mb-16">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
        Welcome to <span className="block sm:inline">{config.branding.siteName}</span>
      </h1>
      <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto mb-6 sm:mb-8 lg:mb-10 leading-relaxed px-4 sm:px-0">
        {config.branding.tagline}
      </p>
      
      {/* Search Form */}
      <div className="max-w-sm sm:max-w-md lg:max-w-lg mx-auto px-4 sm:px-0">
        <SearchForm placeholder="Search articles..." />
      </div>
    </div>
  );
}