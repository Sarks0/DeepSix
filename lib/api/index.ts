// NASA API Service Layer - Main Exports
// Centralized exports for all NASA API services and utilities

// Base API configuration and utilities
export { NASAApiBase, CircuitBreaker, requestQueue } from './base';

// API Service instances
export { marsWeatherAPI } from './mars-weather';
export { marsRoverAPI } from './mars-rovers';
export { epicEarthAPI } from './epic-earth';
export { nasaMediaAPI } from './nasa-media';

// Type exports
export * from '@/lib/types/nasa-api';

// Utility exports
export { dataTransformers } from '@/lib/utils/data-transformers';

// React hooks
export * from '@/hooks/use-nasa-api';

// ================================
// Service Health Check
// ================================

import { marsWeatherAPI } from './mars-weather';
import { marsRoverAPI } from './mars-rovers';
import { epicEarthAPI } from './epic-earth';
import { nasaMediaAPI } from './nasa-media';

export async function checkAllServicesHealth(): Promise<{
  overall: 'healthy' | 'degraded' | 'down';
  services: {
    marsWeather: boolean;
    rovers: { [key: string]: boolean };
    earth: { available: boolean; collections: { natural: boolean; enhanced: boolean } };
    media: boolean;
  };
  timestamp: string;
}> {
  const [marsWeather, rovers, earth, media] = await Promise.allSettled([
    marsWeatherAPI.isServiceAvailable(),
    marsRoverAPI.checkRoverServiceStatus(),
    epicEarthAPI.isServiceAvailable(),
    nasaMediaAPI.isServiceAvailable(),
  ]);

  const services = {
    marsWeather: marsWeather.status === 'fulfilled' && marsWeather.value,
    rovers:
      rovers.status === 'fulfilled'
        ? Object.fromEntries(
            Object.entries(rovers.value).map(([rover, status]: [string, any]) => [
              rover,
              status.available,
            ])
          )
        : {},
    earth:
      earth.status === 'fulfilled'
        ? earth.value
        : { available: false, collections: { natural: false, enhanced: false } },
    media: media.status === 'fulfilled' && media.value,
  };

  // Determine overall health
  const healthyServices = [
    services.marsWeather,
    Object.values(services.rovers).some(Boolean),
    services.earth.available,
    services.media,
  ].filter(Boolean).length;

  let overall: 'healthy' | 'degraded' | 'down';
  if (healthyServices >= 3) overall = 'healthy';
  else if (healthyServices >= 1) overall = 'degraded';
  else overall = 'down';

  return {
    overall,
    services,
    timestamp: new Date().toISOString(),
  };
}

// ================================
// Rate Limit Information
// ================================

export function getRateLimitStatus() {
  const marsWeatherLimit = marsWeatherAPI.getRateLimitInfo();
  const roverLimit = marsRoverAPI.getRateLimitInfo();
  const epicLimit = epicEarthAPI.getRateLimitInfo();

  return {
    marsWeather: marsWeatherLimit,
    rovers: roverLimit,
    epic: epicLimit,
    // Note: NASA Media API doesn't expose rate limit headers
    global: {
      remaining: Math.min(marsWeatherLimit.remaining, roverLimit.remaining, epicLimit.remaining),
      reset: Math.max(marsWeatherLimit.reset, roverLimit.reset, epicLimit.reset),
      limit: 1000, // NASA's general limit
    },
  };
}

// ================================
// Quick Access Functions
// ================================

export const nasaAPI = {
  // Quick access to latest data
  async getLatestMarsWeather() {
    const weather = await marsWeatherAPI.getLatestWeather();
    return marsWeatherAPI.processWeatherData(weather);
  },

  async getLatestRoverPhotos(rover: 'curiosity' | 'perseverance' = 'perseverance', limit = 10) {
    const photos = await marsRoverAPI.getLatestPhotos(rover, limit);
    return marsRoverAPI.processRoverPhotos(photos);
  },

  async getLatestEarthImage() {
    const images = await epicEarthAPI.getLatestImages('natural');
    const processed = epicEarthAPI.processEPICImages(images, 'natural');
    return processed[0] || null;
  },

  async searchMedia(query: string, limit = 20) {
    return nasaMediaAPI.searchMedia({ q: query, page_size: limit, includeAssets: true });
  },

  // Service status
  async getServiceHealth() {
    return checkAllServicesHealth();
  },

  // Rate limits
  getRateLimits() {
    return getRateLimitStatus();
  },
};

// Default export
export default nasaAPI;
