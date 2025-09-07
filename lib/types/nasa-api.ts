// NASA API TypeScript interfaces and types

// ================================
// Common Types
// ================================

export interface NASAApiError {
  error?: {
    code: string;
    message: string;
  };
  errors?: string[];
}

export interface PaginatedResponse<T> {
  collection: {
    version: string;
    href: string;
    items: T[];
    metadata?: {
      total_hits: number;
    };
    links?: Array<{
      rel: string;
      href: string;
      prompt?: string;
    }>;
  };
}

// ================================
// Mars Weather Service API Types
// ================================

export interface MarsWeatherSol {
  sol: string;
  AT?: TemperatureData; // Atmospheric Temperature
  HWS?: WindData; // Horizontal Wind Speed
  PRE?: PressureData; // Pressure
  WD?: WindDirectionData; // Wind Direction
  First_UTC: string;
  Last_UTC: string;
  Season: string;
}

export interface TemperatureData {
  av: number; // Average
  ct: number; // Count of measurements
  mn: number; // Minimum
  mx: number; // Maximum
}

export interface WindData {
  av: number;
  ct: number;
  mn: number;
  mx: number;
}

export interface PressureData {
  av: number;
  ct: number;
  mn: number;
  mx: number;
}

export interface WindDirectionData {
  most_common?: {
    compass_degrees: number;
    compass_point: string;
    compass_right: number;
    compass_up: number;
    ct: number;
  };
}

export interface MarsWeatherResponse {
  sol_keys: string[];
  validity_checks: Record<
    string,
    {
      AT: boolean;
      HWS: boolean;
      PRE: boolean;
      WD: boolean;
    }
  >;
  [key: string]: MarsWeatherSol | string[] | any; // Dynamic sol keys
}

// ================================
// Mars Rover Photos API Types
// ================================

export interface Camera {
  id: number;
  name: string;
  rover_id: number;
  full_name: string;
}

export interface RoverInfo {
  id: number;
  name: string;
  landing_date: string;
  launch_date: string;
  status: 'active' | 'complete';
  max_sol: number;
  max_date: string;
  total_photos: number;
  cameras: Array<{
    name: string;
    full_name: string;
  }>;
}

export interface RoverPhoto {
  id: number;
  sol: number;
  camera: Camera;
  img_src: string;
  earth_date: string;
  rover: RoverInfo;
}

export interface RoverPhotosResponse {
  photos: RoverPhoto[];
}

export interface ManifestPhoto {
  sol: number;
  earth_date: string;
  total_photos: number;
  cameras: string[];
}

export interface RoverManifest {
  photo_manifest: {
    name: string;
    landing_date: string;
    launch_date: string;
    status: string;
    max_sol: number;
    max_date: string;
    total_photos: number;
    photos: ManifestPhoto[];
  };
}

// Valid rover names
export type RoverName = 'curiosity' | 'opportunity' | 'spirit' | 'perseverance';

// Valid camera names for each rover
export type CameraName =
  | 'FHAZ'
  | 'RHAZ'
  | 'MAST'
  | 'CHEMCAM'
  | 'MAHLI'
  | 'MARDI' // Curiosity
  | 'EDL_RUCAM'
  | 'EDL_RDCAM'
  | 'EDL_DDCAM'
  | 'EDL_PUCAM1'
  | 'EDL_PUCAM2' // Perseverance EDL
  | 'NAVCAM_LEFT'
  | 'NAVCAM_RIGHT'
  | 'MCZ_LEFT'
  | 'MCZ_RIGHT' // Perseverance
  | 'FRONT_HAZCAM_LEFT_A'
  | 'FRONT_HAZCAM_RIGHT_A'
  | 'REAR_HAZCAM_LEFT'
  | 'REAR_HAZCAM_RIGHT' // Perseverance
  | 'PANCAM'
  | 'NAVCAM'; // Opportunity/Spirit

// ================================
// EPIC (Earth) API Types
// ================================

