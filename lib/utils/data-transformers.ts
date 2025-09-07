// Data Transformation Utilities for NASA API Responses
// Provides standardized data processing and formatting functions

import { MarsWeatherSol, RoverPhoto, EPICImageData } from '@/lib/types/nasa-api';

// ================================
// Date and Time Utilities
// ================================

export class DateTimeUtils {
  /**
   * Convert Mars Sol to Earth date approximation
   */
  static solToEarthDate(sol: number, landingDate: string): string {
    try {
      const landing = new Date(landingDate);
      const marsDay = 24 * 60 * 60 * 1000 + 39 * 60 * 1000 + 35 * 1000; // 24h 39m 35s
      const approximateDate = new Date(landing.getTime() + sol * marsDay);
      return approximateDate.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Calculate mission duration in human-readable format
   */
  static calculateMissionDuration(startDate: string, endDate?: string): string {
    try {
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date();
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      const days = diffDays % 30;

      const parts: string[] = [];
      if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
      if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
      if (days > 0 && years === 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);

      return parts.join(', ') || '0 days';
    } catch {
      return 'Unknown duration';
    }
  }

  /**
   * Format date for display
   */
  static formatDisplayDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Get relative time (e.g., "2 days ago")
   */
  static getRelativeTime(dateString: string): string {
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Convert UTC to local timezone
   */
  static utcToLocal(utcString: string): string {
    try {
      return new Date(utcString).toLocaleString();
    } catch {
      return utcString;
    }
  }
}

// ================================
// Unit Conversion Utilities
// ================================

export class UnitConverters {
  /**
   * Temperature conversions
   */
  static temperature = {
    fahrenheitToCelsius: (f: number): number => Math.round((((f - 32) * 5) / 9) * 100) / 100,
    celsiusToFahrenheit: (c: number): number => Math.round(((c * 9) / 5 + 32) * 100) / 100,
    kelvinToCelsius: (k: number): number => Math.round((k - 273.15) * 100) / 100,
    celsiusToKelvin: (c: number): number => Math.round((c + 273.15) * 100) / 100,
  };

  /**
   * Distance conversions
   */
  static distance = {
    kmToMiles: (km: number): number => Math.round(km * 0.621371 * 100) / 100,
    milesToKm: (miles: number): number => Math.round(miles * 1.60934 * 100) / 100,
    auToKm: (au: number): number => Math.round(au * 149597870.7 * 100) / 100,
    kmToAu: (km: number): number => Math.round((km / 149597870.7) * 100000) / 100000,
    metersToFeet: (m: number): number => Math.round(m * 3.28084 * 100) / 100,
    feetToMeters: (ft: number): number => Math.round(ft * 0.3048 * 100) / 100,
  };

  /**
   * Pressure conversions
   */
  static pressure = {
    pascalToAtm: (pa: number): number => Math.round((pa / 101325) * 1000) / 1000,
    pascalToBar: (pa: number): number => Math.round((pa / 100000) * 1000) / 1000,
    pascalToPsi: (pa: number): number => Math.round((pa / 6895) * 100) / 100,
    atmToPascal: (atm: number): number => Math.round(atm * 101325),
  };

  /**
   * Speed conversions
   */
  static speed = {
    mpsToMph: (mps: number): number => Math.round(mps * 2.237 * 100) / 100,
    mpsToKmh: (mps: number): number => Math.round(mps * 3.6 * 100) / 100,
    mphToMps: (mph: number): number => Math.round(mph * 0.447 * 100) / 100,
    kmhToMps: (kmh: number): number => Math.round(kmh * 0.278 * 100) / 100,
  };
}

// ================================
// Data Normalization Utilities
// ================================

export class DataNormalizer {
  /**
   * Normalize coordinate values
   */
  static normalizeCoordinates(
    lat: number,
    lon: number
  ): {
    latitude: number;
    longitude: number;
    formatted: string;
  } {
    const normalizedLat = Math.max(-90, Math.min(90, lat));
    const normalizedLon = ((lon + 180) % 360) - 180;

    const latDir = normalizedLat >= 0 ? 'N' : 'S';
    const lonDir = normalizedLon >= 0 ? 'E' : 'W';

    const formatted = `${Math.abs(normalizedLat).toFixed(4)}°${latDir}, ${Math.abs(normalizedLon).toFixed(4)}°${lonDir}`;

    return {
      latitude: normalizedLat,
      longitude: normalizedLon,
      formatted,
    };
  }

  /**
   * Normalize image URLs to ensure HTTPS
   */
  static normalizeImageUrl(url: string): string {
    if (!url) return '';
    return url.replace(/^http:/, 'https:');
  }

  /**
   * Clean and normalize text content
   */
  static normalizeText(text: string): string {
    if (!text) return '';

    return text
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[\r\n]+/g, ' ') // Replace line breaks with spaces
      .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
      .substring(0, 1000); // Limit length
  }

  /**
   * Normalize keywords array
   */
  static normalizeKeywords(keywords: string[] | string): string[] {
    if (!keywords) return [];

    const keywordArray = Array.isArray(keywords) ? keywords : [keywords];

    return keywordArray
      .map((keyword) => keyword.toLowerCase().trim())
      .filter((keyword) => keyword.length > 0)
      .filter((keyword, index, arr) => arr.indexOf(keyword) === index) // Remove duplicates
      .slice(0, 20); // Limit to 20 keywords
  }

  /**
   * Normalize file sizes
   */
  static normalizeFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// ================================
// Statistics and Analytics
// ================================

export class DataAnalytics {
  /**
   * Calculate basic statistics for numerical data
   */
  static calculateStats(values: number[]): {
    count: number;
    min: number;
    max: number;
    mean: number;
    median: number;
    standardDeviation: number;
  } {
    if (values.length === 0) {
      return { count: 0, min: 0, max: 0, mean: 0, median: 0, standardDeviation: 0 };
    }

    const count = values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const mean = values.reduce((sum, val) => sum + val, 0) / count;

    const sorted = [...values].sort((a, b) => a - b);
    const median =
      count % 2 === 0
        ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
        : sorted[Math.floor(count / 2)];

    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / count;
    const standardDeviation = Math.sqrt(variance);

    return {
      count,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      standardDeviation: Math.round(standardDeviation * 100) / 100,
    };
  }

  /**
   * Group data by time periods
   */
  static groupByTimePeriod<T extends { date: string }>(
    data: T[],
    period: 'day' | 'week' | 'month' | 'year'
  ): { [key: string]: T[] } {
    const groups: { [key: string]: T[] } = {};

    data.forEach((item) => {
      const date = new Date(item.date);
      let key: string;

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = String(date.getFullYear());
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return groups;
  }

  /**
   * Calculate data freshness score (0-100)
   */
  static calculateFreshnessScore(dateString: string): number {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      // Exponential decay: 100% fresh for today, 50% after 30 days, 0% after 365 days
      if (diffDays === 0) return 100;
      if (diffDays >= 365) return 0;

      return Math.round(100 * Math.exp(-diffDays / 120)); // 120 days for ~50% score
    } catch {
      return 0;
    }
  }
}

// ================================
// Specialized Data Transformers
// ================================

export class MarsDataTransformer {
  /**
   * Transform Mars weather data for visualization
   */
  static transformWeatherForChart(weatherData: MarsWeatherSol[]): {
    labels: string[];
    temperature: number[];
    pressure: number[];
    windSpeed: number[];
  } {
    const labels: string[] = [];
    const temperature: number[] = [];
    const pressure: number[] = [];
    const windSpeed: number[] = [];

    weatherData
      .sort((a, b) => parseInt(a.sol) - parseInt(b.sol))
      .forEach((sol) => {
        labels.push(`Sol ${sol.sol}`);

        if (sol.AT?.av) {
          temperature.push(UnitConverters.temperature.fahrenheitToCelsius(sol.AT.av));
        }

        if (sol.PRE?.av) {
          pressure.push(sol.PRE.av);
        }

        if (sol.HWS?.av) {
          windSpeed.push(sol.HWS.av);
        }
      });

    return { labels, temperature, pressure, windSpeed };
  }

  /**
   * Create Mars weather summary
   */
  static createWeatherSummary(weatherData: MarsWeatherSol[]): {
    totalSols: number;
    averageTemp?: number;
    tempRange?: { min: number; max: number };
    averagePressure?: number;
    averageWindSpeed?: number;
    season?: string;
  } {
    if (weatherData.length === 0) return { totalSols: 0 };

    const temps = weatherData.filter((sol) => sol.AT?.av).map((sol) => sol.AT!.av);
    const pressures = weatherData.filter((sol) => sol.PRE?.av).map((sol) => sol.PRE!.av);
    const winds = weatherData.filter((sol) => sol.HWS?.av).map((sol) => sol.HWS!.av);

    const summary: any = {
      totalSols: weatherData.length,
      season: weatherData[0]?.Season,
    };

    if (temps.length > 0) {
      const tempStats = DataAnalytics.calculateStats(temps);
      summary.averageTemp = UnitConverters.temperature.fahrenheitToCelsius(tempStats.mean);
      summary.tempRange = {
        min: UnitConverters.temperature.fahrenheitToCelsius(tempStats.min),
        max: UnitConverters.temperature.fahrenheitToCelsius(tempStats.max),
      };
    }

    if (pressures.length > 0) {
      summary.averagePressure = DataAnalytics.calculateStats(pressures).mean;
    }

    if (winds.length > 0) {
      summary.averageWindSpeed = DataAnalytics.calculateStats(winds).mean;
    }

    return summary;
  }
}

export class ImageDataTransformer {
  /**
   * Extract metadata from image URLs
   */
  static extractImageMetadata(url: string): {
    format: string;
    estimatedSize: 'thumbnail' | 'small' | 'medium' | 'large' | 'original';
    isSecure: boolean;
  } {
    const format = url.split('.').pop()?.toLowerCase() || 'unknown';
    const urlLower = url.toLowerCase();

    let estimatedSize: 'thumbnail' | 'small' | 'medium' | 'large' | 'original';

    if (urlLower.includes('thumb') || urlLower.includes('_th')) {
      estimatedSize = 'thumbnail';
    } else if (urlLower.includes('small') || urlLower.includes('_sm')) {
      estimatedSize = 'small';
    } else if (urlLower.includes('medium') || urlLower.includes('_md')) {
      estimatedSize = 'medium';
    } else if (urlLower.includes('large') || urlLower.includes('_lg')) {
      estimatedSize = 'large';
    } else if (urlLower.includes('orig') || urlLower.includes('full')) {
      estimatedSize = 'original';
    } else {
      estimatedSize = 'medium'; // Default
    }

    return {
      format,
      estimatedSize,
      isSecure: url.startsWith('https://'),
    };
  }

  /**
   * Generate responsive image srcSet
   */
  static generateSrcSet(baseUrl: string, sizes: string[] = ['small', 'medium', 'large']): string {
    return sizes
      .map((size) => {
        const url = baseUrl.replace(/\.(jpg|png|gif)$/i, `_${size}.$1`);
        const width = this.getSizeWidth(size);
        return `${url} ${width}w`;
      })
      .join(', ');
  }

  private static getSizeWidth(size: string): number {
    const sizeMap: { [key: string]: number } = {
      thumbnail: 150,
      small: 300,
      medium: 600,
      large: 1200,
      original: 1920,
    };
    return sizeMap[size] || 600;
  }
}

// ================================
// Export Utility Functions
// ================================

export const dataTransformers = {
  dateTime: DateTimeUtils,
  units: UnitConverters,
  normalizer: DataNormalizer,
  analytics: DataAnalytics,
  mars: MarsDataTransformer,
  image: ImageDataTransformer,
};

export default dataTransformers;
