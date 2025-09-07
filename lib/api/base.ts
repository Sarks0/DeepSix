// NASA API Base Configuration with Rate Limiting and Error Handling

import { NASAAPIError, APIRateLimit, RetryConfig } from '@/lib/types/nasa-api';
import { NASA_API_KEY } from './config';
import { getApiKeyFromContext } from './cloudflare-env';
import type { NextRequest } from 'next/server';

// ================================
// Rate Limiting Implementation
// ================================

interface RateLimitState {
  requests: number;
  resetTime: number;
  queue: Array<{
    resolve: (value: any) => void;
    reject: (error: unknown) => void;
    request: () => Promise<any>;
  }>;
  processing: boolean;
}

class RateLimiter {
  private state: RateLimitState = {
    requests: 0,
    resetTime: Date.now() + 3600000, // 1 hour from now
    queue: [],
    processing: false,
  };

  private readonly maxRequests = 950; // Leave buffer under 1000/hour limit
  private readonly resetInterval = 3600000; // 1 hour in milliseconds

  async execute<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.state.queue.push({ resolve, reject, request });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.state.processing || this.state.queue.length === 0) {
      return;
    }

    this.state.processing = true;

    while (this.state.queue.length > 0) {
      // Reset counter if time window has passed
      if (Date.now() >= this.state.resetTime) {
        this.state.requests = 0;
        this.state.resetTime = Date.now() + this.resetInterval;
      }

      // If we've hit the rate limit, wait until reset
      if (this.state.requests >= this.maxRequests) {
        const waitTime = this.state.resetTime - Date.now();
        if (waitTime > 0) {
          console.warn(`NASA API rate limit reached. Waiting ${waitTime}ms...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          this.state.requests = 0;
          this.state.resetTime = Date.now() + this.resetInterval;
        }
      }

      const { resolve, reject, request } = this.state.queue.shift()!;

      try {
        this.state.requests++;
        const result = await request();
        resolve(result);
      } catch (error) {
        reject(error);
      }

      // Add small delay between requests to be respectful
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.state.processing = false;
  }

  getRateLimitInfo(): APIRateLimit {
    return {
      remaining: Math.max(0, this.maxRequests - this.state.requests),
      reset: this.state.resetTime,
      limit: this.maxRequests,
    };
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

// ================================
// Retry Logic with Exponential Backoff
// ================================

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
};

async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  attempt: number = 1
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (attempt >= config.maxRetries) {
      throw error;
    }

    // Don't retry on 4xx errors (except 429 rate limit)
    if (
      error instanceof NASAAPIError &&
      error.statusCode &&
      error.statusCode >= 400 &&
      error.statusCode < 500 &&
      error.statusCode !== 429
    ) {
      throw error;
    }

    const delay = Math.min(
      config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
      config.maxDelay
    );

    console.warn(
      `Request failed (attempt ${attempt}/${config.maxRetries}). Retrying in ${delay}ms...`
    );
    await new Promise((resolve) => setTimeout(resolve, delay));

    return withRetry(fn, config, attempt + 1);
  }
}

// ================================
// Base API Configuration
// ================================

export class NASAApiBase {
  private readonly baseUrl = 'https://api.nasa.gov';
  private readonly apiKey: string;

  constructor(request?: NextRequest) {
    // Get API key from Cloudflare context if available, otherwise use build-time key
    this.apiKey = request ? getApiKeyFromContext(request) : NASA_API_KEY;
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryConfig?: RetryConfig
  ): Promise<T> {
    const url = this.buildUrl(endpoint);

    const requestFn = async (): Promise<T> => {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text().catch(() => 'Unknown error');

        throw new NASAAPIError(
          `NASA API Error: ${response.status} ${response.statusText} - ${errorMessage}`,
          response.status,
          endpoint,
          response.status === 429
        );
      }

      return response.json();
    };

    // Execute with rate limiting and retry logic
    return rateLimiter.execute(() => withRetry(requestFn, retryConfig));
  }

  private buildUrl(endpoint: string): string {
    const url = new URL(endpoint, this.baseUrl);
    url.searchParams.set('api_key', this.apiKey);
    return url.toString();
  }

  protected buildUrlWithParams(endpoint: string, params: Record<string, unknown>): string {
    const url = new URL(endpoint, this.baseUrl);

    // Add API key
    url.searchParams.set('api_key', this.apiKey);

    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });

    return url.toString();
  }

  // Get current rate limit status
  getRateLimitInfo(): APIRateLimit {
    return rateLimiter.getRateLimitInfo();
  }

  // Health check method
  async healthCheck(): Promise<{ status: 'ok' | 'error'; message: string }> {
    try {
      // Use a lightweight endpoint for health check
      await this.makeRequest('/planetary/apod?count=1');
      return { status: 'ok', message: 'NASA API is accessible' };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// ================================
// Circuit Breaker Implementation
// ================================

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

export class CircuitBreaker {
  private state: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: 0,
    state: 'CLOSED',
  };

  constructor(
    private readonly failureThreshold = 5,
    private readonly resetTimeout = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state.state === 'OPEN') {
      if (Date.now() - this.state.lastFailureTime > this.resetTimeout) {
        this.state.state = 'HALF_OPEN';
      } else {
        throw new NASAAPIError('Circuit breaker is OPEN. Service temporarily unavailable.');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.state.failures = 0;
    this.state.state = 'CLOSED';
  }

  private onFailure(): void {
    this.state.failures++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failures >= this.failureThreshold) {
      this.state.state = 'OPEN';
    }
  }

  getState(): CircuitBreakerState['state'] {
    return this.state.state;
  }
}

// ================================
// Request Queue for Batching
// ================================

export class RequestQueue {
  private queue: Array<{
    key: string;
    request: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: unknown) => void;
  }> = [];

  private processing = false;
  private batchSize = 5;
  private batchDelay = 1000; // 1 second

  async add<T>(key: string, request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ key, request, resolve, reject });
      this.processBatch();
    });
  }

  private async processBatch(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);

      // Process batch concurrently
      await Promise.allSettled(
        batch.map(async ({ request, resolve, reject }) => {
          try {
            const result = await request();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        })
      );

      // Wait between batches if more items are queued
      if (this.queue.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.batchDelay));
      }
    }

    this.processing = false;
  }
}

// Global request queue
export const requestQueue = new RequestQueue();
