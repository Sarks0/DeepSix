/**
 * JPL Horizons API Integration
 * Provides spacecraft ephemeris data for deep space missions
 */

import { NASAAPIError } from '@/lib/types/nasa-api';

// Spacecraft IDs in JPL Horizons
export const SPACECRAFT_IDS = {
  VOYAGER_1: '-31',
  VOYAGER_2: '-32',
  NEW_HORIZONS: '-98',
  PARKER_SOLAR_PROBE: '-96',
  JUNO: '-61',
  CASSINI: '-82', // Historical
} as const;

export interface SpacecraftPosition {
  id: string;
  name: string;
  timestamp: string;
  position: {
    x: number; // km
    y: number; // km
    z: number; // km
  };
  velocity: {
    vx: number; // km/s
    vy: number; // km/s
    vz: number; // km/s
  };
  distanceFromEarth: number; // km
  distanceFromSun: number; // km
  lightTimeFromEarth: number; // seconds
  communicationDelay: {
    oneWay: number; // seconds
    roundTrip: number; // seconds
  };
}

export interface HorizonsOptions {
  spacecraft: keyof typeof SPACECRAFT_IDS;
  startTime?: string; // ISO date
  stopTime?: string; // ISO date
  stepSize?: string; // e.g., '1d', '1h'
}

class JPLHorizonsService {
  private baseUrl = 'https://ssd.jpl.nasa.gov/api/horizons.api';

  /**
   * Get current position and telemetry for a spacecraft
   */
  async getSpacecraftPosition(
    spacecraft: keyof typeof SPACECRAFT_IDS
  ): Promise<SpacecraftPosition> {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const params = new URLSearchParams({
      format: 'json',
      COMMAND: SPACECRAFT_IDS[spacecraft],
      OBJ_DATA: 'YES',
      MAKE_EPHEM: 'YES',
      EPHEM_TYPE: 'VECTORS',
      CENTER: '500@399', // Earth center
      START_TIME: now.toISOString().split('T')[0],
      STOP_TIME: tomorrow.toISOString().split('T')[0],
      STEP_SIZE: '1d',
      VEC_TABLE: '3', // Position and velocity
      REF_SYSTEM: 'ICRF',
      OUT_UNITS: 'KM-S',
      VEC_LABELS: 'YES',
      CSV_FORMAT: 'NO',
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params}`);

      if (!response.ok) {
        throw new NASAAPIError(`JPL Horizons API error: ${response.statusText}`, response.status);
      }

      const data = await response.json();
      return this.parseHorizonsResponse(data, spacecraft);
    } catch (error) {
      console.error('Error fetching spacecraft position:', error);
      throw error;
    }
  }

  /**
   * Get positions for all tracked spacecraft
   */
  async getAllSpacecraftPositions(): Promise<SpacecraftPosition[]> {
    const spacecraftList: (keyof typeof SPACECRAFT_IDS)[] = [
      'VOYAGER_1',
      'VOYAGER_2',
      'NEW_HORIZONS',
      'PARKER_SOLAR_PROBE',
    ];

    const positions = await Promise.allSettled(
      spacecraftList.map((sc) => this.getSpacecraftPosition(sc))
    );

    return positions
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<SpacecraftPosition>).value);
  }

  /**
   * Parse JPL Horizons response into our format
   */
  private parseHorizonsResponse(
    data: any,
    spacecraft: keyof typeof SPACECRAFT_IDS
  ): SpacecraftPosition {
    // Extract ephemeris data from response
    const result = data.result;
    if (!result) {
      throw new NASAAPIError('Invalid Horizons response format');
    }

    // Parse the ephemeris table
    const lines = result.split('\n');
    let inDataSection = false;
    let dataLine = '';

    for (const line of lines) {
      if (line.includes('$$SOE')) {
        inDataSection = true;
        continue;
      }
      if (line.includes('$$EOE')) {
        break;
      }
      if (inDataSection && line.trim()) {
        dataLine = line;
        break; // Get first data line
      }
    }

    // Parse position and velocity from data line
    // Format: JDTDB, Calendar Date (TDB), X, Y, Z, VX, VY, VZ
    const parts = dataLine.trim().split(/\s+/);

    // Extract values (typically starts at index 2 after date/time)
    const x = parseFloat(parts[2]) || 0;
    const y = parseFloat(parts[3]) || 0;
    const z = parseFloat(parts[4]) || 0;
    const vx = parseFloat(parts[5]) || 0;
    const vy = parseFloat(parts[6]) || 0;
    const vz = parseFloat(parts[7]) || 0;

    // Calculate distances
    const distanceFromEarth = Math.sqrt(x * x + y * y + z * z);
    const distanceFromSun = this.calculateSolarDistance(x, y, z);

    // Calculate communication delay (speed of light = 299,792 km/s)
    const lightSpeed = 299792; // km/s
    const oneWayDelay = distanceFromEarth / lightSpeed;

    return {
      id: SPACECRAFT_IDS[spacecraft],
      name: this.getSpacecraftName(spacecraft),
      timestamp: new Date().toISOString(),
      position: { x, y, z },
      velocity: { vx, vy, vz },
      distanceFromEarth,
      distanceFromSun,
      lightTimeFromEarth: oneWayDelay,
      communicationDelay: {
        oneWay: oneWayDelay,
        roundTrip: oneWayDelay * 2,
      },
    };
  }

  /**
   * Calculate distance from Sun (assuming Earth at ~1 AU)
   */
  private calculateSolarDistance(x: number, y: number, z: number): number {
    // Rough approximation - Earth's position would need to be subtracted
    // for accurate Sun distance
    const earthOrbitRadius = 149597870.7; // 1 AU in km
    return Math.sqrt((x + earthOrbitRadius) ** 2 + y ** 2 + z ** 2);
  }

  /**
   * Get human-readable spacecraft name
   */
  private getSpacecraftName(id: keyof typeof SPACECRAFT_IDS): string {
    const names = {
      VOYAGER_1: 'Voyager 1',
      VOYAGER_2: 'Voyager 2',
      NEW_HORIZONS: 'New Horizons',
      PARKER_SOLAR_PROBE: 'Parker Solar Probe',
      JUNO: 'Juno',
      CASSINI: 'Cassini',
    };
    return names[id] || id;
  }

  /**
   * Format communication delay for display
   */
  formatCommunicationDelay(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
}

// Export singleton instance
export const jplHorizons = new JPLHorizonsService();

// Export types
export type { JPLHorizonsService };
