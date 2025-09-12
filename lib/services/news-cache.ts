interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  image?: string;
}

interface NewsResponse {
  news: NewsItem[];
  total: number;
  categories: string[];
  metadata: {
    sources: string[];
    fetched_at: string;
    feeds_count: number;
    cache_duration: string;
  };
}

class NewsCache {
  private cache = new Map<string, CacheEntry<NewsResponse>>();
  private readonly DEFAULT_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

  /**
   * Generate cache key from parameters
   */
  private getCacheKey(category?: string, limit?: number): string {
    return `news_${category || 'all'}_${limit || 50}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry<NewsResponse>): boolean {
    return Date.now() < entry.expiresAt;
  }

  /**
   * Get cached news data
   */
  get(category?: string, limit?: number): NewsResponse | null {
    const key = this.getCacheKey(category, limit);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (!this.isValid(entry)) {
      this.cache.delete(key);
      return null;
    }

    console.log(`Cache hit for key: ${key}`);
    return entry.data;
  }

  /**
   * Store news data in cache
   */
  set(data: NewsResponse, category?: string, limit?: number, ttl?: number): void {
    const key = this.getCacheKey(category, limit);
    const now = Date.now();
    const expiresAt = now + (ttl || this.DEFAULT_TTL);

    const entry: CacheEntry<NewsResponse> = {
      data,
      timestamp: now,
      expiresAt
    };

    this.cache.set(key, entry);
    console.log(`Cached news data for key: ${key}, expires at: ${new Date(expiresAt).toISOString()}`);
  }

  /**
   * Clear specific cache entry
   */
  delete(category?: string, limit?: number): boolean {
    const key = this.getCacheKey(category, limit);
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    console.log('News cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): { 
    size: number; 
    keys: string[]; 
    validEntries: number; 
    expiredEntries: number 
  } {
    const keys = Array.from(this.cache.keys());
    let validEntries = 0;
    let expiredEntries = 0;

    keys.forEach(key => {
      const entry = this.cache.get(key);
      if (entry) {
        if (this.isValid(entry)) {
          validEntries++;
        } else {
          expiredEntries++;
        }
      }
    });

    return {
      size: this.cache.size,
      keys,
      validEntries,
      expiredEntries
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    let cleanedCount = 0;
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (!this.isValid(entry)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      cleanedCount++;
    });

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired cache entries`);
    }

    return cleanedCount;
  }

  /**
   * Check if we have any cached data (regardless of category)
   */
  hasAnyData(): boolean {
    for (const [, entry] of this.cache) {
      if (this.isValid(entry)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get all valid news items (for offline use)
   */
  getAllValidNews(): NewsItem[] {
    const allNews: NewsItem[] = [];

    this.cache.forEach((entry) => {
      if (this.isValid(entry)) {
        allNews.push(...entry.data.news);
      }
    });

    // Remove duplicates by ID
    const uniqueNews = allNews.filter((item, index, self) => 
      index === self.findIndex(n => n.id === item.id)
    );

    // Sort by publication date (newest first)
    return uniqueNews.sort((a, b) => 
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
  }
}

// Create singleton instance
export const newsCache = new NewsCache();

// Auto-cleanup every 30 minutes
setInterval(() => {
  newsCache.cleanup();
}, 30 * 60 * 1000);

export type { NewsItem, NewsResponse };