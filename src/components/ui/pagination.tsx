import Link from 'next/link';
import { cn } from '@/utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  basePath?: string;
  searchParams?: Record<string, string | undefined>;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  basePath = '',
  searchParams = {},
  className
}: PaginationProps) {
  const generatePageUrl = (page: number) => {
    const url = new URL(basePath, 'http://localhost');
    
    // Add existing search params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') {
        url.searchParams.set(key, value);
      }
    });
    
    // Set the page parameter
    if (page > 1) {
      url.searchParams.set('page', page.toString());
    }
    
    return `${url.pathname}${url.search}`;
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className={cn("flex items-center justify-center space-x-1 sm:space-x-2", className)}>
      {/* Previous button */}
      {hasPreviousPage ? (
        <Link
          href={generatePageUrl(currentPage - 1)}
          className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 touch-target"
        >
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </Link>
      ) : (
        <span className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-300 bg-white border border-gray-300 rounded-md cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600">
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </span>
      )}

      {/* Page numbers - hide some on mobile */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        {getVisiblePages().map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`dots-${index}`}
                className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isCurrentPage = pageNumber === currentPage;

          // On mobile, only show current page and adjacent pages
          const isMobileVisible = Math.abs(pageNumber - currentPage) <= 1 || pageNumber === 1 || pageNumber === totalPages;

          return (
            <Link
              key={pageNumber}
              href={generatePageUrl(pageNumber)}
              className={cn(
                "px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md touch-target",
                isCurrentPage
                  ? "text-white bg-primary border border-primary"
                  : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300",
                !isMobileVisible && "hidden sm:inline-flex"
              )}
            >
              {pageNumber}
            </Link>
          );
        })}
      </div>

      {/* Next button */}
      {hasNextPage ? (
        <Link
          href={generatePageUrl(currentPage + 1)}
          className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 touch-target"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
        </Link>
      ) : (
        <span className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-300 bg-white border border-gray-300 rounded-md cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600">
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
        </span>
      )}
    </nav>
  );
}