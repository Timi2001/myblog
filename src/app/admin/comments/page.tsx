'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Comment } from '@/types';

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null;

  useEffect(() => {
    fetchComments();
  }, [statusFilter]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = statusFilter 
        ? `/api/admin/comments?status=${statusFilter}`
        : '/api/admin/comments';
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setComments(result.data);
      } else {
        setError(result.error || 'Failed to fetch comments');
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAction = async (commentId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      setActionLoading(commentId);
      
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
          return;
        }
        
        const response = await fetch(`/api/admin/comments/${commentId}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (result.success) {
          setComments(prev => prev.filter(comment => comment.id !== commentId));
        } else {
          alert(result.error || 'Failed to delete comment');
        }
      } else {
        const status = action === 'approve' ? 'approved' : 'rejected';
        
        const response = await fetch(`/api/admin/comments/${commentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          setComments(prev => 
            prev.map(comment => 
              comment.id === commentId 
                ? { ...comment, status: status as Comment['status'] }
                : comment
            )
          );
        } else {
          alert(result.error || `Failed to ${action} comment`);
        }
      }
    } catch (err) {
      console.error(`Error ${action}ing comment:`, err);
      alert(`Failed to ${action} comment`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: Comment['status']) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
          <h1 className="text-2xl font-bold text-gray-900">Comments</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and moderate blog comments.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <Link
            href="/admin/comments"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              !statusFilter
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending ({comments.filter(c => c.status === 'pending').length})
          </Link>
          <Link
            href="/admin/comments?status=approved"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              statusFilter === 'approved'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Approved ({comments.filter(c => c.status === 'approved').length})
          </Link>
          <Link
            href="/admin/comments?status=rejected"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              statusFilter === 'rejected'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Rejected ({comments.filter(c => c.status === 'rejected').length})
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

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No comments</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter 
              ? `No ${statusFilter} comments found.`
              : 'No comments to moderate.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {comments.map((comment) => (
              <li key={comment.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusBadge(comment.status)}
                        <p className="text-sm font-medium text-gray-900">
                          {comment.authorName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {comment.authorEmail}
                        </p>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>
                          Article ID: {comment.articleId}
                        </span>
                        <span>•</span>
                        <span>
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {comment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleCommentAction(comment.id, 'approve')}
                            disabled={actionLoading === comment.id}
                            className="inline-flex items-center px-3 py-1.5 border border-green-300 shadow-sm text-xs font-medium rounded text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            {actionLoading === comment.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleCommentAction(comment.id, 'reject')}
                            disabled={actionLoading === comment.id}
                            className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            {actionLoading === comment.id ? 'Processing...' : 'Reject'}
                          </button>
                        </>
                      )}
                      
                      {comment.status === 'rejected' && (
                        <button
                          onClick={() => handleCommentAction(comment.id, 'approve')}
                          disabled={actionLoading === comment.id}
                          className="inline-flex items-center px-3 py-1.5 border border-green-300 shadow-sm text-xs font-medium rounded text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          {actionLoading === comment.id ? 'Processing...' : 'Approve'}
                        </button>
                      )}
                      
                      {comment.status === 'approved' && (
                        <button
                          onClick={() => handleCommentAction(comment.id, 'reject')}
                          disabled={actionLoading === comment.id}
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          {actionLoading === comment.id ? 'Processing...' : 'Reject'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleCommentAction(comment.id, 'delete')}
                        disabled={actionLoading === comment.id}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {actionLoading === comment.id ? 'Deleting...' : 'Delete'}
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