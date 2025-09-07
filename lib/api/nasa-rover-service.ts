/**
 * NASA Mars Rover Photos API Service
 * Handles authentication, rate limiting, caching, and data transformation
 */

import { NASA_API_KEY } from './config';
import { getApiKeyFromContext } from './cloudflare-env';
import type { NextRequest } from 'next/server';

export interface RoverPhoto {
  id: number;
  sol: number;
  camera: {
    id: number;
    name: string;
    rover_id: number;
    full_name: string;
  };
  img_src: string;
  earth_date: string;
  rover: {
    id: number;
    name: string;
    landing_date: string;
    launch_date: string;
    status: string;
  };
}

export interface NASAPhotosResponse {
  photos: RoverPhoto[];
  success?: boolean;
  total?: number;
  rover?: RoverName;
  sol?: number | string;
}

export type RoverName = 'perseverance' | 'curiosity' | 'opportunity' | 'spirit';

// Known good sols for each rover for fallback
const ROVER_FALLBACK_SOLS: Record<RoverName, number[]> = {
  perseverance: [900, 800, 700, 600, 500, 400, 300, 200, 100],
  curiosity: [3000, 2500, 2000, 1500, 1000, 500, 100],
  opportunity: [5000, 4000, 3000, 2000, 1000],
  spirit: [2000, 1500, 1000, 500, 100],
};

// Camera preferences for better photo diversity
const PREFERRED_CAMERAS = [
  'FHAZ',
  'RHAZ',
  'MAST',
  'CHEMCAM',
  'MAHLI',
  'MARDI',
  'NAVCAM',
  'PANCAM',
  'HAZCAM',
];

export class NASARoverService {
  private static instance: NASARoverService;
  private apiKey: string;
  private baseUrl = 'https://api.nasa.gov/mars-photos/api/v1';
  private requestCount = 0;
  private lastHourReset = Date.now();
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly RATE_LIMIT = 950; // Leave buffer under NASA's 1000/hour limit

  private constructor(apiKey?: string) {
    this.apiKey = apiKey || NASA_API_KEY;
  }

  static getInstance(request?: NextRequest): NASARoverService {
    // Get API key from Cloudflare context if available
    const apiKey = request ? getApiKeyFromContext(request) : NASA_API_KEY;
    
    // Create new instance with the runtime API key
    // Note: We're not using singleton pattern here to ensure we always use the correct API key
    return new NASARoverService(apiKey);
  }

  /**
   * Check if we're within rate limits
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    if (now - this.lastHourReset > 60 * 60 * 1000) {
      // Reset every hour
      this.requestCount = 0;
      this.lastHourReset = now;
    }

    if (this.requestCount >= this.RATE_LIMIT) {
      return false;
    }

    this.requestCount++;
    return true;
  }

  /**
   * Get cached data if still valid
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    this.cache.delete(key); // Remove expired cache
    return null;
  }

  /**
   * Store data in cache
   */
  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Make authenticated request to NASA API
   */
  private async makeRequest(url: string): Promise<Response> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Stellar-Navigator-Dashboard/1.0',
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`NASA API error: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  /**
   * Fetch rover photos for a specific sol
   */
  async fetchRoverPhotosBySol(
    rover: RoverName,
    sol: number,
    page: number = 1,
    camera?: string
  ): Promise<RoverPhoto[]> {
    const params = new URLSearchParams({
      sol: sol.toString(),
      api_key: this.apiKey,
      page: page.toString(),
    });

    if (camera) {
      params.set('camera', camera);
    }

    const url = `${this.baseUrl}/rovers/${rover}/photos?${params.toString()}`;
    const cacheKey = `photos-${rover}-${sol}-${page}-${camera || 'all'}`;

    // Check cache first
    const cached = this.getCachedData<RoverPhoto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.makeRequest(url);
    const data: NASAPhotosResponse = await response.json();

    const photos = data.photos || [];

    // Cache the result
    this.setCachedData(cacheKey, photos);

    return photos;
  }

  /**
   * Get latest available photos with intelligent fallback
   */
  async getLatestPhotos(rover: RoverName, limit: number = 50): Promise<RoverPhoto[]> {
    const cacheKey = `latest-${rover}-${limit}`;

    // Check cache first
    const cached = this.getCachedData<RoverPhoto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const fallbackSols = ROVER_FALLBACK_SOLS[rover] || ROVER_FALLBACK_SOLS.curiosity;

    for (const sol of fallbackSols) {
      try {
        const photos = await this.fetchRoverPhotosBySol(rover, sol);

        if (photos.length > 0) {
          // Filter and optimize photos
          const filteredPhotos = this.optimizePhotoSelection(photos, limit);

          if (filteredPhotos.length > 0) {
            // Cache the successful result
            this.setCachedData(cacheKey, filteredPhotos);
            return filteredPhotos;
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch photos for ${rover} sol ${sol}:`, error);
        continue; // Try next sol
      }
    }

    // If nothing found, return empty array
    return [];
  }

  /**
   * Optimize photo selection for better variety and quality
   */
  private optimizePhotoSelection(photos: RoverPhoto[], limit: number): RoverPhoto[] {
    // Filter out invalid photos
    const validPhotos = photos.filter(
      (photo) =>
        photo.img_src &&
        photo.img_src.length > 0 &&
        !photo.img_src.includes('placeholder') &&
        photo.camera &&
        photo.rover
    );

    if (validPhotos.length === 0) {
      return [];
    }

    // Group by camera type for diversity
    const photosByCamera = validPhotos.reduce(
      (acc, photo) => {
        const camera = photo.camera.name;
        if (!acc[camera]) {
          acc[camera] = [];
        }
        acc[camera].push(photo);
        return acc;
      },
      {} as Record<string, RoverPhoto[]>
    );

    // Select photos with camera diversity
    const selectedPhotos: RoverPhoto[] = [];
    const camerasUsed = new Set<string>();

    // First pass: one photo per camera type
    for (const camera of PREFERRED_CAMERAS) {
      if (
        photosByCamera[camera] &&
        photosByCamera[camera].length > 0 &&
        selectedPhotos.length < limit
      ) {
        selectedPhotos.push(photosByCamera[camera][0]);
        camerasUsed.add(camera);
      }
    }

    // Second pass: fill remaining slots
    for (const photo of validPhotos) {
      if (selectedPhotos.length >= limit) break;

      if (!selectedPhotos.find((p) => p.id === photo.id)) {
        selectedPhotos.push(photo);
      }
    }

    return selectedPhotos.slice(0, limit);
  }

  /**
   * Get rover information
   */
  async getRoverInfo(rover: RoverName): Promise<any> {
    const cacheKey = `rover-info-${rover}`;

    // Check cache first
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    const url = `${this.baseUrl}/rovers/${rover}?api_key=${this.apiKey}`;
    const response = await this.makeRequest(url);
    const data = await response.json();

    // Cache for longer since rover info doesn't change often
    this.cache.set(cacheKey, { data: data.rover, timestamp: Date.now() });

    return data.rover;
  }

  /**
   * Validate rover name
   */
  static isValidRover(rover: string): rover is RoverName {
    return ['perseverance', 'curiosity', 'opportunity', 'spirit'].includes(rover.toLowerCase());
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      requestCount: this.requestCount,
      lastReset: new Date(this.lastHourReset).toISOString(),
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
