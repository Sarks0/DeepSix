/**
 * Deep Space Network (DSN) API Service
 * Fetches real-time data from NASA's DSN tracking stations
 */

export interface DSNStation {
  name: string;
  friendlyName: string;
  timeUTC: number;
  timeZoneOffset: number;
  dishes: DSNDish[];
}

export interface DSNDish {
  name: string;
  azimuthAngle: number;
  elevationAngle: number;
  windSpeed: number;
  isMSPA: boolean;
  isArray: boolean;
  isDDOR: boolean;
  created: string;
  updated: string;
  targets: DSNTarget[];
}

export interface DSNTarget {
  id: number;
  name: string;
  downSignal?: DSNSignal;
  upSignal?: DSNSignal;
  spacecraft?: string[];
}

export interface DSNSignal {
  signalType: string;
  dataRate: number;
  frequency: number;
  power: number;
  signalTypeDebug?: string;
  spacecraftId?: number;
}

export interface DSNData {
  stations: DSNStation[];
  timestamp: number;
}

class DSNService {
  private baseUrl = 'https://eyes.nasa.gov/dsn/data';
  private cache: Map<string, { data: DSNData; timestamp: number }> = new Map();
  private cacheTimeout = 5000; // 5 seconds cache

  async fetchDSNStatus(): Promise<DSNData> {
    const cacheKey = 'dsn-status';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // Fetch from API route to avoid CORS issues
      const response = await fetch('/api/dsn');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch DSN data: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Error fetching DSN data:', error);
      // Return cached data if available, even if expired
      if (cached) {
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Get active spacecraft communications
   */
  getActiveSpacecraft(data: DSNData): Array<{
    spacecraft: string;
    station: string;
    dish: string;
    signalType: string;
    dataRate: number;
  }> {
    const active: Array<{
      spacecraft: string;
      station: string;
      dish: string;
      signalType: string;
      dataRate: number;
    }> = [];

    data.stations.forEach(station => {
      station.dishes.forEach(dish => {
        dish.targets.forEach(target => {
          if (target.spacecraft && target.spacecraft.length > 0) {
            target.spacecraft.forEach(sc => {
              active.push({
                spacecraft: sc,
                station: station.friendlyName,
                dish: dish.name,
                signalType: target.downSignal ? 'downlink' : 'uplink',
                dataRate: target.downSignal?.dataRate || target.upSignal?.dataRate || 0
              });
            });
          }
        });
      });
    });

    return active;
  }

  /**
   * Get station statistics
   */
  getStationStats(station: DSNStation): {
    totalDishes: number;
    activeDishes: number;
    inMaintenance: number;
  } {
    const activeDishes = station.dishes.filter(d => 
      d.targets.some(t => t.spacecraft && t.spacecraft.length > 0)
    ).length;

    return {
      totalDishes: station.dishes.length,
      activeDishes,
      inMaintenance: station.dishes.length - activeDishes
    };
  }

  /**
   * Format spacecraft name for display
   */
  formatSpacecraftName(code: string): string {
    const spacecraftNames: Record<string, string> = {
      'VGR1': 'Voyager 1',
      'VGR2': 'Voyager 2',
      'JNO': 'Juno',
      'MRO': 'Mars Reconnaissance Orbiter',
      'MVN': 'MAVEN',
      'MSL': 'Curiosity Rover',
      'M20': 'Perseverance Rover',
      'NHPC': 'New Horizons',
      'PSP': 'Parker Solar Probe',
      'CHDR': 'Chandra X-ray Observatory',
      'STA': 'STEREO-A',
      'TGO': 'Trace Gas Orbiter',
      'MMS4': 'Magnetospheric Multiscale 4',
      'EURC': 'Europa Clipper'
    };

    return spacecraftNames[code] || code;
  }
}

export const dsnService = new DSNService();