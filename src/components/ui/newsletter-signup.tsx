'use client';

import { useState } from 'react';
import { cn } from '@/utils/cn';
import { trackNewsletterSubscription } from '@/lib/analytics';

interface NewsletterSignupProps {
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
  showDescription?: boolean;
}

export function NewsletterSignup({ 
  className, 
  variant = 'default',
  showDescription = true 
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Successfully subscribed to newsletter!' });
        setEmail('');
        
        // Track newsletter subscription
        trackNewsletterSubscription('form');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to subscribe' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const isCompact = variant === 'compact';
  const isInline = variant === 'inline';

  return (
    <div className={cn(
      'newsletter-signup',
      isCompact && 'space-y-2',
      !isCompact && 'space-y-4',
      className
    )}>
      {showDescription && !isInline && (
        <div className={cn(
          isCompact ? 'space-y-1' : 'space-y-2'
        )}>
          <h3 className={cn(
            'font-semibold text-gray-900',
            isCompact ? 'text-lg' : 'text-xl'
          )}>
            Stay Updated
          </h3>
          <p className={cn(
            'text-gray-600',
            isCompact ? 'text-sm' : 'text-base'
          )}>
            Get the latest articles delivered straight to your inbox.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={cn(
        isInline ? 'flex gap-2' : 'space-y-3'
      )}>
        <div className={cn(
          isInline && 'flex-1'
        )}>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={isLoading}
            className={cn(
              'w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md',
              'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'placeholder:text-gray-400 bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-white',
              isCompact ? 'text-sm py-2' : 'text-base'
            )}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'px-4 sm:px-6 py-3 bg-blue-600 text-white font-medium rounded-md',
            'hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors duration-200 touch-target',
            isCompact ? 'text-sm py-2' : 'text-base',
            isInline && 'flex-shrink-0'
          )}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="hidden sm:inline">Subscribing...</span>
              <span className="sm:hidden">...</span>
            </span>
          ) : (
            <>
              <span className="hidden sm:inline">Subscribe</span>
              <span className="sm:hidden">Join</span>
            </>
          )}
        </button>
      </form>

      {message && (
        <div className={cn(
          'p-3 rounded-md text-sm',
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        )}>
          {message.text}
        </div>
      )}

      {!isInline && (
        <p className="text-xs text-gray-500">
          We respect your privacy. Unsubscribe at any time.
        </p>
      )}
    </div>
  );
}