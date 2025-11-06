import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Article Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The article you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </Link>
          <div>
            <Link
              href="/search"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Search for articles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}