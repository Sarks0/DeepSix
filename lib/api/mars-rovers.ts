// Mars Rover Photos API Integration
// Provides access to photos from NASA's Mars rovers (Curiosity, Perseverance, Opportunity, Spirit)

import { NASAApiBase, CircuitBreaker } from './base';
import {
  RoverPhotosResponse,
  RoverPhoto,
  RoverManifest,
  RoverName,
  CameraName,
  NASAAPIError,
  CacheConfig,
} from '@/lib/types/nasa-api';

export interface RoverPhotoFilters {
  sol?: number;
  earth_date?: string; // YYYY-MM-DD format
  camera?: CameraName;
  page?: number;
}

export interface RoverPhotoSearchOptions extends RoverPhotoFilters {
  rover: RoverName;
}

export interface ProcessedRoverPhoto {
  id: number;
  sol: number;
  earthDate: string;
  camera: {
    name: string;
    fullName: string;
  };
  imageUrl: string;
  thumbnailUrl: string;
  rover: {
    name: string;
    status: string;
    landingDate: string;
    missionDuration: string;
  };
  metadata: {
    originalSize?: string;
    estimatedSize: 'small' | 'medium' | 'large';
  };
}

export interface RoverMissionSummary {
  name: string;
  status: 'active' | 'complete';
  landingDate: string;
  launchDate: string;
  missionDuration: string;
  totalPhotos: number;
  maxSol: number;
  lastPhotoDate: string;
  cameras: Array<{
    name: string;
    fullName: string;
    photoCount?: number;
  }>;
  highlights: {
    mostProductiveSol?: {
      sol: number;
      photoCount: number;
      date: string;
    };
    averagePhotosPerSol: number;
  };
}

export class MarsRoverAPI extends NASAApiBase {
  private circuitBreaker = new CircuitBreaker(3, 30000);

  // Cache configurations for different data types
  static readonly CACHE_CONFIGS = {
    photos: {
      ttl: 1800, // 30 minutes - photos don't change
      staleWhileRevalidate: 3600, // 1 hour stale tolerance
      key: 'rover-photos',
    } as CacheConfig,
    manifest: {
      ttl: 86400, // 24 hours - manifests change infrequently
      staleWhileRevalidate: 43200, // 12 hours stale tolerance
      key: 'rover-manifest',
    } as CacheConfig,
    latest: {
      ttl: 3600, // 1 hour - latest photos
      staleWhileRevalidate: 1800, // 30 minutes stale tolerance
      key: 'rover-latest',
    } as CacheConfig,
  };

  /**
   * Get photos from a specific rover
   */
  async getRoverPhotos(options: RoverPhotoSearchOptions): Promise<RoverPhotosResponse> {
    return this.circuitBreaker.execute(async () => {
      const { rover, ...filters } = options;

      const params: Record<string, any> = {};

      if (filters.sol !== undefined) params.sol = filters.sol;
      if (filters.earth_date) params.earth_date = filters.earth_date;
      if (filters.camera) params.camera = filters.camera;
      if (filters.page) params.page = filters.page;

      const endpoint = `/mars-photos/api/v1/rovers/${rover}/photos`;
      return await this.makeRequest<RoverPhotosResponse>(this.buildUrlWithParams(endpoint, params));
    });
  }

  /**
   * Get rover mission manifest with photo statistics
   */
  async getRoverManifest(rover: RoverName): Promise<RoverManifest> {
    return this.circuitBreaker.execute(async () => {
      const endpoint = `/mars-photos/api/v1/rovers/${rover}/`;
      return await this.makeRequest<RoverManifest>(endpoint);
    });
  }

