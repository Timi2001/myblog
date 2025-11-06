'use client';

import { ComprehensiveAnalyticsDashboard } from '@/components/admin/comprehensive-analytics-dashboard';

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
      <ComprehensiveAnalyticsDashboard />
    </div>
  );
}