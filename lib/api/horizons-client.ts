/**
 * JPL Horizons API Client
 *
 * Provides real-time spacecraft position data from NASA's JPL Horizons system.
 * API Documentation: https://ssd-api.jpl.nasa.gov/doc/horizons.html
 *
 * Features:
 * - Real-time position calculations for deep space missions
 * - Distance, velocity, and light-time data
 * - No authentication required
 * - No rate limits
 */

import {
  SPACECRAFT_IDS,
  type SpacecraftId,
  type HorizonsQuery,
  type SpacecraftPosition,
  type HorizonsApiResponse,
  HorizonsApiError,
} from '@/lib/types/horizons';

// Re-export SPACECRAFT_IDS for use in other modules
export { SPACECRAFT_IDS } from '@/lib/types/horizons';

const HORIZONS_API_BASE = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const AU_TO_KM = 149597870.7; // 1 AU in kilometers

/**
 * Fetches spacecraft position data from JPL Horizons API
 */
export async function getSpacecraftPosition(
  spacecraftId: SpacecraftId,
  options?: Partial<HorizonsQuery>
): Promise<SpacecraftPosition> {
  const naifId = SPACECRAFT_IDS[spacecraftId];

  if (!naifId) {
    throw new HorizonsApiError(`Unknown spacecraft ID: ${spacecraftId}`);
  }

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000); // +24 hours

  // Build query parameters
  const query: HorizonsQuery = {
    command: naifId,
    ephemType: 'VECTORS',
    center: '500@399', // Earth geocenter
    startTime: now.toISOString().split('T')[0],
    stopTime: tomorrow.toISOString().split('T')[0],
    stepSize: '1d',
    outUnits: 'KM-S',
    refSystem: 'ICRF',
    vecTable: '2',
    ...options,
  };

  // Build URL with query parameters (filter out undefined values)
  const paramObject: Record<string, string> = {
    format: 'json',
    COMMAND: query.command,
    EPHEM_TYPE: query.ephemType || 'VECTORS',
    CENTER: query.center || '500@399',
    START_TIME: query.startTime || '',
    STOP_TIME: query.stopTime || '',
    STEP_SIZE: query.stepSize || '1d',
    OUT_UNITS: query.outUnits || 'KM-S',
    REF_SYSTEM: query.refSystem || 'ICRF',
    VEC_TABLE: query.vecTable || '2',
  };

  const params = new URLSearchParams(paramObject);

  const url = `${HORIZONS_API_BASE}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      // Cache for 6 hours (positions change slowly for distant spacecraft)
      next: { revalidate: 21600 },
    });

    if (!response.ok) {
      throw new HorizonsApiError(
        `Horizons API request failed: ${response.statusText}`,
        response.status
      );
    }

    const data: HorizonsApiResponse = await response.json();

    if (data.error) {
      throw new HorizonsApiError(`Horizons API error: ${data.error}`);
    }

    if (!data.result) {
      throw new HorizonsApiError('Horizons API returned no result data');
    }

    // Parse the result text to extract position data
    return parseHorizonsResult(spacecraftId, data.result, now);
  } catch (error) {
    if (error instanceof HorizonsApiError) {
      throw error;
    }
    throw new HorizonsApiError(
      'Failed to fetch spacecraft position',
      undefined,
      error
    );
  }
}

/**
 * Parses the text result from Horizons API to extract position data
 */
function parseHorizonsResult(
  spacecraftId: string,
  resultText: string,
  timestamp: Date
): SpacecraftPosition {
  try {
    // The result contains sections marked with $$ delimiters
    // We need to find the SOE (Start of Ephemeris) and EOE (End of Ephemeris) section
    const soeIndex = resultText.indexOf('$$SOE');
    const eoeIndex = resultText.indexOf('$$EOE');

    if (soeIndex === -1 || eoeIndex === -1) {
      throw new Error('Could not find ephemeris data in result');
    }

    // Extract the data line(s) between SOE and EOE
    const ephemerisData = resultText.substring(soeIndex + 5, eoeIndex).trim();
    const lines = ephemerisData.split('\n').filter((line) => line.trim());

    if (lines.length < 2) {
      throw new Error('No ephemeris data lines found');
    }

    // Format is multi-line:
    // Line 1: JDTDB = date
    // Line 2: X = ... Y = ... Z = ...
    // Line 3: VX= ... VY= ... VZ= ...

    // Find lines with position and velocity data (use the first occurrence)
    const positionLine = lines.find((line) => line.trim().startsWith('X ='));
    const velocityLine = lines.find((line) => line.trim().startsWith('VX='));

    if (!positionLine || !velocityLine) {
      throw new Error('Could not find position or velocity data');
    }

    // Parse position: X = value Y = value Z = value
    const posMatch = positionLine.match(/X\s*=\s*([-+]?[\d.E+-]+)\s+Y\s*=\s*([-+]?[\d.E+-]+)\s+Z\s*=\s*([-+]?[\d.E+-]+)/);
    if (!posMatch) {
      throw new Error('Could not parse position data');
    }

    const x = parseFloat(posMatch[1]);
    const y = parseFloat(posMatch[2]);
    const z = parseFloat(posMatch[3]);

    // Parse velocity: VX= value VY= value VZ= value
    const velMatch = velocityLine.match(/VX=\s*([-+]?[\d.E+-]+)\s+VY=\s*([-+]?[\d.E+-]+)\s+VZ=\s*([-+]?[\d.E+-]+)/);
    if (!velMatch) {
      throw new Error('Could not parse velocity data');
    }

    const vx = parseFloat(velMatch[1]);
    const vy = parseFloat(velMatch[2]);
    const vz = parseFloat(velMatch[3]);

    // Calculate distance from Earth (magnitude of position vector)
    const distanceKm = Math.sqrt(x * x + y * y + z * z);
    const distanceAU = distanceKm / AU_TO_KM;

    // Calculate velocity magnitude
    const velocityKmPerSec = Math.sqrt(vx * vx + vy * vy + vz * vz);

    // Light time in minutes (distance / speed of light)
    const lightTimeMinutes = distanceKm / 299792.458 / 60;

    return {
      spacecraftId,
      timestamp,
      distanceFromEarthKm: distanceKm,
      distanceFromEarthAU: distanceAU,
      velocityKmPerSec,
      lightTimeMinutes,
      positionX: x,
      positionY: y,
      positionZ: z,
      velocityX: vx,
      velocityY: vy,
      velocityZ: vz,
      source: 'horizons-api',
      lastUpdated: timestamp,
    };
  } catch (error) {
    throw new HorizonsApiError(
      `Failed to parse Horizons result: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      undefined,
      error
    );
  }
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  const distanceAU = distanceKm / AU_TO_KM;

  if (distanceAU < 1) {
    // Less than 1 AU - show in millions of km
    return `${(distanceKm / 1000000).toFixed(2)} million km`;
  } else if (distanceAU < 10) {
    // 1-10 AU - show both
    return `${distanceAU.toFixed(2)} AU (${(distanceKm / 1000000).toFixed(1)} million km)`;
  } else {
    // More than 10 AU - just show AU
    return `${distanceAU.toFixed(2)} AU`;
  }
}

/**
 * Format velocity for display
 */
export function formatVelocity(velocityKmPerSec: number): string {
  return `${velocityKmPerSec.toFixed(2)} km/s`;
}

/**
 * Format light time for display
 */
export function formatLightTime(lightTimeMinutes: number): string {
  if (lightTimeMinutes < 60) {
    return `${Math.round(lightTimeMinutes)} minutes`;
  } else {
    const hours = Math.floor(lightTimeMinutes / 60);
    const minutes = Math.round(lightTimeMinutes % 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}
