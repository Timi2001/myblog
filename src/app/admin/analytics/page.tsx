'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the analytics dashboard to avoid SSR issues
const ComprehensiveAnalyticsDashboard = dynamic(
  () => import('@/components/admin/comprehensive-analytics-dashboard').then(mod => ({ default: mod.ComprehensiveAnalyticsDashboard })),
  { 
    ssr: false,
    loading: () => (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
        <div className="bg-gray-200 h-64 rounded-lg"></div>
      </div>
    )
  }
);

export default function AdminAnalyticsPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-600">
          Comprehensive analytics dashboard with real-time visitor tracking, popular articles, and trending content.
        </p>
      </div>

      {/* Comprehensive Analytics Dashboard */}
      <Suspense fallback={
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      }>
        <ComprehensiveAnalyticsDashboard />
      </Suspense>
    </div>
  );
}