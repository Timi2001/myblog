'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { handleError, handleFirebaseError } from '@/lib/error-handling';
import { 
  ExclamationTriangleIcon as AlertTriangle, 
  ArrowPathIcon as RefreshCw, 
  ChartBarIcon as BarChart3 
} from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  retryCount: number;
}

export class AnalyticsErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `analytics-error-${Date.now()}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error with analytics context
    const analyticsError = this.isFirebaseError(error) 
      ? handleFirebaseError(error)
      : error;

    handleError(analyticsError, {
      component: 'AnalyticsErrorBoundary',
      errorInfo,
      errorId: this.state.errorId,
      retryCount: this.state.retryCount,
      context: 'analytics-dashboard',
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private isFirebaseError(error: Error): boolean {
    return error.message.includes('Firebase') || 
           error.message.includes('firestore') ||
           error.message.includes('permission-denied') ||
           error.message.includes('unavailable');
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorId: null,
        retryCount: prevState.retryCount + 1,
      }));
    } else {
      // Max retries reached, reload the page
      window.location.reload();
    }
  };

  private renderFallbackUI() {
    const { error, retryCount } = this.state;
    const canRetry = retryCount < this.maxRetries;
    
    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Analytics Temporarily Unavailable
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {this.isFirebaseError(error!) 
              ? "We're having trouble connecting to our analytics service. This might be due to network issues or temporary service disruption."
              : "Something went wrong while loading the analytics dashboard. Don't worry, your data is safe."
            }
          </p>

          {error && process.env.NODE_ENV === 'development' && (
            <details className="mb-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error Details (Development)
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto">
                {error.message}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {canRetry ? (
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again ({this.maxRetries - retryCount} attempts left)
              </button>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </button>
            )}
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-center text-blue-700 dark:text-blue-300">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="text-sm">
                The admin panel continues to work normally
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallbackUI();
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping analytics components
export function withAnalyticsErrorBoundary<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  customFallback?: ReactNode
) {
  return function WrappedAnalyticsComponent(props: T) {
    return (
      <AnalyticsErrorBoundary fallback={customFallback}>
        <Component {...props} />
      </AnalyticsErrorBoundary>
    );
  };
}

// Lightweight error boundary for individual analytics widgets
export function AnalyticsWidgetErrorBoundary({ 
  children, 
  widgetName 
}: { 
  children: ReactNode; 
  widgetName: string;
}) {
  return (
    <AnalyticsErrorBoundary
      fallback={
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <AlertTriangle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {widgetName} temporarily unavailable
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Refresh to retry
            </button>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        handleError(error, {
          widget: widgetName,
          errorInfo,
          context: 'analytics-widget',
        });
      }}
    >
      {children}
    </AnalyticsErrorBoundary>
  );
}