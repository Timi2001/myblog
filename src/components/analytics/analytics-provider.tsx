'use client';

import { useAnalytics } from '@/hooks/use-analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // Initialize analytics tracking
  useAnalytics();

  return <>{children}</>;
}