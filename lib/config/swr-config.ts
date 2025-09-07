import { SWRConfiguration } from 'swr';

// Global SWR configuration for improved performance
export const swrConfig: SWRConfiguration = {
  // Reduce revalidation frequency
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  
  // Increase deduping interval to prevent duplicate requests
  dedupingInterval: 10000, // 10 seconds
  
  // Keep data fresh in background
  refreshInterval: 0, // Disabled by default, set per hook
  
  // Error retry configuration
  errorRetryInterval: 5000,
  errorRetryCount: 2,
  
  // Custom fetcher with caching headers
  fetcher: async (url: string) => {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    
    return res.json();
  },
  
  // Keep previous data while revalidating
  keepPreviousData: true,
  
  // Faster loading with suspense (optional)
  suspense: false,
  
  // Custom cache provider for longer persistence
  provider: () => new Map(),
};

// API endpoint cache times (in milliseconds)
export const CACHE_TIMES = {
  DSN_NOW: 30000,        // 30 seconds - real-time data
  MARS_PHOTOS: 300000,   // 5 minutes
  SPACECRAFT: 60000,     // 1 minute
  INSIGHT_PHOTOS: 1800000, // 30 minutes
  WEATHER: 3600000,      // 1 hour
  MEDIA: 3600000,        // 1 hour
};