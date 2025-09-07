/**
 * Image Cache Service
 * Provides persistent caching for NASA images using IndexedDB and localStorage
 */

interface CachedImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  earthDate: string;
  sol?: number;
  rover?: string;
  camera?: any; // Can be string or camera object
  cachedAt: number;
  expiresAt: number;
  metadata?: any;
}

interface CacheConfig {
  maxAge: number; // Max age in milliseconds
  maxItems: number; // Max items per category
  dbName: string;
  storeName: string;
}

class ImageCacheService {
  private config: CacheConfig;
  private db: IDBDatabase | null = null;
  private memoryCache: Map<string, CachedImage> = new Map();

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days default
      maxItems: 100, // Keep last 100 images per rover
      dbName: 'nasa-image-cache',
      storeName: 'images',
      ...config
    };
    
    this.initDB();
  }

  private async initDB(): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB not available');
      return;
    }

    try {
      const request = indexedDB.open(this.config.dbName, 1);
      
      request.onerror = () => {
        console.error('Failed to open IndexedDB');
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        this.loadMemoryCache();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          const store = db.createObjectStore(this.config.storeName, { keyPath: 'id' });
          store.createIndex('rover', 'rover', { unique: false });
          store.createIndex('earthDate', 'earthDate', { unique: false });
          store.createIndex('cachedAt', 'cachedAt', { unique: false });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
      // Fall back to localStorage
    }
  }

  private async loadMemoryCache(): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([this.config.storeName], 'readonly');
      const store = transaction.objectStore(this.config.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const images = request.result as CachedImage[];
        images.forEach(img => {
          if (!this.isExpired(img)) {
            this.memoryCache.set(img.id, img);
          }
        });
      };
    } catch (error) {
      console.error('Error loading memory cache:', error);
    }
  }

  private isExpired(image: CachedImage): boolean {
    return Date.now() > image.expiresAt;
  }

  async cacheImage(
    id: string,
    url: string,
    metadata?: {
      earthDate?: string;
      sol?: number;
      rover?: string;
      camera?: any;
      thumbnailUrl?: string;
      [key: string]: any;
    }
  ): Promise<void> {
    const now = Date.now();
    const cachedImage: CachedImage = {
      id,
      url,
      thumbnailUrl: metadata?.thumbnailUrl,
      earthDate: metadata?.earthDate || new Date().toISOString(),
      sol: metadata?.sol,
      rover: metadata?.rover,
      camera: metadata?.camera,
      cachedAt: now,
      expiresAt: now + this.config.maxAge,
      metadata
    };

    // Add to memory cache
    this.memoryCache.set(id, cachedImage);

    // Persist to IndexedDB
    if (this.db) {
      try {
        const transaction = this.db.transaction([this.config.storeName], 'readwrite');
        const store = transaction.objectStore(this.config.storeName);
        await store.put(cachedImage);
        
        // Clean up old images if needed
        await this.cleanupOldImages(metadata?.rover);
      } catch (error) {
        console.error('Error caching image to IndexedDB:', error);
        // Fall back to localStorage for critical images
        this.fallbackToLocalStorage(id, cachedImage);
      }
    } else {
      this.fallbackToLocalStorage(id, cachedImage);
    }
  }

  private fallbackToLocalStorage(id: string, image: CachedImage): void {
    try {
      const key = `img-cache-${id}`;
      // Store only essential data in localStorage due to size limits
      const essentialData = {
        id: image.id,
        url: image.url,
        earthDate: image.earthDate,
        expiresAt: image.expiresAt
      };
      localStorage.setItem(key, JSON.stringify(essentialData));
    } catch (error) {
      console.warn('LocalStorage fallback failed:', error);
    }
  }

  async getCachedImage(id: string): Promise<CachedImage | null> {
    // Check memory cache first
    const cached = this.memoryCache.get(id);
    if (cached && !this.isExpired(cached)) {
      return cached;
    }

    // Check IndexedDB
    if (this.db) {
      try {
        const transaction = this.db.transaction([this.config.storeName], 'readonly');
        const store = transaction.objectStore(this.config.storeName);
        const request = store.get(id);
        
        return new Promise((resolve) => {
          request.onsuccess = () => {
            const image = request.result as CachedImage;
            if (image && !this.isExpired(image)) {
              this.memoryCache.set(id, image);
              resolve(image);
            } else {
              resolve(null);
            }
          };
          request.onerror = () => resolve(null);
        });
      } catch (error) {
        console.error('Error retrieving from IndexedDB:', error);
      }
    }

    // Fall back to localStorage
    try {
      const key = `img-cache-${id}`;
      const data = localStorage.getItem(key);
      if (data) {
        const image = JSON.parse(data) as CachedImage;
        if (!this.isExpired(image)) {
          return image;
        }
      }
    } catch (error) {
      console.error('Error retrieving from localStorage:', error);
    }

    return null;
  }

  async getCachedImagesByRover(rover: string, limit?: number): Promise<CachedImage[]> {
    const images: CachedImage[] = [];
    
    // Get from memory cache first
    for (const [_, image] of this.memoryCache) {
      if (image.rover === rover && !this.isExpired(image)) {
        images.push(image);
      }
    }

    // If not enough, get from IndexedDB
    if (this.db && images.length < (limit || this.config.maxItems)) {
      try {
        const transaction = this.db.transaction([this.config.storeName], 'readonly');
        const store = transaction.objectStore(this.config.storeName);
        const index = store.index('rover');
        const request = index.getAll(rover);
        
        await new Promise((resolve) => {
          request.onsuccess = () => {
            const dbImages = request.result as CachedImage[];
            dbImages.forEach(img => {
              if (!this.isExpired(img) && !images.find(i => i.id === img.id)) {
                images.push(img);
              }
            });
            resolve(undefined);
          };
          request.onerror = () => resolve(undefined);
        });
      } catch (error) {
        console.error('Error getting images by rover:', error);
      }
    }

    // Sort by date (newest first) and limit
    return images
      .sort((a, b) => new Date(b.earthDate).getTime() - new Date(a.earthDate).getTime())
      .slice(0, limit || this.config.maxItems);
  }

  private async cleanupOldImages(rover?: string): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([this.config.storeName], 'readwrite');
      const store = transaction.objectStore(this.config.storeName);
      
      // Get all images for this rover
      const index = rover ? store.index('rover') : store;
      const request = rover ? index.getAll(rover) : store.getAll();
      
      request.onsuccess = () => {
        const images = request.result as CachedImage[];
        
        // Remove expired images
        const validImages = images.filter(img => !this.isExpired(img));
        
        // Sort by cached date and keep only the most recent
        validImages.sort((a, b) => b.cachedAt - a.cachedAt);
        
        if (validImages.length > this.config.maxItems) {
          const toDelete = validImages.slice(this.config.maxItems);
          toDelete.forEach(img => {
            store.delete(img.id);
            this.memoryCache.delete(img.id);
          });
        }
      };
    } catch (error) {
      console.error('Error cleaning up old images:', error);
    }
  }

  async clearCache(rover?: string): Promise<void> {
    if (rover) {
      // Clear specific rover's cache
      for (const [id, image] of this.memoryCache) {
        if (image.rover === rover) {
          this.memoryCache.delete(id);
        }
      }
    } else {
      // Clear all
      this.memoryCache.clear();
    }

    if (this.db) {
      try {
        const transaction = this.db.transaction([this.config.storeName], 'readwrite');
        const store = transaction.objectStore(this.config.storeName);
        
        if (rover) {
          const index = store.index('rover');
          const request = index.getAll(rover);
          request.onsuccess = () => {
            const images = request.result as CachedImage[];
            images.forEach(img => store.delete(img.id));
          };
        } else {
          store.clear();
        }
      } catch (error) {
        console.error('Error clearing cache:', error);
      }
    }

    // Clear localStorage fallback
    if (!rover) {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('img-cache-')) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  getCacheStats(): { total: number; byRover: Record<string, number> } {
    const stats = {
      total: this.memoryCache.size,
      byRover: {} as Record<string, number>
    };

    for (const [_, image] of this.memoryCache) {
      if (image.rover) {
        stats.byRover[image.rover] = (stats.byRover[image.rover] || 0) + 1;
      }
    }

    return stats;
  }
}

// Export singleton instance
export const imageCache = new ImageCacheService();

// Export type
export type { CachedImage };