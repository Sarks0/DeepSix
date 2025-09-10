import { unstable_cache } from 'next/cache';

// Cache durations in seconds
export const CACHE_DURATIONS = {
  MISSION_IMAGES: 24 * 60 * 60,     // 24 hours
  DISCOVERY_FEED: 6 * 60 * 60,      // 6 hours  
  MISSION_STATS: 60 * 60,           // 1 hour
  CRITICAL_DATA: 15 * 60,           // 15 minutes
  MISSION_STATUS: 30 * 60,          // 30 minutes
} as const;

// Cache tags for revalidation
export const CACHE_TAGS = {
  MISSION_DATA: 'mission-data',
  DISCOVERY_FEED: 'discovery-feed',
  MISSION_IMAGES: 'mission-images',
  MISSION_STATUS: 'mission-status',
} as const;

// Generic cache wrapper with Next.js unstable_cache
export function createCachedFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyParts: string[],
  duration: number,
  tags: string[] = []
) {
  return unstable_cache(fn, keyParts, {
    revalidate: duration,
    tags,
  });
}

// Client-side cache for browser storage
export class ClientCache {
  private static prefix = 'deepsix-mission-';

  static set(key: string, data: any, ttlMs: number): void {
    if (typeof window === 'undefined') return;
    
    const item = {
      data,
      expiry: Date.now() + ttlMs,
    };
    
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      if (Date.now() > parsed.expiry) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  static clear(pattern?: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          if (!pattern || key.includes(pattern)) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  static markStart(operation: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(`${operation}-start`);
    }
  }

  static markEnd(operation: string): number {
    if (typeof performance !== 'undefined') {
      performance.mark(`${operation}-end`);
      performance.measure(operation, `${operation}-start`, `${operation}-end`);
      
      const measure = performance.getEntriesByName(operation)[0];
      return measure?.duration || 0;
    }
    return 0;
  }

  static async timeOperation<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    this.markStart(operation);
    try {
      const result = await fn();
      const duration = this.markEnd(operation);
      console.log(`⚡ ${operation}: ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      this.markEnd(operation);
      throw error;
    }
  }
}

// Rate limiter to prevent API abuse
export class RateLimiter {
  private static requests: Map<string, number[]> = new Map();
  
  static canMakeRequest(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Clean old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
  
  static async withRateLimit<T>(
    key: string,
    maxRequests: number,
    windowMs: number,
    fn: () => Promise<T>
  ): Promise<T> {
    if (!this.canMakeRequest(key, maxRequests, windowMs)) {
      throw new Error(`Rate limit exceeded for ${key}`);
    }
    
    return await fn();
  }
}