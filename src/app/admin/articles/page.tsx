'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Article, Category } from '@/types';

interface ArticleWithCategory extends Article {
  category?: Category;
}

export default function AdminArticles() {
  const [articles, setArticles] = useState<ArticleWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') as 'draft' | 'published' | 'archived' | null;

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [statusFilter]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = statusFilter 
        ? `/api/admin/articles?status=${statusFilter}`
        : '/api/admin/articles';
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setArticles(result.data);
      } else {
        setError(result.error || 'Failed to fetch articles');
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleDelete = async (articleId: string, articleTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${articleTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(articleId);
      
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Remove article from local state
        setArticles(prev => prev.filter(article => article.id !== articleId));
      } else {
        alert(result.error || 'Failed to delete article');
      }
    } catch (err) {
      console.error('Error deleting article:', err);
      alert('Failed to delete article');
    } finally {
      setDeleteLoading(null);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  const getStatusBadge = (status: Article['status']) => {
    const styles = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white shadow rounded-lg p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your blog articles and content.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Article
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <Link
            href="/admin/articles"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              !statusFilter
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Articles ({articles.length})
          </Link>
          <Link
            href="/admin/articles?status=published"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              statusFilter === 'published'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Published ({articles.filter(a => a.status === 'published').length})
          </Link>
          <Link
            href="/admin/articles?status=draft"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              statusFilter === 'draft'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Drafts ({articles.filter(a => a.status === 'draft').length})
          </Link>
          <Link
            href="/admin/articles?status=archived"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              statusFilter === 'archived'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Archived ({articles.filter(a => a.status === 'archived').length})
          </Link>
        </nav>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Articles List */}
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No articles</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter 
              ? `No ${statusFilter} articles found.`
              : 'Get started by creating your first article.'
            }
          </p>
          <div className="mt-6">
            <Link
              href="/admin/articles/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Article
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {articles.map((article) => (
              <li key={article.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(article.status)}
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {article.title}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                        <span>
                          Category: {getCategoryName(article.categoryId)}
                        </span>
                        <span>•</span>
                        <span>
                          {article.readingTime} min read
                        </span>
                        <span>•</span>
                        <span>
                          {article.createdAt?.toDate?.()?.toLocaleDateString() || 'No date'}
                        </span>
                        {article.status === 'published' && (
                          <>
                            <span>•</span>
                            <span>
                              {article.viewCount} views
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {article.status === 'published' && (
                        <Link
                          href={`/articles/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          View
                        </Link>
                      )}
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id, article.title)}
                        disabled={deleteLoading === article.id}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {deleteLoading === article.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}