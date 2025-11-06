'use client';

import { useState } from 'react';
import { CommentForm } from './comment-form';
import { CommentList } from './comment-list';

interface CommentsSectionProps {
  articleId: string;
  className?: string;
}

export function CommentsSection({ articleId, className = '' }: CommentsSectionProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCommentSubmitted = () => {
    // Trigger a refresh of the comment list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className={className}>
      <CommentList 
        articleId={articleId}
        refreshTrigger={refreshTrigger}
        className="mb-8"
      />
      <CommentForm 
        articleId={articleId}
        onCommentSubmitted={handleCommentSubmitted}
      />
    </div>
  );
}