import { Metadata } from 'next';
import { RSSFeedManager } from '@/components/admin/rss-feed-manager';

export const metadata: Metadata = {
  title: 'RSS Feeds | Admin',
  description: 'Manage RSS feeds and feed discovery',
};

export default function FeedsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <RSSFeedManager />
    </div>
  );
}