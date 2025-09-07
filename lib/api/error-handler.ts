import { NextResponse } from 'next/server';

export interface ApiError {
  error: string;
  message: string;
  status: number;
  timestamp: string;
}

/**
 * Handle API errors with appropriate responses
 */
export function handleApiError(error: unknown, context: string = 'API'): NextResponse {
  // Edge Runtime compatible - no console logging

  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch failed')) {
    return NextResponse.json(
      {
        error: 'Service Unavailable',
        message: 'Unable to reach external services. Please try again later.',
        status: 503,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  // Connection errors
  if (error instanceof Error) {
    if (error.message.includes('ECONNRESET') || error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        {
          error: 'Connection Error',
          message: 'Failed to connect to external service. Data may be temporarily unavailable.',
          status: 502,
          timestamp: new Date().toISOString(),
        },
        { status: 502 }
      );
    }

    if (error.message.includes('ETIMEDOUT')) {
      return NextResponse.json(
        {
          error: 'Request Timeout',
          message: 'The request took too long to complete. Please try again.',
          status: 504,
          timestamp: new Date().toISOString(),
        },
        { status: 504 }
      );
    }
  }

  // Default error response
  return NextResponse.json(
    {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred. Please try again later.',
      status: 500,
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

/**
 * Retry failed requests with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error instanceof Response && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, i);

      if (i < maxRetries - 1) {
        // Edge Runtime compatible - no console logging
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Fallback data for when APIs are unavailable
 */
/**
 * Timeout wrapper for API calls
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeoutId));
  });
}

/**
 * Validate spacecraft ID format
 */
export function validateSpacecraftId(id: string): { valid: boolean; error?: string } {
  if (!id || typeof id !== 'string') {
    return { valid: false, error: 'Spacecraft ID is required' };
  }

  const cleanId = id.toLowerCase().trim();

  if (cleanId.length === 0) {
    return { valid: false, error: 'Spacecraft ID cannot be empty' };
  }

  if (cleanId.length > 50) {
    return { valid: false, error: 'Spacecraft ID is too long' };
  }

  // Check for valid characters (letters, numbers, hyphens, underscores)
  const validPattern = /^[a-z0-9\-_]+$/;
  if (!validPattern.test(cleanId)) {
    return { valid: false, error: 'Spacecraft ID contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Get available spacecraft IDs
 */
export function getAvailableSpacecraftIds(): string[] {
  return [
    'voyager-1',
    'voyager-2',
    'new-horizons',
    'parker-solar-probe',
    'perseverance',
    'curiosity',
  ];
}

export const FALLBACK_DATA = {
  spacecraft: {
    'voyager-1': {
      id: 'voyager-1',
      name: 'Voyager 1',
      status: 'Data temporarily unavailable',
      distance: { km: 24195000000, au: 161.8, lightTime: '22.45 hours' },
      position: { x: 80.5, y: 120.3, z: 60.2 },
      velocity: { kms: 17.0, kmh: 61200 },
      coordinates: { lat: 34.0, lon: 174.0 },
      communicationDelay: {
        oneWay: '22.45 hours',
        roundTrip: '44.9 hours',
        formatted: { oneWay: '22.45 hours', roundTrip: '44.9 hours' },
      },
      timestamp: new Date().toISOString(),
      dataSource: 'Cached/Fallback Data',
      message: 'Live data is temporarily unavailable. Showing cached values.',
      _realData: false,
    },
    'voyager-2': {
      id: 'voyager-2',
      name: 'Voyager 2',
      status: 'Data temporarily unavailable',
      distance: { km: 20125000000, au: 134.5, lightTime: '18.67 hours' },
      position: { x: -67.2, y: -98.4, z: -45.1 },
      velocity: { kms: 15.3, kmh: 55080 },
      coordinates: { lat: -57.0, lon: 310.0 },
      communicationDelay: {
        oneWay: '18.67 hours',
        roundTrip: '37.34 hours',
        formatted: { oneWay: '18.67 hours', roundTrip: '37.34 hours' },
      },
      timestamp: new Date().toISOString(),
      dataSource: 'Cached/Fallback Data',
      message: 'Live data is temporarily unavailable. Showing cached values.',
      _realData: false,
    },
    'new-horizons': {
      id: 'new-horizons',
      name: 'New Horizons',
      status: 'Data temporarily unavailable',
      distance: { km: 8700000000, au: 58.1, lightTime: '8.07 hours' },
      position: { x: 45.2, y: 35.8, z: -2.1 },
      velocity: { kms: 14.1, kmh: 50760 },
      coordinates: { lat: -2.3, lon: 69.0 },
      communicationDelay: {
        oneWay: '8.07 hours',
        roundTrip: '16.14 hours',
        formatted: { oneWay: '8.07 hours', roundTrip: '16.14 hours' },
      },
      timestamp: new Date().toISOString(),
      dataSource: 'Cached/Fallback Data',
      message: 'Live data is temporarily unavailable. Showing cached values.',
      _realData: false,
    },
    'parker-solar-probe': {
      id: 'parker-solar-probe',
      name: 'Parker Solar Probe',
      status: 'Data temporarily unavailable',
      distance: { km: 11200000, au: 0.075, lightTime: '0.01 hours' },
      position: { x: 0.05, y: 0.04, z: 0.01 },
      velocity: { kms: 163.0, kmh: 586800 },
      coordinates: { lat: 0.0, lon: 0.0 },
      communicationDelay: {
        oneWay: '0.01 hours',
        roundTrip: '0.02 hours',
        formatted: { oneWay: '37s', roundTrip: '74s' },
      },
      timestamp: new Date().toISOString(),
      dataSource: 'Cached/Fallback Data',
      message: 'Live data is temporarily unavailable. Showing cached values.',
      _realData: false,
    },
    perseverance: {
      id: 'perseverance',
      name: 'Mars Perseverance Rover',
      status: 'Data temporarily unavailable',
      distance: { km: 225000000, au: 1.5, lightTime: '14 minutes' },
      position: { x: 1.2, y: 0.8, z: 0.1 },
      velocity: { kms: 0.00005, kmh: 0.18 },
      coordinates: { lat: 18.4447, lon: 77.4508 },
      communicationDelay: {
        oneWay: '14 minutes',
        roundTrip: '28 minutes',
        formatted: { oneWay: '14m', roundTrip: '28m' },
      },
      timestamp: new Date().toISOString(),
      dataSource: 'Cached/Fallback Data',
      message: 'Live data is temporarily unavailable. Showing cached values.',
      _realData: false,
    },
    curiosity: {
      id: 'curiosity',
      name: 'Mars Curiosity Rover',
      status: 'Data temporarily unavailable',
      distance: { km: 225000000, au: 1.5, lightTime: '14 minutes' },
      position: { x: 1.3, y: 0.7, z: -0.1 },
      velocity: { kms: 0.00004, kmh: 0.14 },
      coordinates: { lat: -4.5895, lon: 137.4417 },
      communicationDelay: {
        oneWay: '14 minutes',
        roundTrip: '28 minutes',
        formatted: { oneWay: '14m', roundTrip: '28m' },
      },
      timestamp: new Date().toISOString(),
      dataSource: 'Cached/Fallback Data',
      message: 'Live data is temporarily unavailable. Showing cached values.',
      _realData: false,
    },
  },
  dsn: {
    message: 'Deep Space Network data is temporarily unavailable.',
    stations: [],
    spacecraft: [],
  },
  mars: {
    message: 'Mars weather data is temporarily unavailable.',
    sol: 'N/A',
    temperature: { min: -100, max: -20, avg: -60 },
    pressure: 'N/A',
  },
};