export interface EPICImageData {
  identifier: string;
  caption: string;
  image: string;
  version: string;
  centroid_coordinates: {
    lat: number;
    lon: number;
  };
  dscovr_j2000_position: {
    x: number;
    y: number;
    z: number;
  };
  lunar_j2000_position: {
    x: number;
    y: number;
    z: number;
  };
  sun_j2000_position: {
    x: number;
    y: number;
    z: number;
  };
  attitude_quaternions: {
    q0: number;
    q1: number;
    q2: number;
    q3: number;
  };
  date: string;
  coords?: {
    centroid_coordinates: {
      lat: number;
      lon: number;
    };
    dscovr_j2000_position: {
      x: number;
      y: number;
      z: number;
    };
    lunar_j2000_position: {
      x: number;
      y: number;
      z: number;
    };
    sun_j2000_position: {
      x: number;
      y: number;
      z: number;
    };
    attitude_quaternions: {
      q0: number;
      q1: number;
      q2: number;
      q3: number;
    };
  };
}

export type EPICResponse = EPICImageData[];

export type EPICCollection = 'natural' | 'enhanced';

// ================================
// NASA Image and Video Library Types
// ================================

export interface NASAMediaAsset {
  href: string;
}

export interface NASAMediaLink {
  href: string;
  rel: string;
  render?: string;
}

export interface NASAMediaData {
  center?: string;
  title: string;
  nasa_id: string;
  date_created: string;
  keywords?: string[];
  media_type: 'image' | 'video' | 'audio';
  description?: string;
  description_508?: string;
  secondary_creator?: string;
  photographer?: string;
  location?: string;
  album?: string[];
}

export interface NASAMediaItem {
  href: string;
  data: NASAMediaData[];
  links?: NASAMediaLink[];
}

export interface NASASearchResponse extends PaginatedResponse<NASAMediaItem> {}

export interface NASAAssetResponse {
  collection: {
    version: string;
    href: string;
    items: NASAMediaAsset[];
  };
}

// Search parameters for NASA Image Library
export interface NASASearchParams {
  q?: string; // Search query
  center?: string; // NASA center
  description?: string;
  description_508?: string;
  keywords?: string;
  location?: string;
  media_type?: 'image' | 'video' | 'audio';
  nasa_id?: string;
  page?: number;
  page_size?: number;
  photographer?: string;
  secondary_creator?: string;
  title?: string;
  year_start?: string;
  year_end?: string;
}

// ================================
// API Configuration Types
// ================================

export interface APIRateLimit {
  remaining: number;
  reset: number; // Unix timestamp
  limit: number;
}

export interface APIResponse<T> {
  data: T;
  rateLimit?: APIRateLimit;
  cached?: boolean;
  timestamp: number;
}

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  staleWhileRevalidate: number; // Additional time to serve stale data
  key: string;
}

// ================================
// Mission Status Types (for future Deep Space Network integration)
// ================================

export interface MissionStatus {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastContact?: string;
  nextContact?: string;
  signalStrength?: number;
  dataRate?: number;
  distance?: {
    value: number;
    unit: 'AU' | 'km' | 'miles';
  };
  position?: {
    x: number;
    y: number;
    z: number;
    reference: 'heliocentric' | 'geocentric';
  };
}

// ================================
// Error Types
// ================================

export class NASAAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public rateLimitExceeded?: boolean
  ) {
    super(message);
    this.name = 'NASAAPIError';
  }
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

// ================================
// Processed Data Types for UI
// ================================

export interface ProcessedWeatherData {
  sol: string;
  earthDate: string;
  temperature?: {
    celsius: number;
    fahrenheit: number;
    min: number;
    max: number;
  };
  pressure?: {
    value: number;
    unit: string;
  };
  windSpeed?: {
    value: number;
    unit: string;
  };
  season: string;
  freshness: number;
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
  rover: {
    name: string;
    status: string;
  };
  metadata: {
    size: string;
    format: string;
    isSecure: boolean;
  };
}

export interface ProcessedEPICImage {
  identifier: string;
  caption: string;
  imageUrl: string;
  thumbnailUrl: string;
  date: string;
  coordinates: {
    latitude: number;
    longitude: number;
    formatted: string;
  };
  positions: {
    earth: { x: number; y: number; z: number };
    moon: { x: number; y: number; z: number };
    sun: { x: number; y: number; z: number };
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
  cameras: Array<{
    name: string;
    fullName: string;
    photoCount: number;
  }>;
  recentActivity: {
    lastPhotoDate: string;
    photosThisWeek: number;
    averagePhotosPerSol: number;
  };
}
