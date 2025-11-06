'use client';

import { useState, useEffect } from 'react';
import { Comment } from '@/types';

interface CommentListProps {
  articleId: string;
  refreshTrigger?: number;
  className?: string;
}

function CommentItem({ comment }: { comment: Comment }) {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {comment.authorName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {comment.authorName}
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {comment.content}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommentList({ articleId, refreshTrigger, className = '' }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [articleId, refreshTrigger]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/comments?articleId=${articleId}`);
      const result = await response.json();

      if (result.success) {
        setComments(result.data);
      } else {
        setError(result.error || 'Failed to load comments');
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Comments
        </h3>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Comments
        </h3>
        <div className="text-center py-8">
          <div className="text-red-600 dark:text-red-400 mb-2">
            Failed to load comments
          </div>
          <button
            onClick={fetchComments}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Comments ({comments.length})
      </h3>

      {comments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400 mb-2">
            No comments yet
          </div>
          <div className="text-sm text-gray-400 dark:text-gray-500">
            Be the first to share your thoughts!
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}