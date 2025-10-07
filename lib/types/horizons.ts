/**
 * TypeScript types for JPL Horizons API integration
 * API Documentation: https://ssd-api.jpl.nasa.gov/doc/horizons.html
 */

/**
 * Spacecraft identifiers (NAIF IDs) for JPL Horizons API
 */
export const SPACECRAFT_IDS = {
  'europa-clipper': '-159',
  'lucy': '-49',
  'psyche': '-255',
  'osiris-apex': '-64',
  'juno': '-61',
  'new-horizons': '-98',
  'voyager-1': '-31',
  'voyager-2': '-32',
  'parker-solar-probe': '-96',
} as const;

export type SpacecraftIdMap = typeof SPACECRAFT_IDS;

export type SpacecraftId = keyof typeof SPACECRAFT_IDS;

/**
 * Query parameters for Horizons API
 */
export interface HorizonsQuery {
  /** Spacecraft NAIF ID (e.g., '-159' for Europa Clipper) */
  command: string;
  /** Ephemeris type: 'VECTORS' for position/velocity, 'OBSERVER' for sky position */
  ephemType?: 'VECTORS' | 'OBSERVER';
  /** Center point: '500@399' = Earth geocenter, '@10' = Sun */
  center?: string;
  /** Start time (ISO date format) */
  startTime?: string;
  /** Stop time (ISO date format) */
  stopTime?: string;
  /** Time step (e.g., '1d' for 1 day, '1h' for 1 hour) */
  stepSize?: string;
  /** Output units: 'KM-S' = kilometers and seconds */
  outUnits?: string;
  /** Reference system: 'ICRF' = International Celestial Reference Frame */
  refSystem?: string;
  /** Vector table format */
  vecTable?: string;
}

/**
 * Parsed position data from Horizons API
 */
export interface SpacecraftPosition {
  /** Spacecraft identifier */
  spacecraftId: string;
  /** Date/time of the position data */
  timestamp: Date;
  /** Distance from Earth in kilometers */
  distanceFromEarthKm: number;
  /** Distance from Earth in Astronomical Units */
  distanceFromEarthAU: number;
  /** Distance from Sun in kilometers */
  distanceFromSunKm?: number;
  /** Distance from Sun in Astronomical Units */
  distanceFromSunAU?: number;
  /** Velocity relative to center (km/s) */
  velocityKmPerSec?: number;
  /** One-way light time in minutes */
  lightTimeMinutes: number;
  /** Position vector X (km) */
  positionX?: number;
  /** Position vector Y (km) */
  positionY?: number;
  /** Position vector Z (km) */
  positionZ?: number;
  /** Velocity vector X (km/s) */
  velocityX?: number;
  /** Velocity vector Y (km/s) */
  velocityY?: number;
  /** Velocity vector Z (km/s) */
  velocityZ?: number;
  /** Source of data */
  source: 'horizons-api';
  /** Last updated timestamp */
  lastUpdated: Date;
}

/**
 * Raw response structure from Horizons API
 */
export interface HorizonsApiResponse {
  signature: {
    source: string;
    version: string;
  };
  result?: string;
  error?: string;
}

/**
 * Cached spacecraft position with TTL
 */
export interface CachedSpacecraftPosition extends SpacecraftPosition {
  /** Cache expiry timestamp */
  expiresAt: Date;
}

/**
 * Error types for Horizons API
 */
export class HorizonsApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'HorizonsApiError';
  }
}
