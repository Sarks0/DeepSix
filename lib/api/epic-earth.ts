// EPIC (Earth Polychromatic Imaging Camera) API Integration
// Provides daily imagery of Earth from the DSCOVR satellite

import { NASAApiBase, CircuitBreaker } from './base';
import { getApiKey } from './config';

const NASA_API_KEY = getApiKey();
import {
  EPICResponse,
  EPICImageData,
  EPICCollection,
  NASAAPIError,
  CacheConfig,
} from '@/lib/types/nasa-api';

export interface EPICImageOptions {
  collection?: EPICCollection;
  date?: string; // YYYY-MM-DD format
  available?: boolean; // Get available dates instead of images
}

export interface ProcessedEPICImage {
  identifier: string;
  caption: string;
  date: string;
  earthDate: string;
  imageUrl: {
    thumbnail: string;
    medium: string;
    large: string;
    archive: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  celestialPositions: {
    dscovr: {
      x: number;
      y: number;
      z: number;
      distance: number; // Calculated distance from Earth
    };
    moon: {
      x: number;
      y: number;
      z: number;
      distance: number;
    };
    sun: {
      x: number;
      y: number;
      z: number;
      distance: number;
    };
  };
  satellite: {
    attitude: {
      q0: number;
      q1: number;
      q2: number;
      q3: number;
    };
    position: string; // L1 Lagrange point description
  };
  metadata: {
    collection: EPICCollection;
    version: string;
    qualityScore?: number;
  };
}

export interface EPICDateInfo {
  availableDates: string[];
  totalImages: number;
  dateRange: {
    earliest: string;
    latest: string;
  };
  collections: {
    natural: number;
    enhanced: number;
  };
}

export class EPICEarthAPI extends NASAApiBase {
  private circuitBreaker = new CircuitBreaker(3, 30000);

  // Cache configurations
  static readonly CACHE_CONFIGS = {
    images: {
      ttl: 3600, // 1 hour - images don't change
      staleWhileRevalidate: 7200, // 2 hours stale tolerance
      key: 'epic-images',
    } as CacheConfig,
    dates: {
      ttl: 86400, // 24 hours - available dates change daily
      staleWhileRevalidate: 43200, // 12 hours stale tolerance
      key: 'epic-dates',
    } as CacheConfig,
    latest: {
      ttl: 1800, // 30 minutes - latest images
      staleWhileRevalidate: 3600, // 1 hour stale tolerance
      key: 'epic-latest',
    } as CacheConfig,
  };

  /**
   * Get EPIC Earth images for a specific date
   */
  async getEarthImages(options: EPICImageOptions = {}): Promise<EPICResponse> {
    return this.circuitBreaker.execute(async () => {
      const { collection = 'natural', date } = options;

      let endpoint: string;

      if (date) {
        // Get images for specific date
        endpoint = `/EPIC/api/${collection}/date/${date}`;
      } else {
        // Get most recent available images
        endpoint = `/EPIC/api/${collection}`;
      }

      try {
        const response = await this.makeRequest<EPICResponse>(endpoint);

        // Validate response structure
        if (!Array.isArray(response)) {
          throw new NASAAPIError('Invalid response format from EPIC API');
        }

        return response;
      } catch (error) {
        if (error instanceof NASAAPIError) {
          throw error;
        }
        throw new NASAAPIError(
          `Failed to fetch EPIC Earth images: ${error instanceof Error ? error.message : 'Unknown error'}`,
          undefined,
          endpoint
        );
      }
    });
  }

  /**
   * Get available dates for EPIC imagery
   */
  async getAvailableDates(collection: EPICCollection = 'natural'): Promise<string[]> {
    return this.circuitBreaker.execute(async () => {
      const endpoint = `/EPIC/api/${collection}/available`;

      try {
        const response = await this.makeRequest<Array<{ date: string }> | string[]>(endpoint);

        // Handle different response formats
        if (Array.isArray(response)) {
          if (response.length > 0 && typeof response[0] === 'object' && 'date' in response[0]) {
            return (response as Array<{ date: string }>).map((item) => item.date);
          }
          return response as string[];
        }

        return [];
      } catch (error) {
        throw new NASAAPIError(
          `Failed to fetch available dates: ${error instanceof Error ? error.message : 'Unknown error'}`,
          undefined,
          endpoint
        );
      }
    });
  }

