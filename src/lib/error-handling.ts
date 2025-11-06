// Error handling utilities for production
import React from 'react';

export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class ValidationError extends CustomError {
  constructor(message: string, field?: string) {
    super(
      message,
      'VALIDATION_ERROR',
      400,
      true
    );
    
    if (field) {
      this.message = `${field}: ${message}`;
    }
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401, true);
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403, true);
  }
}

export class NotFoundError extends CustomError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404, true);
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = 'Too many requests') {
    super(message, 'RATE_LIMIT', 429, true);
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string = 'Database operation failed') {
    super(message, 'DATABASE_ERROR', 500, true);
  }
}

export class ExternalServiceError extends CustomError {
  constructor(service: string, message?: string) {
    super(
      message || `External service ${service} is unavailable`,
      'EXTERNAL_SERVICE_ERROR',
      503,
      true
    );
  }
}

// Error logging utility
export class ErrorLogger {
  private static instance: ErrorLogger;

  private constructor() {}

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  public log(error: Error | AppError, context?: Record<string, any>): void {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      ...(this.isAppError(error) && {
        code: error.code,
        statusCode: error.statusCode,
        isOperational: error.isOperational,
      }),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorInfo);
    }

    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(errorInfo);
    }
  }

  private isAppError(error: Error): error is AppError {
    return 'code' in error && 'statusCode' in error;
  }

  private sendToErrorService(errorInfo: any): void {
    // Integrate with error monitoring services like Sentry
    // Example:
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(errorInfo);
    // }
    
    // For now, just log to console in production
    console.error('Production error:', errorInfo);
  }
}

// Error boundary helper
export function handleError(error: Error, context?: Record<string, any>): void {
  const logger = ErrorLogger.getInstance();
  logger.log(error, context);
}

// API error handler
export function createApiError(
  message: string,
  statusCode: number = 500,
  code?: string
): Response {
  const error = {
    success: false,
    error: {
      message,
      code: code || 'API_ERROR',
      statusCode,
      timestamp: new Date().toISOString(),
    },
  };

  return new Response(JSON.stringify(error), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Async error wrapper for API routes
export function asyncHandler(
  handler: (req: Request, context?: any) => Promise<Response>
) {
  return async (req: Request, context?: any): Promise<Response> => {
    try {
      return await handler(req, context);
    } catch (error) {
      handleError(error as Error, { url: req.url, method: req.method });

      if (error instanceof CustomError) {
        return createApiError(error.message, error.statusCode, error.code);
      }

      // Generic error response
      return createApiError(
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : (error as Error).message,
        500
      );
    }
  };
}

// Client-side error boundary
export function withErrorBoundary<T extends Record<string, any>>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return function WrappedComponent(props: T) {
    try {
      return React.createElement(Component, props);
    } catch (error) {
      handleError(error as Error, { component: Component.name, props });
      
      // Return fallback UI
      return React.createElement('div', {
        className: "p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
      }, [
        React.createElement('h3', {
          key: 'title',
          className: "text-red-800 dark:text-red-200 font-medium"
        }, 'Something went wrong'),
        React.createElement('p', {
          key: 'message',
          className: "text-red-600 dark:text-red-300 text-sm mt-1"
        }, 'Please try refreshing the page or contact support if the problem persists.')
      ]);
    }
  };
}

// Retry utility for failed operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        handleError(lastError, { 
          operation: operation.name, 
          attempts: attempt,
          maxRetries 
        });
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}

// Network error detection
export function isNetworkError(error: Error): boolean {
  return (
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('offline') ||
    error.name === 'NetworkError'
  );
}

// Firebase error handling
export function handleFirebaseError(error: any): CustomError {
  const code = error.code || 'firebase/unknown';
  const message = error.message || 'Firebase operation failed';

  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return new AuthenticationError('Invalid credentials');
    
    case 'auth/too-many-requests':
      return new RateLimitError('Too many failed attempts. Please try again later.');
    
    case 'permission-denied':
      return new AuthorizationError('Permission denied');
    
    case 'not-found':
      return new NotFoundError('Document');
    
    case 'unavailable':
      return new ExternalServiceError('Firebase', 'Service temporarily unavailable');
    
    default:
      return new DatabaseError(message);
  }
}

// Global error handler setup
export function setupGlobalErrorHandling(): void {
  if (typeof window !== 'undefined') {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      handleError(new Error(event.reason), { type: 'unhandledrejection' });
    });

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      handleError(event.error, { 
        type: 'uncaught',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
  }
}

// Initialize error handling
if (typeof window !== 'undefined') {
  setupGlobalErrorHandling();
}