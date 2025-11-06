'use client';

import { usePathname } from 'next/navigation';
import { useAnalytics } from '@/hooks/use-analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  
  // Skip analytics on admin routes to prevent interference
  const isAdminRoute = pathname?.startsWith('/admin');
  
  // Only initialize analytics tracking for non-admin routes
  if (!isAdminRoute) {
    useAnalytics();
  }

  return <>{children}</>;
}