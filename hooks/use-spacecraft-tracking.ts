/**
 * React hooks for spacecraft tracking using JPL Horizons data
 */

import useSWR from 'swr';
import { jplHorizons, SpacecraftPosition, SPACECRAFT_IDS } from '@/lib/api/jpl-horizons';

/**
 * Hook to get position data for a specific spacecraft
 */
export function useSpacecraftPosition(
  spacecraft: keyof typeof SPACECRAFT_IDS,
  options?: {
    refreshInterval?: number;
  }
) {
  const { data, error, isLoading, mutate } = useSWR(
    `spacecraft-position-${spacecraft}`,
    () => jplHorizons.getSpacecraftPosition(spacecraft),
    {
      refreshInterval: options?.refreshInterval || 3600000, // 1 hour default
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    position: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * Hook to get positions for all tracked spacecraft
 */
export function useAllSpacecraftPositions(options?: { refreshInterval?: number }) {
  const { data, error, isLoading, mutate } = useSWR(
    'all-spacecraft-positions',
    () => jplHorizons.getAllSpacecraftPositions(),
    {
      refreshInterval: options?.refreshInterval || 3600000, // 1 hour default
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    positions: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * Hook to calculate and format communication delays
 */
export function useCommunicationDelays() {
  const { positions, isLoading, error } = useAllSpacecraftPositions();

  const delays = positions.map((spacecraft) => ({
    id: spacecraft.id,
    name: spacecraft.name,
    oneWay: jplHorizons.formatCommunicationDelay(spacecraft.communicationDelay.oneWay),
    roundTrip: jplHorizons.formatCommunicationDelay(spacecraft.communicationDelay.roundTrip),
    rawSeconds: spacecraft.communicationDelay.oneWay,
  }));

  // Sort by distance (communication delay)
  delays.sort((a, b) => a.rawSeconds - b.rawSeconds);

  return {
    delays,
    isLoading,
    error,
  };
}

/**
 * Hook for mission statistics
 */
export function useMissionStatistics() {
  const { positions, isLoading } = useAllSpacecraftPositions();

  if (isLoading || !positions.length) {
    return {
      stats: null,
      isLoading,
    };
  }

  // Find the furthest spacecraft
  const furthest = positions.reduce((max, current) =>
    current.distanceFromEarth > max.distanceFromEarth ? current : max
  );

  // Find the fastest spacecraft
  const fastest = positions.reduce((max, current) => {
    const currentSpeed = Math.sqrt(
      current.velocity.vx ** 2 + current.velocity.vy ** 2 + current.velocity.vz ** 2
    );
    const maxSpeed = Math.sqrt(max.velocity.vx ** 2 + max.velocity.vy ** 2 + max.velocity.vz ** 2);
    return currentSpeed > maxSpeed ? current : max;
  });

  return {
    stats: {
      totalSpacecraft: positions.length,
      furthest: {
        name: furthest.name,
        distance: (furthest.distanceFromEarth / 1e9).toFixed(2) + ' billion km',
        communicationDelay: jplHorizons.formatCommunicationDelay(
          furthest.communicationDelay.roundTrip
        ),
      },
      fastest: {
        name: fastest.name,
        speed:
          Math.sqrt(
            fastest.velocity.vx ** 2 + fastest.velocity.vy ** 2 + fastest.velocity.vz ** 2
          ).toFixed(2) + ' km/s',
      },
    },
    isLoading: false,
  };
}
