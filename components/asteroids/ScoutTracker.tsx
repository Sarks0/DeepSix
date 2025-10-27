'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ScoutObject {
  designation: string;
  fullName: string;
  numberOfObservations: number;
  arcHours: number;
  arcDays: string;
  absoluteMagnitude: number | null;
  neoRating: number;
  uncertainty: string;
  uncertaintyDescription: string;
  impactSolutions: number;
  impactProbability: number;
  impactOdds: string;
  palermoCumulative: number | null;
  palermoMax: number | null;
  lastRun: string;
  closeApproachDistance: number | null;
  velocity: number | null;
  status: string;
  statusColor: string;
  isRecent: boolean;
  hasImpactRisk: boolean;
}

interface ScoutData {
  success: boolean;
  dataSource: string;
  timestamp: string;
  count: number;
  objects: ScoutObject[];
  summary: {
    total: number;
    withImpactSolutions: number;
    highPriority: number;
    recentlyAdded: number;
  };
}

export function ScoutTracker() {
  const [data, setData] = useState<ScoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScoutData() {
      try {
        const response = await fetch('/api/asteroids/scout');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch Scout data');
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchScoutData();
    // Refresh every 30 minutes (Scout data updates frequently)
    const interval = setInterval(fetchScoutData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
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
        <h3 className="text-xl font-bold text-red-400 mb-2">Unable to Load Scout Data</h3>
        <p className="text-gray-400">{error || 'Data temporarily unavailable'}</p>
      </div>
    );
  }

  const getStatusBadgeColor = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'orange': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'yellow': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 7) return 'text-red-400';
    if (rating >= 4) return 'text-orange-400';
    return 'text-cyan-400';
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Scout: Newly Discovered Objects</h2>
        <p className="text-gray-400 text-sm mb-2">
          Real-time tracking of newly discovered near-Earth asteroids, often detected just hours or days ago
        </p>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800/50 border border-gray-700/50 text-gray-300">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></span>
          {data.dataSource}
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <p className="text-gray-400 text-xs mb-1">Currently Tracking</p>
          <p className="text-2xl font-bold text-white">{data.count}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <p className="text-gray-400 text-xs mb-1">Recently Added</p>
          <p className="text-2xl font-bold text-cyan-400">{data.summary.recentlyAdded}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <p className="text-gray-400 text-xs mb-1">High Priority</p>
          <p className="text-2xl font-bold text-orange-400">{data.summary.highPriority}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <p className="text-gray-400 text-xs mb-1">Impact Solutions</p>
          <p className="text-2xl font-bold text-red-400">{data.summary.withImpactSolutions}</p>
        </div>
      </div>

      {/* Objects Grid */}
      {data.objects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {data.objects.map((obj, index) => (
            <Link
              key={obj.designation}
              href={`/asteroids/${encodeURIComponent(obj.designation)}`}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-lg p-4 border transition-all cursor-pointer ${
                  obj.hasImpactRisk
                    ? 'bg-orange-900/20 border-orange-700/50 hover:border-orange-500'
                    : 'bg-gray-800/50 border-gray-700/50 hover:border-cyan-500/50'
                }`}
              >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">{obj.fullName}</h3>
                  {obj.isRecent && (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">
                      New Discovery
                    </span>
                  )}
                </div>
                <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(obj.statusColor)}`}>
                  {obj.status}
                </span>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-400">NEO Rating</p>
                  <p className={`text-xl font-bold ${getRatingColor(obj.neoRating)}`}>
                    {obj.neoRating}/10
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Observations</p>
                  <p className="text-xl font-bold text-white">{obj.numberOfObservations}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Observation Arc:</span>
                  <span className="text-white font-medium">{obj.arcDays} days</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Uncertainty:</span>
                  <span className="text-white font-medium">{obj.uncertaintyDescription}</span>
                </div>

                {typeof obj.absoluteMagnitude === 'number' && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Magnitude (H):</span>
                    <span className="text-white font-medium">{obj.absoluteMagnitude.toFixed(1)}</span>
                  </div>
                )}

                {obj.impactSolutions > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Impact Probability:</span>
                    <span className="text-orange-400 font-medium">{obj.impactOdds}</span>
                  </div>
                )}

                {obj.closeApproachDistance && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Close Approach:</span>
                    <span className="text-cyan-400 font-medium">
                      {obj.closeApproachDistance.toFixed(3)} AU
                    </span>
                  </div>
                )}

                {obj.velocity && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Velocity:</span>
                    <span className="text-white font-medium">{obj.velocity.toFixed(2)} km/s</span>
                  </div>
                )}
              </div>
            </motion.div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-800/30 rounded-lg border border-gray-700/50">
          <p className="text-gray-400 mb-2">No objects currently being tracked by Scout</p>
          <p className="text-sm text-gray-500">Scout analyzes newly discovered asteroids as they are detected</p>
        </div>
      )}

      {/* Educational Note */}
      <div className="mt-6 p-4 bg-cyan-900/20 border border-cyan-800/50 rounded-lg">
        <h4 className="text-sm font-bold text-cyan-300 mb-2">What is Scout?</h4>
        <p className="text-sm text-cyan-200/80 mb-2">
          NASA&apos;s Scout system provides near-real-time monitoring of newly discovered asteroids,
          computing possible future trajectories and assessing potential Earth impact risk.
          Scout tracked objects are often just hours or days old, with orbits still being refined.
        </p>
        <p className="text-xs text-cyan-300/70">
          <strong>NEO Rating (1-10):</strong> Higher numbers indicate objects requiring closer monitoring.
          Most objects receive low ratings as additional observations refine their orbits and rule out Earth impacts.
        </p>
      </div>
    </div>
  );
}
