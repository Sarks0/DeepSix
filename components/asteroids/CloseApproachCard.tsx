'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Asteroid {
  id: string;
  name: string;
  absoluteMagnitude: number;
  diameterKm: {
    min: number;
    max: number;
    avg: number;
  };
  diameterMeters: {
    min: number;
    max: number;
    avg: number;
  };
  isPotentiallyHazardous: boolean;
  closeApproachDate: string;
  closeApproachDateFull: string;
  relativeVelocity: {
    kmPerSecond: number;
    kmPerHour: number;
  };
  missDistance: {
    astronomical: number;
    lunar: number;
    kilometers: number;
  };
  sizeCategory: string;
  hazardLevel: string;
  hazardColor: string;
}

interface NeoWsData {
  success: boolean;
  dataSource: string;
  timestamp: string;
  totalCount: number;
  asteroids: Asteroid[];
  summary: {
    total: number;
    potentiallyHazardous: number;
    safe: number;
    closestApproach: Asteroid | null;
    largestDiameter: number;
  };
}

export function CloseApproachFeed() {
  const [data, setData] = useState<NeoWsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNeoWsData() {
      try {
        const response = await fetch('/api/asteroids/neows');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch close approach data');
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchNeoWsData();
    // Refresh every 4 hours
    const interval = setInterval(fetchNeoWsData, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-red-800/50 p-6">
        <h3 className="text-xl font-bold text-red-400 mb-2">Unable to Load Close Approach Data</h3>
        <p className="text-gray-400">{error || 'Data temporarily unavailable'}</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSizeColor = (category: string) => {
    switch (category) {
      case 'Very Large': return 'text-red-400';
      case 'Large': return 'text-orange-400';
      case 'Medium': return 'text-yellow-400';
      case 'Small': return 'text-blue-400';
      case 'Very Small': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Close Approaches This Week</h2>
        <p className="text-gray-400 text-sm mb-2">
          {data.totalCount} asteroids passing near Earth in the next 7 days
        </p>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800/50 border border-gray-700/50 text-gray-300">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></span>
          {data.dataSource}
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <p className="text-gray-400 text-xs mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{data.totalCount}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <p className="text-gray-400 text-xs mb-1">Hazardous</p>
          <p className="text-2xl font-bold text-orange-400">{data.summary.potentiallyHazardous}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <p className="text-gray-400 text-xs mb-1">Safe</p>
          <p className="text-2xl font-bold text-green-400">{data.summary.safe}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <p className="text-gray-400 text-xs mb-1">Largest</p>
          <p className="text-2xl font-bold text-purple-400">{Math.round(data.summary.largestDiameter)}m</p>
        </div>
      </div>

      {/* Asteroid Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.asteroids.slice(0, 12).map((asteroid, index) => (
          <motion.div
            key={asteroid.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-lg p-4 border-2 transition-all hover:shadow-lg ${
              asteroid.isPotentiallyHazardous
                ? 'bg-orange-900/20 border-orange-700/50 hover:border-orange-500'
                : 'bg-gray-800/50 border-gray-700/50 hover:border-cyan-500'
            }`}
          >
            {/* Header with Hazard Badge */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-bold text-white truncate pr-2" title={asteroid.name}>
                {asteroid.name}
              </h3>
              {asteroid.isPotentiallyHazardous && (
                <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/50">
                  PHA
                </span>
              )}
            </div>

            {/* Approach Date */}
            <div className="mb-3">
              <p className="text-xs text-gray-400">Close Approach</p>
              <p className="text-lg font-bold text-cyan-400">{formatDate(asteroid.closeApproachDate)}</p>
            </div>

            {/* Size */}
            <div className="mb-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Size:</span>
                <span className={`font-semibold ${getSizeColor(asteroid.sizeCategory)}`}>
                  {asteroid.sizeCategory}
                </span>
              </div>
              <p className="text-xs text-gray-500 text-right">
                {asteroid.diameterMeters.min}-{asteroid.diameterMeters.max}m
              </p>
            </div>

            {/* Miss Distance */}
            <div className="mb-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Miss Distance:</span>
                <span className="font-semibold text-blue-400">
                  {asteroid.missDistance.lunar.toFixed(2)} LD
                </span>
              </div>
              <p className="text-xs text-gray-500 text-right">
                {(asteroid.missDistance.kilometers / 1000000).toFixed(2)}M km
              </p>
            </div>

            {/* Velocity */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Velocity:</span>
                <span className="font-semibold text-purple-400">
                  {asteroid.relativeVelocity.kmPerSecond.toFixed(2)} km/s
                </span>
              </div>
              <p className="text-xs text-gray-500 text-right">
                {(asteroid.relativeVelocity.kmPerHour / 1000).toFixed(0)}K km/h
              </p>
            </div>

            {/* Status Footer */}
            <div className="pt-3 border-t border-gray-700/50">
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                asteroid.isPotentiallyHazardous
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {asteroid.hazardLevel}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {data.asteroids.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No close approaches in the next 7 days</p>
          <p className="text-sm mt-2">Check back later for updates</p>
        </div>
      )}

      {/* Educational Note */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>Note:</strong> LD = Lunar Distance (distance from Earth to Moon, ~384,400 km).
          PHA = Potentially Hazardous Asteroid (large objects that come within 0.05 AU of Earth).
          All distances are safe - NASA tracks these for scientific monitoring and planetary defense planning.
        </p>
      </div>
    </div>
  );
}
