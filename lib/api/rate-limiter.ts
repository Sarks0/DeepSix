/**
 * Simple in-memory rate limiter for API endpoints
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if request should be rate limited
   */
  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const record = this.store[identifier];

    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      this.store[identifier] = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      return false;
    }

    // Increment count
    record.count++;

    // Check if limit exceeded
    return record.count > this.maxRequests;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemainingRequests(identifier: string): number {
    const record = this.store[identifier];
    if (!record || Date.now() > record.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - record.count);
  }

  /**
   * Get reset time for identifier
   */
  getResetTime(identifier: string): number {
    const record = this.store[identifier];
    return record ? record.resetTime : Date.now() + this.windowMs;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const key in this.store) {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    }
  }
}

// Create rate limiters with different configurations
export const apiRateLimiter = new RateLimiter(60000, 100); // 100 requests per minute
export const nasaApiRateLimiter = new RateLimiter(3600000, 900); // 900 requests per hour (NASA limit is 1000)

/**
 * Express-like middleware for Next.js API routes
 */
export function withRateLimit(handler: Function, limiter: RateLimiter = apiRateLimiter) {
  return async (req: Request) => {
    // Get client identifier (IP or fallback to a generic one for development)
    const identifier =
      req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';

    // Check rate limit
    if (limiter.isRateLimited(identifier)) {
      const resetTime = limiter.getResetTime(identifier);
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limiter['maxRequests'].toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetTime.toString(),
            'Retry-After': retryAfter.toString(),
          },
        }
      );
    }

    // Add rate limit headers
    const remaining = limiter.getRemainingRequests(identifier);
    const resetTime = limiter.getResetTime(identifier);

    const response = await handler(req);

    // Add rate limit headers to response
    if (response instanceof Response) {
      response.headers.set('X-RateLimit-Limit', limiter['maxRequests'].toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', resetTime.toString());
    }

    return response;
  };
}
