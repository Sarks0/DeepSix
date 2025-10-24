'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface NHATSObject {
  designation: string;
  fullName: string;
  minDeltaV?: number;
  minDuration?: number;
  absoluteMagnitude?: number;
  minSize?: number;
  maxSize?: number;
  opportunities?: number;
  accessibilityRating: string;
  diameterRange: string;
  durationDescription: string;
}

interface NHATSData {
  success: boolean;
  dataSource: string;
  timestamp: string;
  totalObjects: number;
  objects: NHATSObject[];
  summary: {
    total: number;
    excellent: number;
    good: number;
    moderate: number;
    mostAccessible: string;
    lowestDeltaV: number;
  };
}

export function NHATSList() {
  const [data, setData] = useState<NHATSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNHATSData() {
      try {
        const response = await fetch('/api/asteroids/nhats');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch NHATS data');
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchNHATSData();
    // Refresh every 12 hours
    const interval = setInterval(fetchNHATSData, 12 * 60 * 60 * 1000);
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
        <h3 className="text-xl font-bold text-red-400 mb-2">Unable to Load Mission-Accessible Asteroids</h3>
        <p className="text-gray-400">{error || 'Data temporarily unavailable'}</p>
      </div>
    );
  }

  const getAccessibilityColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'Good': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Challenging': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Mission-Accessible Asteroids</h2>
        <p className="text-gray-400 text-sm mb-2">
          {data.totalObjects} asteroids that humans could visit with current or near-future technology
        </p>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800/50 border border-gray-700/50 text-gray-300">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></span>
          {data.dataSource}
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <p className="text-gray-400 text-xs mb-1">Excellent</p>
          <p className="text-xl font-bold text-green-400">{data.summary.excellent}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <p className="text-gray-400 text-xs mb-1">Good</p>
          <p className="text-xl font-bold text-blue-400">{data.summary.good}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <p className="text-gray-400 text-xs mb-1">Moderate</p>
          <p className="text-xl font-bold text-yellow-400">{data.summary.moderate}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <p className="text-gray-400 text-xs mb-1">Lowest Δv</p>
          <p className="text-xl font-bold text-cyan-400">{data.summary.lowestDeltaV.toFixed(2)} km/s</p>
        </div>
      </div>

      {/* Asteroid Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {data.objects.slice(0, 9).map((obj, index) => (
          <motion.div
            key={obj.designation}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-cyan-500/50 transition-all"
          >
            {/* Asteroid Name */}
            <Link
              href={`/asteroids/${encodeURIComponent(obj.designation)}`}
              className="block mb-2"
            >
              <h3 className="text-lg font-bold text-white hover:text-cyan-400 transition-colors truncate" title={obj.fullName}>
                {obj.fullName}
              </h3>
            </Link>

            {/* Accessibility Rating Badge */}
            <div className="mb-3">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getAccessibilityColor(obj.accessibilityRating)}`}>
                {obj.accessibilityRating}
              </span>
            </div>

            {/* Mission Parameters */}
            <div className="space-y-2 text-sm">
              {obj.minDeltaV && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Delta-V:</span>
                  <span className="text-cyan-400 font-semibold">{obj.minDeltaV.toFixed(2)} km/s</span>
                </div>
              )}
              {obj.minDuration && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-blue-400 font-semibold">{obj.minDuration} days</span>
                </div>
              )}
              {obj.diameterRange !== 'Unknown' && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Size:</span>
                  <span className="text-purple-400 font-semibold">{obj.diameterRange}</span>
                </div>
              )}
              {obj.opportunities && obj.opportunities > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Opportunities:</span>
                  <span className="text-green-400 font-semibold">{obj.opportunities}</span>
                </div>
              )}
            </div>

            {/* Mission Type */}
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <span className="text-xs text-gray-500">{obj.durationDescription}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Educational Section */}
      <div className="mt-6 space-y-4">
        <div className="p-4 bg-cyan-900/20 border border-cyan-800/50 rounded-lg">
          <h4 className="text-sm font-bold text-cyan-300 mb-2">Why These Asteroids?</h4>
          <p className="text-sm text-cyan-200/80">
            Delta-V (Δv) measures the fuel needed to reach an asteroid. Lower values mean easier access.
            These asteroids require less than 12 km/s, making them viable targets for human missions with
            current or near-future spacecraft technology.
          </p>
        </div>

        <div className="p-4 bg-purple-900/20 border border-purple-800/50 rounded-lg">
          <h4 className="text-sm font-bold text-purple-300 mb-2">Our Asteroid Missions</h4>
          <p className="text-sm text-purple-200/80 mb-3">
            DeepSix is currently tracking 3 active NASA missions to asteroids:
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/missions/lucy"
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-800/30 border border-purple-700/50 text-purple-300 hover:bg-purple-800/50 transition-colors text-sm font-medium"
            >
              Lucy → Trojan Asteroids
            </Link>
            <Link
              href="/missions/psyche"
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-800/30 border border-purple-700/50 text-purple-300 hover:bg-purple-800/50 transition-colors text-sm font-medium"
            >
              Psyche → Metal Asteroid
            </Link>
            <Link
              href="/missions/osiris-apex"
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-800/30 border border-purple-700/50 text-purple-300 hover:bg-purple-800/50 transition-colors text-sm font-medium"
            >
              OSIRIS-APEX → Apophis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
