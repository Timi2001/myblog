'use client';

import { useEffect } from 'react';
import { trackSearch } from '@/lib/analytics';

interface SearchAnalyticsProps {
  searchTerm: string;
  resultsCount: number;
}

export function SearchAnalytics({ searchTerm, resultsCount }: SearchAnalyticsProps) {
  useEffect(() => {
    if (searchTerm && searchTerm.trim().length > 0) {
      trackSearch(searchTerm, resultsCount);
    }
  }, [searchTerm, resultsCount]);

  // This component doesn't render anything visible
  return null;
}