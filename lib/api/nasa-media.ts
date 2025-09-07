// NASA Image and Video Library API Integration
// Provides access to NASA's extensive media collection

import { NASAApiBase, CircuitBreaker } from './base';
import {
  NASASearchResponse,
  NASAAssetResponse,
  NASAMediaItem,
  NASAMediaData,
  NASASearchParams,
  NASAAPIError,
  CacheConfig,
} from '@/lib/types/nasa-api';

export interface MediaSearchOptions extends NASASearchParams {
  includeAssets?: boolean; // Whether to fetch asset URLs for each item
}

export interface ProcessedMediaItem {
  id: string;
  title: string;
  description: string;
  mediaType: 'image' | 'video' | 'audio';
  dateCreated: string;
  keywords: string[];
  center?: string;
  photographer?: string;
  location?: string;
  assets: {
    preview?: string;
    small?: string;
    medium?: string;
    large?: string;
    original?: string;
    video?: {
      small?: string;
      medium?: string;
      large?: string;
    };
    audio?: string;
    metadata?: string;
    captions?: string;
  };
  links: {
    self: string;
    preview?: string;
  };
  metadata: {
    album?: string[];
    duration?: string;
    fileSize?: string;
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

export interface MediaSearchResult {
  items: ProcessedMediaItem[];
  totalHits: number;
  hasMore: boolean;
  nextPage?: number;
  searchQuery: string;
}

export interface PopularSearches {
  categories: {
    missions: string[];
    celestialBodies: string[];
    phenomena: string[];
    spacecraft: string[];
  };
  trending: string[];
}

export class NASAMediaAPI extends NASAApiBase {
  private circuitBreaker = new CircuitBreaker(3, 30000);
  private readonly baseMediaUrl = 'https://images-api.nasa.gov';

  // Cache configurations
  static readonly CACHE_CONFIGS = {
    search: {
      ttl: 1800, // 30 minutes - search results
      staleWhileRevalidate: 3600, // 1 hour stale tolerance
      key: 'nasa-media-search',
    } as CacheConfig,
    assets: {
      ttl: 86400, // 24 hours - asset URLs don't change
      staleWhileRevalidate: 43200, // 12 hours stale tolerance
      key: 'nasa-media-assets',
    } as CacheConfig,
    popular: {
      ttl: 43200, // 12 hours - popular content
      staleWhileRevalidate: 21600, // 6 hours stale tolerance
      key: 'nasa-media-popular',
    } as CacheConfig,
  };

  /**
   * Search NASA media library
   */
  async searchMedia(options: MediaSearchOptions = {}): Promise<MediaSearchResult> {
    return this.circuitBreaker.execute(async () => {
      const searchParams = this.buildSearchParams(options);
      const url = `${this.baseMediaUrl}/search?${searchParams.toString()}`;

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new NASAAPIError(
            `NASA Media Library Error: ${response.status} ${response.statusText}`,
            response.status,
            '/search'
          );
        }

        const data: NASASearchResponse = await response.json();

        // Process the items
        let processedItems: ProcessedMediaItem[] = [];

        if (data.collection.items && data.collection.items.length > 0) {
          processedItems = await this.processMediaItems(
            data.collection.items,
            options.includeAssets || false
          );
        }

        return {
          items: processedItems,
          totalHits: data.collection.metadata?.total_hits || 0,
          hasMore: processedItems.length === (options.page_size || 100),
          nextPage: options.page ? options.page + 1 : 2,
          searchQuery: options.q || 'all media',
        };
      } catch (error) {
        if (error instanceof NASAAPIError) {
          throw error;
        }
        throw new NASAAPIError(
          `Failed to search NASA media: ${error instanceof Error ? error.message : 'Unknown error'}`,
          undefined,
          '/search'
        );
      }
    });
  }

  /**
   * Get assets (download URLs) for a specific media item
   */
  async getMediaAssets(nasaId: string): Promise<string[]> {
    return this.circuitBreaker.execute(async () => {
      const url = `${this.baseMediaUrl}/asset/${nasaId}`;

      try {
        const response = await fetch(url);

        if (!response.ok) {
          if (response.status === 404) {
            return []; // No assets found
          }
          throw new NASAAPIError(
            `NASA Asset API Error: ${response.status} ${response.statusText}`,
            response.status,
            `/asset/${nasaId}`
          );
        }

        const data: NASAAssetResponse = await response.json();

        return data.collection.items.map((item) => item.href) || [];
      } catch (error) {
        if (error instanceof NASAAPIError) {
          throw error;
        }
        console.warn(`Failed to get assets for ${nasaId}:`, error);
        return [];
      }
    });
  }

