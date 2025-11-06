import { handleError, handleFirebaseError, isNetworkError } from '@/lib/error-handling';

/**
 * Analytics-specific retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

/**
 * Default retry configuration for analytics operations
 */
export const DEFAULT_ANALYTICS_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'unavailable',
    'deadline-exceeded',
    'resource-exhausted',
    'aborted',
    'internal',
    'network',
    'timeout',
  ],
};

/**
 * Retry configuration for different types of analytics operations
 */
export const ANALYTICS_RETRY_CONFIGS = {
  pageView: {
    ...DEFAULT_ANALYTICS_RETRY_CONFIG,
    maxRetries: 2, // Page views are less critical
    baseDelay: 500,
  },
  realTimeVisitor: {
    ...DEFAULT_ANALYTICS_RETRY_CONFIG,
    maxRetries: 3,
    baseDelay: 1000,
  },
  dailySummary: {
    ...DEFAULT_ANALYTICS_RETRY_CONFIG,
    maxRetries: 5, // Daily summaries are important for consistency
    baseDelay: 2000,
    maxDelay: 30000,
  },
  dashboard: {
    ...DEFAULT_ANALYTICS_RETRY_CONFIG,
    maxRetries: 2, // Dashboard loads should be fast
    baseDelay: 800,
    maxDelay: 5000,
  },
} as const;

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error, config: RetryConfig): boolean {
  const errorMessage = error.message.toLowerCase();
  const errorCode = (error as any).code?.toLowerCase() || '';
  
  // Check if it's a network error
  if (isNetworkError(error)) {
    return true;
  }
  
  // Check if error code/message matches retryable patterns
  return config.retryableErrors.some(pattern => 
    errorMessage.includes(pattern) || errorCode.includes(pattern)
  );
}

/**
 * Calculate delay for exponential backoff
 */
export function calculateBackoffDelay(
  attempt: number, 
  config: RetryConfig,
  jitter: boolean = true
): number {
  const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, config.maxDelay);
  
  if (jitter) {
    // Add random jitter to prevent thundering herd
    const jitterAmount = cappedDelay * 0.1; // 10% jitter
    const randomJitter = (Math.random() - 0.5) * 2 * jitterAmount;
    return Math.max(0, cappedDelay + randomJitter);
  }
  
  return cappedDelay;
}

/**
 * Retry wrapper for analytics operations with exponential backoff
 */
export async function retryAnalyticsOperation<T>(
  operation: () => Promise<T>,
  operationType: keyof typeof ANALYTICS_RETRY_CONFIGS,
  context?: Record<string, any>
): Promise<T> {
  const config = ANALYTICS_RETRY_CONFIGS[operationType];
  let lastError: Error;
  let attempt = 0;

  while (attempt < config.maxRetries) {
    attempt++;
    
    try {
      const result = await operation();
      
      // Log successful retry if it wasn't the first attempt
      if (attempt > 1) {
        console.log(`Analytics operation succeeded on attempt ${attempt}`, {
          operationType,
          context,
        });
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      
      // Check if error is retryable
      if (!isRetryableError(lastError, config)) {
        handleError(lastError, {
          operationType,
          attempt,
          retryable: false,
          context,
        });
        throw lastError;
      }
      
      // If this was the last attempt, throw the error
      if (attempt >= config.maxRetries) {
        handleError(lastError, {
          operationType,
          attempt,
          maxRetries: config.maxRetries,
          context,
        });
        throw lastError;
      }
      
      // Calculate delay and wait before retrying
      const delay = calculateBackoffDelay(attempt, config);
      
      console.warn(`Analytics operation failed, retrying in ${delay}ms (attempt ${attempt}/${config.maxRetries})`, {
        error: lastError.message,
        operationType,
        context,
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Retry wrapper with custom configuration
 */
export async function retryWithConfig<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig>,
  context?: Record<string, any>
): Promise<T> {
  const fullConfig = { ...DEFAULT_ANALYTICS_RETRY_CONFIG, ...config };
  let lastError: Error;
  let attempt = 0;

  while (attempt < fullConfig.maxRetries) {
    attempt++;
    
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (!isRetryableError(lastError, fullConfig) || attempt >= fullConfig.maxRetries) {
        handleError(lastError, { attempt, maxRetries: fullConfig.maxRetries, context });
        throw lastError;
      }
      
      const delay = calculateBackoffDelay(attempt, fullConfig);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Circuit breaker for analytics operations
 */
export class AnalyticsCircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private readonly failureThreshold: number = 5,
    private readonly recoveryTimeout: number = 60000, // 1 minute
    private readonly successThreshold: number = 2
  ) {}

  async execute<T>(operation: () => Promise<T>, context?: Record<string, any>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Analytics circuit breaker is open - service temporarily unavailable');
      }
    }

    try {
      const result = await operation();
      
      if (this.state === 'half-open') {
        this.reset();
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      handleError(error as Error, { 
        circuitBreakerState: this.state,
        failures: this.failures,
        context 
      });
      throw error;
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
      console.warn(`Analytics circuit breaker opened after ${this.failures} failures`);
    }
  }

  private reset(): void {
    this.failures = 0;
    this.state = 'closed';
    console.log('Analytics circuit breaker reset - service recovered');
  }

  getState(): { state: string; failures: number; lastFailureTime: number } {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

/**
 * Global circuit breaker instance for analytics
 */
export const analyticsCircuitBreaker = new AnalyticsCircuitBreaker();

/**
 * Wrapper that combines retry logic with circuit breaker
 */
export async function executeAnalyticsOperation<T>(
  operation: () => Promise<T>,
  operationType: keyof typeof ANALYTICS_RETRY_CONFIGS,
  context?: Record<string, any>
): Promise<T> {
  return analyticsCircuitBreaker.execute(async () => {
    return retryAnalyticsOperation(operation, operationType, context);
  }, context);
}

/**
 * Batch retry for multiple analytics operations
 */
export async function retryAnalyticsBatch<T>(
  operations: Array<{
    operation: () => Promise<T>;
    type: keyof typeof ANALYTICS_RETRY_CONFIGS;
    context?: Record<string, any>;
  }>,
  options: {
    concurrency?: number;
    failFast?: boolean;
  } = {}
): Promise<Array<{ success: boolean; result?: T; error?: Error }>> {
  const { concurrency = 3, failFast = false } = options;
  const results: Array<{ success: boolean; result?: T; error?: Error }> = [];
  
  // Process operations in batches to control concurrency
  for (let i = 0; i < operations.length; i += concurrency) {
    const batch = operations.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async ({ operation, type, context }) => {
      try {
        const result = await executeAnalyticsOperation(operation, type, context);
        return { success: true, result };
      } catch (error) {
        if (failFast) {
          throw error;
        }
        return { success: false, error: error as Error };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
}