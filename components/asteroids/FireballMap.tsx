'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Fireball {
  date: string;
  energy: number;
  impactEnergy: number | null;
  latitude: number;
  longitude: number;
  altitude: number | null;
  velocity: number | null;
  sizeCategory: string;
  energyComparison: string;
  estimatedDiameter: number;
}

interface FireballData {
  success: boolean;
  dataSource: string;
  timestamp: string;
  count: number;
  fireballs: Fireball[];
  summary: {
    total: number;
    totalEnergy: number;
    largestImpact: {
      date: string;
      energy: number;
      location: string;
    } | null;
    large: number;
    medium: number;
    small: number;
  };
}

export function FireballMap() {
  const [data, setData] = useState<FireballData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFireballData() {
      try {
        const response = await fetch('/api/asteroids/fireball?limit=30');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch fireball data');
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchFireballData();
    // Refresh every 24 hours
    const interval = setInterval(fetchFireballData, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-red-800/50 p-6">
        <h3 className="text-xl font-bold text-red-400 mb-2">Unable to Load Fireball Data</h3>
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSizeCategoryColor = (category: string) => {
    switch (category) {
      case 'Large': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'Medium': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'Small': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  const getRegionFromCoords = (lat: number, lon: number): string => {
    // Simple region approximation based on coordinates
    const latAbs = Math.abs(lat);
    const latHemi = lat >= 0 ? 'N' : 'S';
    const lonHemi = lon >= 0 ? 'E' : 'W';

    let region = '';

    // Latitude-based regions
    if (latAbs > 60) region = 'Polar';
    else if (latAbs > 45) region = 'Mid-latitude';
    else if (latAbs > 23.5) region = 'Subtropical';
    else region = 'Tropical';

    // Add ocean/continent hints based on longitude ranges
    const lonAbs = Math.abs(lon);
    let area = '';
    if (lonAbs < 30 && lat > 0) area = 'Europe/Africa';
    else if (lonAbs < 60) area = 'Asia/Middle East';
    else if (lonAbs < 120 && lon > 0) area = 'East Asia/Pacific';
    else if (lonAbs < 180 && lon > 0) area = 'Pacific Ocean';
    else if (lonAbs < 120 && lon < 0) area = 'Americas';
    else area = 'Atlantic/Pacific';

    return `${region} ${latHemi} - ${area}`;
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Recent Fireball Detections</h2>
        <p className="text-gray-400 text-sm mb-2">
          Atmospheric impacts detected by government sensors and satellite lightning mappers
        </p>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800/50 border border-gray-700/50 text-gray-300">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></span>
          {data.dataSource}
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <p className="text-gray-400 text-xs mb-1">Total Detected</p>
          <p className="text-2xl font-bold text-white">{data.count}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <p className="text-gray-400 text-xs mb-1">Total Energy</p>
          <p className="text-2xl font-bold text-orange-400">{data.summary.totalEnergy} kt</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <p className="text-gray-400 text-xs mb-1">Largest</p>
          <p className="text-xl font-bold text-red-400">
            {data.summary.largestImpact?.energy} kt
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <p className="text-gray-400 text-xs mb-1">Large Events</p>
          <p className="text-2xl font-bold text-red-400">{data.summary.large}</p>
        </div>
      </div>

      {/* Fireball Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {data.fireballs.map((fireball, index) => (
          <motion.div
            key={`${fireball.date}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-orange-500/50 transition-all"
          >
            {/* Date and Category Badge */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs text-gray-400">
                  {formatDate(fireball.date)}
                </p>
              </div>
              <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold border ${getSizeCategoryColor(fireball.sizeCategory)}`}>
                {fireball.sizeCategory}
              </span>
            </div>

            {/* Energy */}
            <div className="mb-3">
              <p className="text-2xl font-bold text-orange-400">{fireball.energy} kt</p>
              <p className="text-xs text-gray-500">{fireball.energyComparison}</p>
            </div>

            {/* Location */}
            <div className="mb-2">
              <p className="text-xs text-gray-400">Location</p>
              <p className="text-sm font-semibold text-cyan-400">
                {Math.abs(fireball.latitude).toFixed(1)}°{fireball.latitude >= 0 ? 'N' : 'S'},{' '}
                {Math.abs(fireball.longitude).toFixed(1)}°{fireball.longitude >= 0 ? 'E' : 'W'}
              </p>
              <p className="text-xs text-gray-500">{getRegionFromCoords(fireball.latitude, fireball.longitude)}</p>
            </div>

            {/* Additional Data */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {fireball.altitude && (
                <div>
                  <span className="text-gray-400">Altitude:</span>
                  <span className="text-white font-medium ml-1">{fireball.altitude} km</span>
                </div>
              )}
              {fireball.velocity && (
                <div>
                  <span className="text-gray-400">Velocity:</span>
                  <span className="text-white font-medium ml-1">{fireball.velocity} km/s</span>
                </div>
              )}
              <div className="col-span-2">
                <span className="text-gray-400">Est. Size:</span>
                <span className="text-purple-400 font-medium ml-1">~{fireball.estimatedDiameter}m</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Educational Note */}
      <div className="mt-6 p-4 bg-orange-900/20 border border-orange-800/50 rounded-lg">
        <h4 className="text-sm font-bold text-orange-300 mb-2">What are Fireballs?</h4>
        <p className="text-sm text-orange-200/80 mb-2">
          Fireballs are exceptionally bright meteors - asteroid fragments entering Earth&apos;s atmosphere
          at high speed. Most burn up completely, but larger ones can produce meteorites that reach the ground.
        </p>
        <p className="text-xs text-orange-300/70">
          <strong>Energy Reference:</strong> 1 kiloton (kt) = 1,000 tons of TNT. The Hiroshima bomb was ~15 kt.
          The Chelyabinsk meteor (2013) released ~500 kt of energy.
        </p>
      </div>
    </div>
  );
}