  /**
   * Get popular/featured content
   */
  async getPopularContent(
    options: {
      mediaType?: 'image' | 'video' | 'audio';
      timeframe?: 'week' | 'month' | 'year';
      limit?: number;
    } = {}
  ): Promise<ProcessedMediaItem[]> {
    const { mediaType, limit = 20 } = options;

    // Search for popular content using curated keywords
    const popularQueries = [
      'apollo',
      'mars',
      'earth',
      'hubble',
      'iss',
      'space station',
      'galaxy',
      'nebula',
      'saturn',
      'jupiter',
      'astronaut',
      'spacewalk',
    ];

    const randomQuery = popularQueries[Math.floor(Math.random() * popularQueries.length)];

    const searchOptions: MediaSearchOptions = {
      q: randomQuery,
      media_type: mediaType,
      page_size: limit,
      includeAssets: true,
    };

    const results = await this.searchMedia(searchOptions);
    return results.items;
  }

  /**
   * Get featured images of the day/week
   */
  async getFeaturedImages(count: number = 12): Promise<ProcessedMediaItem[]> {
    const featuredQueries = [
      { q: 'hubble telescope', weight: 3 },
      { q: 'earth from space', weight: 2 },
      { q: 'mars rover', weight: 2 },
      { q: 'international space station', weight: 2 },
      { q: 'galaxy', weight: 1 },
      { q: 'nebula', weight: 1 },
      { q: 'astronaut', weight: 1 },
    ];

    const allImages: ProcessedMediaItem[] = [];

    for (const query of featuredQueries) {
      try {
        const results = await this.searchMedia({
          q: query.q,
          media_type: 'image',
          page_size: Math.ceil((count / featuredQueries.length) * query.weight),
          includeAssets: true,
        });

        allImages.push(...results.items);
      } catch (error) {
        console.warn(`Failed to get featured images for query "${query.q}":`, error);
      }
    }

    // Shuffle and return requested count
    return allImages.sort(() => Math.random() - 0.5).slice(0, count);
  }

  /**
   * Search for mission-specific content
   */
  async getMissionContent(options: {
    mission: string;
    mediaType?: 'image' | 'video' | 'audio';
    limit?: number;
    includeAssets?: boolean;
  }): Promise<ProcessedMediaItem[]> {
    const { mission, mediaType, limit = 50, includeAssets = true } = options;

    const missionQueries = this.getMissionKeywords(mission);
    const allContent: ProcessedMediaItem[] = [];

    for (const query of missionQueries.slice(0, 3)) {
      // Limit to 3 queries
      try {
        const results = await this.searchMedia({
          q: query,
          media_type: mediaType,
          page_size: Math.ceil(limit / missionQueries.length),
          includeAssets,
        });

        allContent.push(...results.items);
      } catch (error) {
        console.warn(`Failed to get content for mission query "${query}":`, error);
      }
    }

    return allContent.slice(0, limit);
  }

  /**
   * Advanced search with multiple filters
   */
  async advancedSearch(options: {
    query?: string;
    keywords?: string[];
    dateRange?: {
      start: string; // YYYY-MM-DD
      end: string; // YYYY-MM-DD
    };
    centers?: string[];
    mediaTypes?: ('image' | 'video' | 'audio')[];
    photographer?: string;
    location?: string;
    page?: number;
    pageSize?: number;
  }): Promise<MediaSearchResult> {
    const searchOptions: MediaSearchOptions = {
      page: options.page || 1,
      page_size: options.pageSize || 50,
      includeAssets: true,
    };

    // Build query string
    const queryParts: string[] = [];
    if (options.query) queryParts.push(options.query);
    if (options.keywords) queryParts.push(...options.keywords);
    if (queryParts.length > 0) {
      searchOptions.q = queryParts.join(' ');
    }

    // Add other filters
    if (options.dateRange) {
      searchOptions.year_start = options.dateRange.start.substring(0, 4);
      searchOptions.year_end = options.dateRange.end.substring(0, 4);
    }

    if (options.centers && options.centers.length === 1) {
      searchOptions.center = options.centers[0];
    }

    if (options.mediaTypes && options.mediaTypes.length === 1) {
      searchOptions.media_type = options.mediaTypes[0];
    }

    if (options.photographer) {
      searchOptions.photographer = options.photographer;
    }

    if (options.location) {
      searchOptions.location = options.location;
    }

    return await this.searchMedia(searchOptions);
  }

  /**
   * Get trending search terms and categories
   */
  getPopularSearches(): PopularSearches {
    return {
      categories: {
        missions: [
          'apollo',
          'artemis',
          'mars 2020',
          'perseverance',
          'curiosity',
          'voyager',
          'cassini',
          'juno',
          'new horizons',
          'parker solar probe',
        ],
        celestialBodies: [
          'mars',
          'moon',
          'earth',
          'saturn',
          'jupiter',
          'sun',
          'mercury',
          'venus',
          'uranus',
          'neptune',
          'pluto',
        ],
        phenomena: [
          'solar eclipse',
          'lunar eclipse',
          'aurora',
          'solar flare',
          'meteor shower',
          'comet',
          'supernova',
          'black hole',
        ],
        spacecraft: [
          'international space station',
          'hubble telescope',
          'james webb',
          'space shuttle',
          'dragon',
          'starship',
          'orion',
        ],
      },
      trending: [
        'james webb telescope',
        'mars helicopter',
        'artemis mission',
        'perseverance rover',
        'iss spacewalk',
        'earth from space',
        'hubble deep field',
        'saturn rings',
        'jupiter moons',
      ],
    };
  }

