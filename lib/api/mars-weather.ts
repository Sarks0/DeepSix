// Mars Weather Service API Integration
// Provides atmospheric data from the InSight Mars lander

import { NASAApiBase, CircuitBreaker } from './base';
import {
  MarsWeatherResponse,
  MarsWeatherSol,
  NASAAPIError,
  CacheConfig,
} from '@/lib/types/nasa-api';

export interface MarsWeatherOptions {
  feedtype?: 'json';
  ver?: '1.0';
}

export interface ProcessedWeatherData {
  sol: string;
  earthDate: string;
  season: string;
  temperature?: {
    average: number;
    minimum: number;
    maximum: number;
    unit: 'celsius';
    measurements: number;
  };
  pressure?: {
    average: number;
    minimum: number;
    maximum: number;
    unit: 'pascal';
    measurements: number;
  };
  windSpeed?: {
    average: number;
    minimum: number;
    maximum: number;
    unit: 'm/s';
    measurements: number;
  };
  windDirection?: {
    mostCommon: {
      degrees: number;
      compassPoint: string;
      measurements: number;
    };
  };
  dataQuality: {
    temperature: boolean;
    pressure: boolean;
    wind: boolean;
  };
}

export class MarsWeatherAPI extends NASAApiBase {
  private circuitBreaker = new CircuitBreaker(3, 30000); // 3 failures, 30s reset

  // Cache configuration for weather data
  static readonly CACHE_CONFIG: CacheConfig = {
    ttl: 3600, // 1 hour - weather data doesn't change frequently
    staleWhileRevalidate: 1800, // 30 minutes stale tolerance
    key: 'mars-weather',
  };

