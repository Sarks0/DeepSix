// SWR Hooks for NASA API Integration with Caching Strategies
// Provides React hooks for efficient data fetching and caching

import useSWR, { SWRConfiguration, mutate } from 'swr';
import { useState, useEffect, useCallback } from 'react';

// API imports
import { marsWeatherAPI } from '@/lib/api/mars-weather';
import { marsRoverAPI } from '@/lib/api/mars-rovers';
import { epicEarthAPI } from '@/lib/api/epic-earth';
import { nasaMediaAPI } from '@/lib/api/nasa-media';

// Type imports
import {
  ProcessedWeatherData,
  ProcessedRoverPhoto,
  RoverName,
  ProcessedEPICImage,
  EPICCollection,
  RoverMissionSummary,
  CameraName,
  NASAAPIError,
} from '@/lib/types/nasa-api';

import { ProcessedMediaItem, MediaSearchOptions } from '@/lib/api/nasa-media';

// ================================
// Base Hook Configuration
// ================================

const defaultSWRConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000, // 5 seconds
  errorRetryInterval: 10000, // 10 seconds
  errorRetryCount: 3,
  shouldRetryOnError: (error) => {
    // Don't retry on 4xx errors (except rate limit)
    if (error instanceof NASAAPIError && error.statusCode) {
      return error.statusCode >= 500 || error.statusCode === 429;
    }
    return true;
  },
};

// ================================
// Mars Weather Hooks
// ================================

