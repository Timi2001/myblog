'use client';

import { useState, useEffect } from 'react';
import { validateFeedUrls, calculateFeedStats, FeedStats } from '@/lib/rss-utils';

interface RSSFeedManagerProps {
  className?: string;
}

export function RSSFeedManager({ className = '' }: RSSFeedManagerProps) {
  const [feedStats, setFeedStats] = useState<FeedStats | null>(null);
  const [validationResults, setValidationResults] = useState<{ isValid: boolean; errors: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingFeeds, setTestingFeeds] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  const feedUrls = [
    { name: 'RSS 2.0', url: `${baseUrl}/rss.xml`, type: 'application/rss+xml' },
    { name: 'Atom 1.0', url: `${baseUrl}/atom.xml`, type: 'application/atom+xml' },
    { name: 'JSON Feed', url: `${baseUrl}/feed.json`, type: 'application/feed+json' }
  ];

  useEffect(() => {
    loadFeedData();
  }, []);

  const loadFeedData = async () => {
    setLoading(true);
    try {
      // Validate feed URLs
      const validation = validateFeedUrls(baseUrl);
      setValidationResults(validation);

      // Load feed statistics (we'll fetch from RSS feed)
      const response = await fetch(`${baseUrl}/rss.xml`);
      if (response.ok) {
        const rssText = await response.text();
        // Parse RSS to get basic stats (simplified)
        const itemMatches = rssText.match(/<item>/g);
        const itemCount = itemMatches ? itemMatches.length : 0;
        
        // Calculate basic stats
        const stats: FeedStats = {
          totalItems: itemCount,
          averageContentLength: 0, // Would need to parse content
          categoriesCount: 0, // Would need to parse categories
          updateFrequency: 'Unknown'
        };
        
        setFeedStats(stats);
      }
    } catch (error) {
      console.error('Error loading feed data:', error);
    } finally {
      setLoading(false);
    }
  };

  const testFeedUrls = async () => {
    setTestingFeeds(true);
    const results = [];
    
    for (const feed of feedUrls) {
      try {
        const response = await fetch(feed.url);
        results.push({
          ...feed,
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          contentType: response.headers.get('content-type') || 'unknown'
        });
      } catch (error) {
        results.push({
          ...feed,
          status: 'error',
          statusCode: 0,
          contentType: 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    setTestingFeeds(false);
    return results;
  };

  const regenerateFeeds = async () => {
    try {
      // Trigger feed regeneration by making requests to all feed endpoints
      await Promise.all(feedUrls.map(feed => fetch(feed.url)));
      await loadFeedData();
    } catch (error) {
      console.error('Error regenerating feeds:', error);
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            RSS Feed Management
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={testFeedUrls}
              disabled={testingFeeds}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm"
            >
              {testingFeeds ? 'Testing...' : 'Test Feeds'}
            </button>
            <button
              onClick={regenerateFeeds}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              Regenerate Feeds
            </button>
          </div>
        </div>

        {/* Feed URLs */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Available Feeds
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {feedUrls.map((feed, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{feed.name}</h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {feed.type.split('/')[1]}
                  </span>
                </div>
                <div className="space-y-2">
                  <a
                    href={feed.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm break-all"
                  >
                    {feed.url}
                  </a>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(feed.url)}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Copy URL
                    </button>
                    <button
                      onClick={() => window.open(feed.url, '_blank')}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      View Feed
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feed Statistics */}
        {feedStats && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Feed Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {feedStats.totalItems}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Articles</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {feedStats.categoriesCount}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Categories</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {feedStats.updateFrequency}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Update Frequency</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {feedStats.averageContentLength > 0 
                    ? `${Math.round(feedStats.averageContentLength / 1000)}k`
                    : 'N/A'
                  }
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Content Length</div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Results */}
        {validationResults && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Feed Validation
            </h3>
            <div className={`p-4 rounded-lg ${
              validationResults.isValid 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {validationResults.isValid ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium">
                    {validationResults.isValid ? 'All feeds are valid' : 'Feed validation issues found'}
                  </h4>
                  {!validationResults.isValid && validationResults.errors.length > 0 && (
                    <ul className="mt-2 text-sm list-disc list-inside">
                      {validationResults.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feed Discovery */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Feed Discovery
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              The following meta tags are automatically added to your site's HTML head for feed discovery:
            </p>
            <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded border overflow-x-auto">
{`<!-- RSS Feed Discovery -->
<link rel="alternate" type="application/rss+xml" title="RSS Feed" href="${baseUrl}/rss.xml" />
<link rel="alternate" type="application/atom+xml" title="Atom Feed" href="${baseUrl}/atom.xml" />
<link rel="alternate" type="application/feed+json" title="JSON Feed" href="${baseUrl}/feed.json" />`}
            </pre>
          </div>
        </div>

        {/* Feed Submission */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Submit to Feed Directories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Google News', url: 'https://publishercenter.google.com/publications', description: 'Submit to Google News' },
              { name: 'Bing News', url: 'https://www.bing.com/webmaster/help/how-to-submit-sitemaps-82a15bd4', description: 'Submit to Bing News' },
              { name: 'Apple News', url: 'https://www.apple.com/apple-news/for-publishers/', description: 'Submit to Apple News' },
              { name: 'Feedburner', url: 'https://feedburner.google.com/', description: 'Manage with Feedburner' },
              { name: 'Feedly', url: 'https://feedly.com/', description: 'Check on Feedly' },
              { name: 'RSS Validator', url: 'https://validator.w3.org/feed/', description: 'Validate your RSS feed' }
            ].map((service, index) => (
              <a
                key={index}
                href={service.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">{service.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{service.description}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}