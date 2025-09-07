/**
 * React hooks for spacecraft tracking using our API routes
 */

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface SpacecraftData {
  id: string;
  name: string;
  timestamp: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  velocity: {
    vx: number;
    vy: number;
    vz: number;
  };
  distanceFromEarth: number;
  distanceFromSun: number;
  lightTimeFromEarth: number;
  communicationDelay: {
    oneWay: number;
    roundTrip: number;
    formatted: {
      oneWay: string;
      roundTrip: string;
    };
  };
}

/**
 * Hook to get all spacecraft positions
 */
export function useSpacecraft() {
  const { data, error, isLoading, mutate } = useSWR('/api/spacecraft', fetcher, {
    refreshInterval: 3600000, // Refresh every hour
    revalidateOnFocus: false,
  });

  return {
    spacecraft: (data?.spacecraft as SpacecraftData[]) || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * Hook to get a specific spacecraft position
 */
export function useSpacecraftById(id: string) {
  const { data, error, isLoading, mutate } = useSWR(id ? `/api/spacecraft/${id}` : null, fetcher, {
    refreshInterval: 3600000, // Refresh every hour
    revalidateOnFocus: false,
  });

  return {
    spacecraft: data as SpacecraftData,
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * Hook to get formatted communication delays
 */
export function useSpacecraftDelays() {
  const { spacecraft, isLoading, error } = useSpacecraft();

  const delays = spacecraft.map((sc) => ({
    id: sc.id,
    name: sc.name,
    oneWay: sc.communicationDelay.formatted.oneWay,
    roundTrip: sc.communicationDelay.formatted.roundTrip,
    distanceKm: sc.distanceFromEarth,
    distanceAU: (sc.distanceFromEarth / 149597870.7).toFixed(2),
  }));

  return {
    delays,
    isLoading,
    error,
  };
}