  /**
   * Get the latest Mars weather data
   * Note: The InSight mission ended in December 2022, but historical data is still available
   */
  async getLatestWeather(options: MarsWeatherOptions = {}): Promise<MarsWeatherResponse> {
    return this.circuitBreaker.execute(async () => {
      const params = {
        feedtype: options.feedtype || 'json',
        ver: options.ver || '1.0',
      };

      const url = this.buildUrlWithParams('/insight_weather/', params);

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new NASAAPIError(
            `Mars Weather API Error: ${response.status} ${response.statusText}`,
            response.status,
            '/insight_weather/'
          );
        }

        return await response.json();
      } catch (error) {
        if (error instanceof NASAAPIError) {
          throw error;
        }
        throw new NASAAPIError(
          `Failed to fetch Mars weather data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          undefined,
          '/insight_weather/'
        );
      }
    });
  }

  /**
   * Get weather data for a specific sol (Martian day)
   */
  async getWeatherForSol(sol: string): Promise<MarsWeatherSol | null> {
    const weatherData = await this.getLatestWeather();

    if (weatherData[sol] && typeof weatherData[sol] === 'object') {
      return weatherData[sol] as MarsWeatherSol;
    }

    return null;
  }

  /**
   * Get the most recent available sols with weather data
   */
  async getRecentSols(limit: number = 7): Promise<MarsWeatherSol[]> {
    const weatherData = await this.getLatestWeather();
    const sols: MarsWeatherSol[] = [];

    if (weatherData.sol_keys && Array.isArray(weatherData.sol_keys)) {
      const sortedSols = weatherData.sol_keys
        .sort((a, b) => parseInt(b) - parseInt(a)) // Most recent first
        .slice(0, limit);

      for (const solKey of sortedSols) {
        const solData = weatherData[solKey];
        if (solData && typeof solData === 'object') {
          sols.push(solData as MarsWeatherSol);
        }
      }
    }

    return sols;
  }

  /**
   * Process raw weather data into a more usable format
   */
  processWeatherData(weatherData: MarsWeatherResponse): ProcessedWeatherData[] {
    const processedData: ProcessedWeatherData[] = [];

    if (!weatherData.sol_keys || !Array.isArray(weatherData.sol_keys)) {
      return processedData;
    }

    for (const solKey of weatherData.sol_keys) {
      const solData = weatherData[solKey] as MarsWeatherSol;
      if (!solData || typeof solData !== 'object') continue;

      const processed: ProcessedWeatherData = {
        sol: solKey,
        earthDate: this.convertUTCToEarthDate(solData.First_UTC),
        season: solData.Season || 'unknown',
        dataQuality: {
          temperature: !!solData.AT,
          pressure: !!solData.PRE,
          wind: !!(solData.HWS || solData.WD),
        },
      };

      // Process temperature data
      if (solData.AT) {
        processed.temperature = {
          average: Math.round((((solData.AT.av - 32) * 5) / 9) * 100) / 100, // Convert F to C
          minimum: Math.round((((solData.AT.mn - 32) * 5) / 9) * 100) / 100,
          maximum: Math.round((((solData.AT.mx - 32) * 5) / 9) * 100) / 100,
          unit: 'celsius',
          measurements: solData.AT.ct,
        };
      }

      // Process pressure data
      if (solData.PRE) {
        processed.pressure = {
          average: Math.round(solData.PRE.av * 100) / 100,
          minimum: Math.round(solData.PRE.mn * 100) / 100,
          maximum: Math.round(solData.PRE.mx * 100) / 100,
          unit: 'pascal',
          measurements: solData.PRE.ct,
        };
      }

      // Process wind speed data
      if (solData.HWS) {
        processed.windSpeed = {
          average: Math.round(solData.HWS.av * 100) / 100,
          minimum: Math.round(solData.HWS.mn * 100) / 100,
          maximum: Math.round(solData.HWS.mx * 100) / 100,
          unit: 'm/s',
          measurements: solData.HWS.ct,
        };
      }

      // Process wind direction data
      if (solData.WD?.most_common) {
        processed.windDirection = {
          mostCommon: {
            degrees: solData.WD.most_common.compass_degrees,
            compassPoint: solData.WD.most_common.compass_point,
            measurements: solData.WD.most_common.ct,
          },
        };
      }

      processedData.push(processed);
    }

    return processedData.sort((a, b) => parseInt(b.sol) - parseInt(a.sol));
  }

  /**
   * Get weather statistics over time
   */
  async getWeatherStats(): Promise<{
    totalSols: number;
    dateRange: {
      start: string;
      end: string;
    };
    averages: {
      temperature?: number;
      pressure?: number;
      windSpeed?: number;
    };
    dataAvailability: {
      temperature: number; // Percentage
      pressure: number;
      wind: number;
    };
  }> {
    const weatherData = await this.getLatestWeather();
    const processed = this.processWeatherData(weatherData);

    if (processed.length === 0) {
      throw new NASAAPIError('No weather data available for statistics');
    }

    const stats = {
      totalSols: processed.length,
      dateRange: {
        start: processed[processed.length - 1]?.earthDate || '',
        end: processed[0]?.earthDate || '',
      },
      averages: {} as any,
      dataAvailability: {
        temperature: 0,
        pressure: 0,
        wind: 0,
      },
    };

    // Calculate averages and data availability
    let tempSum = 0,
      tempCount = 0;
    let pressureSum = 0,
      pressureCount = 0;
    let windSum = 0,
      windCount = 0;

    for (const sol of processed) {
      if (sol.temperature) {
        tempSum += sol.temperature.average;
        tempCount++;
      }
      if (sol.pressure) {
        pressureSum += sol.pressure.average;
        pressureCount++;
      }
      if (sol.windSpeed) {
        windSum += sol.windSpeed.average;
        windCount++;
      }
    }

    stats.dataAvailability.temperature = Math.round((tempCount / processed.length) * 100);
    stats.dataAvailability.pressure = Math.round((pressureCount / processed.length) * 100);
    stats.dataAvailability.wind = Math.round((windCount / processed.length) * 100);

    if (tempCount > 0) {
      stats.averages.temperature = Math.round((tempSum / tempCount) * 100) / 100;
    }
    if (pressureCount > 0) {
      stats.averages.pressure = Math.round((pressureSum / pressureCount) * 100) / 100;
    }
    if (windCount > 0) {
      stats.averages.windSpeed = Math.round((windSum / windCount) * 100) / 100;
    }

    return stats;
  }

  /**
   * Convert UTC timestamp to Earth date
   */
  private convertUTCToEarthDate(utcString: string): string {
    try {
      return new Date(utcString).toISOString().split('T')[0];
    } catch {
      return utcString;
    }
  }

  /**
   * Check if weather service is available
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      await this.getLatestWeather();
      return true;
    } catch (error) {
      console.warn('Mars Weather Service unavailable:', error);
      return false;
    }
  }

  /**
   * Get Mars sol to Earth date conversion info
   */
  getSolToEarthDateInfo(): {
    description: string;
    conversionNote: string;
    missionStatus: string;
  } {
    return {
      description: 'Mars sol (solar day) is approximately 24 hours, 39 minutes, and 35 seconds',
      conversionNote: 'Each sol is about 2.7% longer than an Earth day',
      missionStatus: 'InSight mission ended December 2022. Historical data remains available.',
    };
  }
}

// Export singleton instance
export const marsWeatherAPI = new MarsWeatherAPI();