  /**
   * Process raw media items into enhanced format
   */
  private async processMediaItems(
    items: NASAMediaItem[],
    includeAssets: boolean
  ): Promise<ProcessedMediaItem[]> {
    const processed: ProcessedMediaItem[] = [];

    for (const item of items) {
      if (!item.data || item.data.length === 0) continue;

      const data = item.data[0]; // Take first data item
      let assets: ProcessedMediaItem['assets'] = {};

      // Get assets if requested
      if (includeAssets && data.nasa_id) {
        try {
          const assetUrls = await this.getMediaAssets(data.nasa_id);
          assets = this.categorizeAssets(assetUrls);
        } catch (error) {
          console.warn(`Failed to get assets for ${data.nasa_id}:`, error);
        }
      }

      // Extract preview link
      const previewLink = item.links?.find((link) => link.rel === 'preview');

      processed.push({
        id: data.nasa_id,
        title: data.title,
        description: data.description || data.description_508 || '',
        mediaType: data.media_type,
        dateCreated: data.date_created,
        keywords: data.keywords || [],
        center: data.center,
        photographer: data.photographer || data.secondary_creator,
        location: data.location,
        assets,
        links: {
          self: item.href,
          preview: previewLink?.href,
        },
        metadata: {
          album: data.album,
          // Additional metadata would be extracted from assets
        },
      });
    }

    return processed;
  }

  /**
   * Categorize asset URLs by type and size
   */
  private categorizeAssets(assetUrls: string[]): ProcessedMediaItem['assets'] {
    const assets: ProcessedMediaItem['assets'] = {};

    for (const url of assetUrls) {
      const urlLower = url.toLowerCase();

      // Image assets
      if (urlLower.includes('thumb') || urlLower.includes('small')) {
        assets.small = url;
      } else if (urlLower.includes('medium')) {
        assets.medium = url;
      } else if (urlLower.includes('large')) {
        assets.large = url;
      } else if (urlLower.includes('orig') || urlLower.includes('original')) {
        assets.original = url;
      }

      // Video assets
      else if (urlLower.includes('.mp4') || urlLower.includes('.mov')) {
        if (!assets.video) assets.video = {};

        if (urlLower.includes('small') || urlLower.includes('mobile')) {
          assets.video.small = url;
        } else if (urlLower.includes('medium')) {
          assets.video.medium = url;
        } else if (urlLower.includes('large') || urlLower.includes('hd')) {
          assets.video.large = url;
        }
      }

      // Audio assets
      else if (urlLower.includes('.mp3') || urlLower.includes('.wav')) {
        assets.audio = url;
      }

      // Metadata files
      else if (urlLower.includes('metadata') || urlLower.includes('.json')) {
        assets.metadata = url;
      }

      // Captions
      else if (
        urlLower.includes('caption') ||
        urlLower.includes('.vtt') ||
        urlLower.includes('.srt')
      ) {
        assets.captions = url;
      }

      // Default preview
      else if (!assets.preview && (urlLower.includes('.jpg') || urlLower.includes('.png'))) {
        assets.preview = url;
      }
    }

    return assets;
  }

  /**
   * Build search parameters URL string
   */
  private buildSearchParams(options: MediaSearchOptions): URLSearchParams {
    const params = new URLSearchParams();

    // Add all search parameters
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && key !== 'includeAssets') {
        params.set(key, String(value));
      }
    });

    return params;
  }

  /**
   * Get mission-specific keywords for searches
   */
  private getMissionKeywords(mission: string): string[] {
    const missionKeywords: Record<string, string[]> = {
      apollo: ['apollo', 'moon landing', 'lunar module', 'command module'],
      mars2020: ['perseverance', 'mars 2020', 'ingenuity helicopter', 'jezero crater'],
      curiosity: ['curiosity rover', 'mars science laboratory', 'gale crater'],
      voyager: ['voyager 1', 'voyager 2', 'grand tour', 'outer planets'],
      cassini: ['cassini', 'saturn', 'titan', 'enceladus'],
      hubble: ['hubble space telescope', 'hst', 'deep field'],
      jwst: ['james webb space telescope', 'jwst', 'infrared telescope'],
      iss: ['international space station', 'iss', 'expedition'],
    };

    const missionLower = mission.toLowerCase();
    return missionKeywords[missionLower] || [mission];
  }

  /**
   * Check service availability
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      const results = await this.searchMedia({ q: 'apollo', page_size: 1 });
      return results.items.length > 0;
    } catch (error) {
      console.warn('NASA Media Library unavailable:', error);
      return false;
    }
  }
}

// Export singleton instance
export const nasaMediaAPI = new NASAMediaAPI();