export function useMarsWeather(options: { refreshInterval?: number } = {}) {
  const { refreshInterval = 3600000 } = options; // 1 hour default

  const {
    data,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR(
    'mars-weather-latest',
    async () => {
      const weatherData = await marsWeatherAPI.getLatestWeather();
      return marsWeatherAPI.processWeatherData(weatherData);
    },
    {
      ...defaultSWRConfig,
      refreshInterval,
      revalidateOnMount: true,
    }
  );

  return {
    weatherData: data,
    error,
    isLoading,
    refresh,
    isEmpty: data?.length === 0,
  };
}

export function useMarsWeatherStats() {
  const { data, error, isLoading } = useSWR(
    'mars-weather-stats',
    () => marsWeatherAPI.getWeatherStats(),
    {
      ...defaultSWRConfig,
      refreshInterval: 86400000, // 24 hours
    }
  );

  return {
    stats: data,
    error,
    isLoading,
  };
}

// ================================
// Mars Rover Hooks
// ================================

export function useRoverPhotos(options: {
  rover: RoverName;
  sol?: number;
  camera?: CameraName;
  limit?: number;
  refreshInterval?: number;
}) {
  const { rover, sol, camera, limit = 20, refreshInterval = 1800000 } = options; // 30 min default

  const cacheKey = `rover-photos-${rover}-${sol || 'latest'}-${camera || 'all'}`;

  const {
    data,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR(
    cacheKey,
    async () => {
      let photos;
      if (sol !== undefined) {
        const response = await marsRoverAPI.getRoverPhotos({
          rover,
          sol,
          camera,
        });
        photos = response.photos;
      } else {
        photos = await marsRoverAPI.getLatestPhotos(rover, limit);
      }

      return marsRoverAPI.processRoverPhotos(photos.slice(0, limit));
    },
    {
      ...defaultSWRConfig,
      refreshInterval,
    }
  );

  return {
    photos: data || [],
    error,
    isLoading,
    refresh,
    isEmpty: data?.length === 0,
  };
}

export function useRoverMissionSummary(rover: RoverName) {
  const { data, error, isLoading } = useSWR(
    `rover-mission-${rover}`,
    () => marsRoverAPI.getRoverMissionSummary(rover),
    {
      ...defaultSWRConfig,
      refreshInterval: 86400000, // 24 hours
    }
  );

  return {
    mission: data,
    error,
    isLoading,
  };
}

export function useFeaturedRoverPhotos(count: number = 12) {
  const {
    data,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR(`featured-rover-photos-${count}`, () => marsRoverAPI.getFeaturedPhotos(count), {
    ...defaultSWRConfig,
    refreshInterval: 3600000, // 1 hour
  });

  return {
    photos: data || [],
    error,
    isLoading,
    refresh,
  };
}

// ================================
// EPIC Earth Imagery Hooks
// ================================

export function useEarthImages(
  options: {
    collection?: EPICCollection;
    date?: string;
    refreshInterval?: number;
  } = {}
) {
  const { collection = 'natural', date, refreshInterval = 3600000 } = options;

  const cacheKey = `earth-images-${collection}-${date || 'latest'}`;

  const {
    data,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR(
    cacheKey,
    async () => {
      const images = date
        ? await epicEarthAPI.getEarthImages({ collection, date })
        : await epicEarthAPI.getLatestImages(collection);

      return epicEarthAPI.processEPICImages(images, collection);
    },
    {
      ...defaultSWRConfig,
      refreshInterval,
    }
  );

  return {
    images: data || [],
    error,
    isLoading,
    refresh,
    isEmpty: data?.length === 0,
  };
}

export function useEarthImageDates(collection: EPICCollection = 'natural') {
  const { data, error, isLoading } = useSWR(
    `earth-dates-${collection}`,
    () => epicEarthAPI.getAvailableDates(collection),
    {
      ...defaultSWRConfig,
      refreshInterval: 86400000, // 24 hours
    }
  );

  return {
    availableDates: data || [],
    error,
    isLoading,
  };
}

// ================================
// NASA Media Library Hooks
// ================================

export function useNASAMediaSearch(
  options: MediaSearchOptions & {
    refreshInterval?: number;
  }
) {
  const { refreshInterval = 1800000, ...searchOptions } = options; // 30 min default

  const cacheKey = `nasa-media-${JSON.stringify(searchOptions)}`;

  const {
    data,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR(
    searchOptions.q ? cacheKey : null, // Only fetch if there's a query
    () => nasaMediaAPI.searchMedia(searchOptions),
    {
      ...defaultSWRConfig,
      refreshInterval,
    }
  );

  return {
    searchResult: data,
    error,
    isLoading,
    refresh,
    isEmpty: data?.items.length === 0,
  };
}

export function useFeaturedMedia(count: number = 12) {
  const { data, error, isLoading } = useSWR(
    `featured-media-${count}`,
    () => nasaMediaAPI.getFeaturedImages(count),
    {
      ...defaultSWRConfig,
      refreshInterval: 3600000, // 1 hour
    }
  );

  return {
    media: data || [],
    error,
    isLoading,
  };
}

export function usePopularContent(
  options: {
    mediaType?: 'image' | 'video' | 'audio';
    limit?: number;
  } = {}
) {
  const { mediaType, limit = 20 } = options;

  const cacheKey = `popular-content-${mediaType || 'all'}-${limit}`;

  const { data, error, isLoading } = useSWR(
    cacheKey,
    () => nasaMediaAPI.getPopularContent({ mediaType, limit }),
    {
      ...defaultSWRConfig,
      refreshInterval: 43200000, // 12 hours
    }
  );

  return {
    content: data || [],
    error,
    isLoading,
  };
}

// ================================
// Combined Data Hooks
// ================================

export function useDashboardData() {
  // Fetch multiple data sources for dashboard
  const weather = useMarsWeather();
  const roverPhotos = useFeaturedRoverPhotos(8);
  const earthImages = useEarthImages({ refreshInterval: 7200000 }); // 2 hours
  const featuredMedia = useFeaturedMedia(6);

  const isLoading =
    weather.isLoading || roverPhotos.isLoading || earthImages.isLoading || featuredMedia.isLoading;

  const hasError = weather.error || roverPhotos.error || earthImages.error || featuredMedia.error;

  return {
    data: {
      weather: weather.weatherData,
      roverPhotos: roverPhotos.photos,
      earthImages: earthImages.images,
      featuredMedia: featuredMedia.media,
    },
    isLoading,
    hasError,
    refresh: () => {
      weather.refresh();
      roverPhotos.refresh();
      earthImages.refresh();
    },
  };
}

// ================================
// Infinite Loading Hook
// ================================

export function useInfiniteMediaSearch(searchOptions: MediaSearchOptions) {
  const [allItems, setAllItems] = useState<ProcessedMediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const cacheKey = `infinite-media-${JSON.stringify({ ...searchOptions, page })}`;

  const { data, error, isLoading } = useSWR(
    searchOptions.q ? cacheKey : null,
    () => nasaMediaAPI.searchMedia({ ...searchOptions, page }),
    defaultSWRConfig
  );

  useEffect(() => {
    if (data) {
      if (page === 1) {
        setAllItems(data.items);
      } else {
        setAllItems((prev) => [...prev, ...data.items]);
      }
      setHasMore(data.hasMore);
      setIsLoadingMore(false);
    }
  }, [data, page]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  }, [isLoadingMore, hasMore, isLoading]);

  const reset = useCallback(() => {
    setPage(1);
    setAllItems([]);
    setHasMore(true);
    setIsLoadingMore(false);
  }, []);

  return {
    items: allItems,
    error,
    isLoading: isLoading && page === 1,
    isLoadingMore,
    hasMore,
    loadMore,
    reset,
  };
}

// ================================
// Cache Management Utilities
// ================================

export const cacheUtils = {
  // Clear all NASA API cache
  clearAll: () => {
    mutate(() => true, undefined, { revalidate: false });
  },

  // Clear specific cache by pattern
  clearByPattern: (pattern: string) => {
    mutate((key) => typeof key === 'string' && key.includes(pattern), undefined, {
      revalidate: false,
    });
  },

  // Preload data
  preloadWeatherData: () => {
    mutate(
      'mars-weather-latest',
      marsWeatherAPI.getLatestWeather().then((data) => marsWeatherAPI.processWeatherData(data))
    );
  },

  preloadRoverPhotos: (rover: RoverName) => {
    mutate(
      `rover-photos-${rover}-latest-all`,
      marsRoverAPI
        .getLatestPhotos(rover, 20)
        .then((photos) => marsRoverAPI.processRoverPhotos(photos))
    );
  },

  preloadEarthImages: () => {
    mutate(
      'earth-images-natural-latest',
      epicEarthAPI
        .getLatestImages('natural')
        .then((images) => epicEarthAPI.processEPICImages(images, 'natural'))
    );
  },
};

// ================================
// Service Status Hook
// ================================

export function useServiceStatus() {
  const { data, error, isLoading } = useSWR(
    'service-status',
    async () => {
      const [marsWeather, roverService, epicService, mediaService] = await Promise.allSettled([
        marsWeatherAPI.isServiceAvailable(),
        marsRoverAPI.checkRoverServiceStatus(),
        epicEarthAPI.isServiceAvailable(),
        nasaMediaAPI.isServiceAvailable(),
      ]);

      return {
        marsWeather: marsWeather.status === 'fulfilled' ? marsWeather.value : false,
        rovers: roverService.status === 'fulfilled' ? roverService.value : {},
        earth:
          epicService.status === 'fulfilled'
            ? epicService.value
            : { available: false, collections: { natural: false, enhanced: false } },
        media: mediaService.status === 'fulfilled' ? mediaService.value : false,
      };
    },
    {
      ...defaultSWRConfig,
      refreshInterval: 300000, // 5 minutes
    }
  );

  return {
    status: data,
    error,
    isLoading,
  };
}