  /**
   * Get the most recent Earth images
   */
  async getLatestImages(collection: EPICCollection = 'natural'): Promise<EPICResponse> {
    try {
      // First try to get the latest images directly
      const latestImages = await this.getEarthImages({ collection });

      if (latestImages.length > 0) {
        return latestImages;
      }

      // If no images, try recent dates
      const availableDates = await this.getAvailableDates(collection);

      if (availableDates.length === 0) {
        throw new NASAAPIError('No EPIC images available');
      }

      // Sort dates and get the most recent
      const sortedDates = availableDates.sort().reverse();

      for (const date of sortedDates.slice(0, 3)) {
        // Try last 3 dates
        try {
          const images = await this.getEarthImages({ collection, date });
          if (images.length > 0) {
            return images;
          }
        } catch (error) {
          console.warn(`No images available for date ${date}:`, error);
        }
      }

      throw new NASAAPIError(`No recent EPIC images found in ${collection} collection`);
    } catch (error) {
      if (error instanceof NASAAPIError) {
        throw error;
      }
      throw new NASAAPIError(
        `Failed to get latest EPIC images: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get images from both natural and enhanced collections
   */
  async getAllCollectionImages(date?: string): Promise<{
    natural: EPICResponse;
    enhanced: EPICResponse;
  }> {
    const [naturalImages, enhancedImages] = await Promise.allSettled([
      this.getEarthImages({ collection: 'natural', date }),
      this.getEarthImages({ collection: 'enhanced', date }),
    ]);

    return {
      natural: naturalImages.status === 'fulfilled' ? naturalImages.value : [],
      enhanced: enhancedImages.status === 'fulfilled' ? enhancedImages.value : [],
    };
  }

  /**
   * Process raw EPIC images into enhanced format with calculated URLs
   */
  processEPICImages(
    images: EPICImageData[],
    collection: EPICCollection = 'natural'
  ): ProcessedEPICImage[] {
    return images.map((image) => {
      const date = image.date.split(' ')[0]; // Extract date part
      const formattedDate = this.formatImageDate(date);

      return {
        identifier: image.identifier,
        caption: image.caption,
        date: image.date,
        earthDate: date,
        imageUrl: this.generateImageUrls(image.image, collection, formattedDate),
        coordinates: {
          latitude: image.centroid_coordinates.lat,
          longitude: image.centroid_coordinates.lon,
        },
        celestialPositions: {
          dscovr: {
            ...image.dscovr_j2000_position,
            distance: this.calculateDistance(image.dscovr_j2000_position),
          },
          moon: {
            ...image.lunar_j2000_position,
            distance: this.calculateDistance(image.lunar_j2000_position),
          },
          sun: {
            ...image.sun_j2000_position,
            distance: this.calculateDistance(image.sun_j2000_position),
          },
        },
        satellite: {
          attitude: image.attitude_quaternions,
          position: 'L1 Lagrange Point (~1.5M km from Earth towards Sun)',
        },
        metadata: {
          collection,
          version: image.version,
          qualityScore: this.calculateImageQuality(image),
        },
      };
    });
  }

  /**
   * Get comprehensive date information for EPIC imagery
   */
  async getDateInfo(): Promise<EPICDateInfo> {
    const [naturalDates, enhancedDates] = await Promise.allSettled([
      this.getAvailableDates('natural'),
      this.getAvailableDates('enhanced'),
    ]);

    const naturalArray = naturalDates.status === 'fulfilled' ? naturalDates.value : [];
    const enhancedArray = enhancedDates.status === 'fulfilled' ? enhancedDates.value : [];

    const uniqueDates = new Set([...naturalArray, ...enhancedArray]);
    const allDates = Array.from(uniqueDates).sort();

    return {
      availableDates: allDates,
      totalImages: naturalArray.length + enhancedArray.length,
      dateRange: {
        earliest: allDates[0] || '',
        latest: allDates[allDates.length - 1] || '',
      },
      collections: {
        natural: naturalArray.length,
        enhanced: enhancedArray.length,
      },
    };
  }

  /**
   * Get images showing specific geographic regions
   */
  async getRegionalImages(options: {
    collection?: EPICCollection;
    region?: {
      minLat: number;
      maxLat: number;
      minLon: number;
      maxLon: number;
    };
    date?: string;
    limit?: number;
  }): Promise<ProcessedEPICImage[]> {
    const { collection = 'natural', region, date, limit = 10 } = options;

    const images = await this.getEarthImages({ collection, date });
    const processed = this.processEPICImages(images, collection);

    if (!region) {
      return processed.slice(0, limit);
    }

    // Filter by geographic region
    const filteredImages = processed.filter(
      (image) =>
        image.coordinates.latitude >= region.minLat &&
        image.coordinates.latitude <= region.maxLat &&
        image.coordinates.longitude >= region.minLon &&
        image.coordinates.longitude <= region.maxLon
    );

    return filteredImages.slice(0, limit);
  }

  /**
   * Get time-lapse sequence of Earth images
   */
  async getTimeLapse(options: {
    collection?: EPICCollection;
    startDate: string;
    endDate: string;
    maxImages?: number;
  }): Promise<ProcessedEPICImage[]> {
    const { collection = 'natural', startDate, endDate, maxImages = 50 } = options;

    const availableDates = await this.getAvailableDates(collection);
    const filteredDates = availableDates
      .filter((date) => date >= startDate && date <= endDate)
      .sort()
      .slice(0, maxImages);

    const timelapseImages: ProcessedEPICImage[] = [];

    for (const date of filteredDates) {
      try {
        const dayImages = await this.getEarthImages({ collection, date });
        if (dayImages.length > 0) {
          // Take the first image of each day for time-lapse
          const processed = this.processEPICImages([dayImages[0]], collection);
          timelapseImages.push(...processed);
        }
      } catch (error) {
        console.warn(`Failed to get images for ${date}:`, error);
      }

      // Add delay to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return timelapseImages;
  }

  /**
   * Generate image URLs for different sizes
   */
  private generateImageUrls(
    imageName: string,
    collection: EPICCollection,
    date: string
  ): ProcessedEPICImage['imageUrl'] {
    const baseUrl = 'https://api.nasa.gov/EPIC/archive';
    const basePath = `${baseUrl}/${collection}/${date.replace(/-/g, '/')}/png`;

    return {
      thumbnail: `${basePath}/${imageName}.png?api_key=${NASA_API_KEY}`,
      medium: `${basePath}/${imageName}.png?api_key=${NASA_API_KEY}`,
      large: `${basePath}/${imageName}.png?api_key=${NASA_API_KEY}`,
      archive: `${basePath}/${imageName}.png?api_key=${NASA_API_KEY}`,
    };
  }

  /**
   * Format date for image URL construction
   */
  private formatImageDate(date: string): string {
    // Convert YYYY-MM-DD to YYYY/MM/DD for image URLs
    return date.replace(/-/g, '/');
  }

  /**
   * Calculate distance between two 3D points
   */
  private calculateDistance(position: { x: number; y: number; z: number }): number {
    return Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2);
  }

  /**
   * Calculate image quality score based on metadata
   */
  private calculateImageQuality(image: EPICImageData): number {
    // Simple quality scoring based on available data completeness
    let score = 70; // Base score

    if (image.centroid_coordinates.lat !== 0 || image.centroid_coordinates.lon !== 0) {
      score += 10; // Has valid coordinates
    }

    if (image.caption && image.caption.length > 10) {
      score += 10; // Has meaningful caption
    }

    if (image.attitude_quaternions.q0 !== 0) {
      score += 10; // Has attitude data
    }

    return Math.min(score, 100);
  }

  /**
   * Get Earth images showing specific phenomena (experimental)
   */
  async getSpecialPhenomena(options: {
    collection?: EPICCollection;
    type?: 'eclipse' | 'aurora' | 'moon_transit';
    limit?: number;
  }): Promise<ProcessedEPICImage[]> {
    const { collection = 'natural', limit = 5 } = options;

    // Get recent images and filter based on metadata/captions
    const latestImages = await this.getLatestImages(collection);
    const processed = this.processEPICImages(latestImages, collection);

    // Filter based on captions or other indicators
    const filtered = processed.filter((image) => {
      const caption = image.caption.toLowerCase();
      return (
        caption.includes('eclipse') ||
        caption.includes('moon') ||
        caption.includes('shadow') ||
        caption.includes('transit')
      );
    });

    return filtered.slice(0, limit);
  }

  /**
   * Check EPIC service availability
   */
  async isServiceAvailable(): Promise<{
    available: boolean;
    collections: {
      natural: boolean;
      enhanced: boolean;
    };
    lastUpdate?: string;
  }> {
    try {
      const [naturalTest, enhancedTest] = await Promise.allSettled([
        this.getAvailableDates('natural'),
        this.getAvailableDates('enhanced'),
      ]);

      const naturalAvailable = naturalTest.status === 'fulfilled' && naturalTest.value.length > 0;
      const enhancedAvailable =
        enhancedTest.status === 'fulfilled' && enhancedTest.value.length > 0;

      let lastUpdate: string | undefined;
      if (naturalAvailable && naturalTest.status === 'fulfilled') {
        lastUpdate = naturalTest.value[naturalTest.value.length - 1];
      }

      return {
        available: naturalAvailable || enhancedAvailable,
        collections: {
          natural: naturalAvailable,
          enhanced: enhancedAvailable,
        },
        lastUpdate,
      };
    } catch (error) {
      return {
        available: false,
        collections: {
          natural: false,
          enhanced: false,
        },
      };
    }
  }
}

// Export singleton instance
export const epicEarthAPI = new EPICEarthAPI();