  /**
   * Get the latest photos from a rover
   */
  async getLatestPhotos(rover: RoverName, limit: number = 20): Promise<RoverPhoto[]> {
    try {
      const manifest = await this.getRoverManifest(rover);
      const latestSol = manifest.photo_manifest.max_sol;

      // Try to get photos from the most recent sols
      for (let sol = latestSol; sol >= Math.max(0, latestSol - 10); sol--) {
        const response = await this.getRoverPhotos({ rover, sol });
        if (response.photos.length > 0) {
          return response.photos.slice(0, limit);
        }
      }

      // Fallback to earth date if no sol-based photos found
      const latestDate = manifest.photo_manifest.max_date;
      const response = await this.getRoverPhotos({ rover, earth_date: latestDate });
      return response.photos.slice(0, limit);
    } catch (error) {
      throw new NASAAPIError(
        `Failed to get latest photos for ${rover}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        `/mars-photos/api/v1/rovers/${rover}`
      );
    }
  }

  /**
   * Get photos from all active rovers for a specific date
   */
  async getPhotosFromAllRovers(earthDate: string): Promise<{
    [key in RoverName]?: RoverPhoto[];
  }> {
    const rovers: RoverName[] = ['curiosity', 'perseverance', 'opportunity', 'spirit'];
    const results: { [key in RoverName]?: RoverPhoto[] } = {};

    const promises = rovers.map(async (rover) => {
      try {
        const response = await this.getRoverPhotos({ rover, earth_date: earthDate });
        if (response.photos.length > 0) {
          results[rover] = response.photos;
        }
      } catch (error) {
        console.warn(`No photos available for ${rover} on ${earthDate}:`, error);
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Search photos with advanced filtering
   */
  async searchPhotos(options: {
    rover?: RoverName;
    sols?: number[];
    cameras?: CameraName[];
    dateRange?: {
      start: string;
      end: string;
    };
    limit?: number;
  }): Promise<RoverPhoto[]> {
    const { rover, sols, cameras, dateRange, limit = 100 } = options;
    const allPhotos: RoverPhoto[] = [];

    const roversToSearch: RoverName[] = rover
      ? [rover]
      : ['curiosity', 'perseverance', 'opportunity', 'spirit'];

    for (const roverName of roversToSearch) {
      try {
        if (sols && sols.length > 0) {
          // Search by specific sols
          for (const sol of sols.slice(0, 5)) {
            // Limit to 5 sols to avoid rate limits
            const searchOptions: RoverPhotoSearchOptions = { rover: roverName, sol };
            const response = await this.getRoverPhotos(searchOptions);
            allPhotos.push(...response.photos);
          }
        } else if (dateRange) {
          // Search by date range (simplified - just use start date)
          const searchOptions: RoverPhotoSearchOptions = {
            rover: roverName,
            earth_date: dateRange.start,
          };
          const response = await this.getRoverPhotos(searchOptions);
          allPhotos.push(...response.photos);
        } else {
          // Get latest photos
          const latestPhotos = await this.getLatestPhotos(roverName, 25);
          allPhotos.push(...latestPhotos);
        }
      } catch (error) {
        console.warn(`Search failed for rover ${roverName}:`, error);
      }
    }

    // Filter by cameras if specified
    const filteredPhotos =
      cameras && cameras.length > 0
        ? allPhotos.filter((photo) => cameras.includes(photo.camera.name as CameraName))
        : allPhotos;

    // Sort by date/sol (most recent first) and limit results
    filteredPhotos.sort((a, b) => {
      const dateCompare = new Date(b.earth_date).getTime() - new Date(a.earth_date).getTime();
      return dateCompare !== 0 ? dateCompare : b.sol - a.sol;
    });

    return filteredPhotos.slice(0, limit);
  }

  /**
   * Process raw rover photos into enhanced format
   */
  processRoverPhotos(photos: RoverPhoto[]): ProcessedRoverPhoto[] {
    return photos.map((photo) => ({
      id: photo.id,
      sol: photo.sol,
      earthDate: photo.earth_date,
      camera: {
        name: photo.camera.name,
        fullName: photo.camera.full_name,
      },
      imageUrl: photo.img_src,
      thumbnailUrl: this.generateThumbnailUrl(photo.img_src),
      rover: {
        name: photo.rover.name,
        status: photo.rover.status,
        landingDate: photo.rover.landing_date,
        missionDuration: this.calculateMissionDuration(photo.rover.landing_date),
      },
      metadata: {
        estimatedSize: this.estimateImageSize(photo.img_src),
      },
    }));
  }

  /**
   * Get comprehensive mission summary for a rover
   */
  async getRoverMissionSummary(rover: RoverName): Promise<RoverMissionSummary> {
    const manifest = await this.getRoverManifest(rover);
    const { photo_manifest } = manifest;

    // Calculate most productive sol
    const mostProductiveSol = photo_manifest.photos.reduce((max, current) =>
      current.total_photos > max.total_photos ? current : max
    );

    const totalPhotos = photo_manifest.total_photos;
    const totalSols = photo_manifest.photos.length;

    return {
      name: photo_manifest.name,
      status: photo_manifest.status as 'active' | 'complete',
      landingDate: photo_manifest.landing_date,
      launchDate: photo_manifest.launch_date,
      missionDuration: this.calculateMissionDuration(photo_manifest.landing_date),
      totalPhotos: totalPhotos,
      maxSol: photo_manifest.max_sol,
      lastPhotoDate: photo_manifest.max_date,
      cameras: this.getRoverCameraInfo(rover),
      highlights: {
        mostProductiveSol: {
          sol: mostProductiveSol.sol,
          photoCount: mostProductiveSol.total_photos,
          date: mostProductiveSol.earth_date,
        },
        averagePhotosPerSol: Math.round(totalPhotos / totalSols),
      },
    };
  }

  /**
   * Get camera information for a specific rover
   */
  getRoverCameraInfo(rover: RoverName): Array<{
    name: string;
    fullName: string;
    photoCount?: number;
  }> {
    const cameraInfo: Record<RoverName, Array<{ name: string; fullName: string }>> = {
      curiosity: [
        { name: 'FHAZ', fullName: 'Front Hazard Avoidance Camera' },
        { name: 'RHAZ', fullName: 'Rear Hazard Avoidance Camera' },
        { name: 'MAST', fullName: 'Mast Camera' },
        { name: 'CHEMCAM', fullName: 'Chemistry and Camera Complex' },
        { name: 'MAHLI', fullName: 'Mars Hand Lens Imager' },
        { name: 'MARDI', fullName: 'Mars Descent Imager' },
        { name: 'NAVCAM', fullName: 'Navigation Camera' },
      ],
      perseverance: [
        { name: 'EDL_RUCAM', fullName: 'Rover Up-Look Camera' },
        { name: 'EDL_RDCAM', fullName: 'Rover Down-Look Camera' },
        { name: 'EDL_DDCAM', fullName: 'Descent Stage Down-Look Camera' },
        { name: 'EDL_PUCAM1', fullName: 'Parachute Up-Look Camera A' },
        { name: 'EDL_PUCAM2', fullName: 'Parachute Up-Look Camera B' },
        { name: 'NAVCAM_LEFT', fullName: 'Navigation Camera - Left' },
        { name: 'NAVCAM_RIGHT', fullName: 'Navigation Camera - Right' },
        { name: 'MCZ_LEFT', fullName: 'Mast Camera Zoom - Left' },
        { name: 'MCZ_RIGHT', fullName: 'Mast Camera Zoom - Right' },
        { name: 'FRONT_HAZCAM_LEFT_A', fullName: 'Front Hazard Camera - Left' },
        { name: 'FRONT_HAZCAM_RIGHT_A', fullName: 'Front Hazard Camera - Right' },
        { name: 'REAR_HAZCAM_LEFT', fullName: 'Rear Hazard Camera - Left' },
        { name: 'REAR_HAZCAM_RIGHT', fullName: 'Rear Hazard Camera - Right' },
      ],
      opportunity: [
        { name: 'FHAZ', fullName: 'Front Hazard Avoidance Camera' },
        { name: 'RHAZ', fullName: 'Rear Hazard Avoidance Camera' },
        { name: 'NAVCAM', fullName: 'Navigation Camera' },
        { name: 'PANCAM', fullName: 'Panoramic Camera' },
      ],
      spirit: [
        { name: 'FHAZ', fullName: 'Front Hazard Avoidance Camera' },
        { name: 'RHAZ', fullName: 'Rear Hazard Avoidance Camera' },
        { name: 'NAVCAM', fullName: 'Navigation Camera' },
        { name: 'PANCAM', fullName: 'Panoramic Camera' },
      ],
    };

    return cameraInfo[rover] || [];
  }

  /**
   * Get random featured photos from active rovers
   */
  async getFeaturedPhotos(count: number = 12): Promise<ProcessedRoverPhoto[]> {
    const featuredPhotos: RoverPhoto[] = [];
    const rovers: RoverName[] = ['curiosity', 'perseverance'];

    for (const rover of rovers) {
      try {
        const latest = await this.getLatestPhotos(rover, count / rovers.length);
        featuredPhotos.push(...latest);
      } catch (error) {
        console.warn(`Could not get featured photos for ${rover}:`, error);
      }
    }

    // Shuffle and return processed photos
    const shuffled = featuredPhotos.sort(() => Math.random() - 0.5);
    return this.processRoverPhotos(shuffled.slice(0, count));
  }

  /**
   * Helper: Generate thumbnail URL (NASA provides various sizes)
   */
  private generateThumbnailUrl(originalUrl: string): string {
    // NASA Mars photos can be resized by modifying the URL
    return originalUrl.replace(/\.jpg$/i, '_th.jpg');
  }

  /**
   * Helper: Estimate image size based on URL patterns
   */
  private estimateImageSize(url: string): 'small' | 'medium' | 'large' {
    if (url.includes('th.jpg') || url.includes('thumbnail')) return 'small';
    if (url.includes('browse') || url.includes('medium')) return 'medium';
    return 'large';
  }

  /**
   * Helper: Calculate mission duration
   */
  private calculateMissionDuration(landingDate: string): string {
    const landing = new Date(landingDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - landing.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const years = Math.floor(diffDays / 365);
    const remainingDays = diffDays % 365;

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}, ${remainingDays} days`;
    }
    return `${diffDays} days`;
  }

  /**
   * Check service availability for all rovers
   */
  async checkRoverServiceStatus(): Promise<{
    [key in RoverName]: {
      available: boolean;
      lastUpdate?: string;
      photoCount?: number;
    };
  }> {
    const rovers: RoverName[] = ['curiosity', 'perseverance', 'opportunity', 'spirit'];
    const status = {} as any;

    await Promise.allSettled(
      rovers.map(async (rover) => {
        try {
          const manifest = await this.getRoverManifest(rover);
          status[rover] = {
            available: true,
            lastUpdate: manifest.photo_manifest.max_date,
            photoCount: manifest.photo_manifest.total_photos,
          };
        } catch (error) {
          status[rover] = {
            available: false,
          };
        }
      })
    );

    return status;
  }
}

// Export singleton instance
export const marsRoverAPI = new MarsRoverAPI();
