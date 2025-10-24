'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SentryObject {
  designation: string;
  fullName: string;
  impactProbability: number;
  palermoScale: number;
  torinoScale: number;
  lastObservation: string;
  numberOfImpacts: number;
  absoluteMagnitude?: number;
  impactOdds: string;
  hazardLevel: string;
  hazardColor: string;
}

interface SentryData {
  success: boolean;
  dataSource: string;
  timestamp: string;
  totalObjects: number;
  objects: SentryObject[];
  summary: {
    total: number;
    torinoGreaterThanZero: number;
    highestProbability: string;
    highestProbabilityValue: number;
  };
}

export function SentryMonitor() {
  const [data, setData] = useState<SentryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'torino'>('all');

  useEffect(() => {
    async function fetchSentryData() {
      try {
        const response = await fetch('/api/asteroids/sentry');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch Sentry data');
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchSentryData();
    // Refresh every hour
    const interval = setInterval(fetchSentryData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-red-800/50 p-6">
        <h3 className="text-xl font-bold text-red-400 mb-2">Unable to Load Impact Monitoring Data</h3>
        <p className="text-gray-400">{error || 'Data temporarily unavailable'}</p>
      </div>
    );
  }

  const filteredObjects = filter === 'torino'
    ? data.objects.filter(obj => obj.torinoScale > 0)
    : data.objects.slice(0, 20); // Show top 20

  const getHazardBadgeColor = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'orange': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'yellow': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'green': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Sentry Impact Monitoring</h2>
          <p className="text-gray-400 text-sm">
            Tracking {data.totalObjects.toLocaleString()} asteroids for potential Earth impacts over the next 100 years
          </p>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800/50 border border-gray-700/50 text-gray-300 mt-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            {data.dataSource}
          </span>
        </div>

        {/* Filter Toggle */}
        <div className="mt-4 md:mt-0 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Top 20
          </button>
          <button
            onClick={() => setFilter('torino')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'torino'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Torino &gt; 0 ({data.summary.torinoGreaterThanZero})
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <p className="text-gray-400 text-sm mb-1">Total Objects Monitored</p>
          <p className="text-2xl font-bold text-white">{data.totalObjects.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <p className="text-gray-400 text-sm mb-1">Highest Probability</p>
          <p className="text-xl font-bold text-orange-400 truncate">{data.summary.highestProbability}</p>
          <p className="text-sm text-gray-500">
            {data.summary.highestProbabilityValue > 0
              ? `1 in ${Math.round(1 / data.summary.highestProbabilityValue).toLocaleString()}`
              : 'Minimal'}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <p className="text-gray-400 text-sm mb-1">Torino Scale &gt; 0</p>
          <p className="text-2xl font-bold text-yellow-400">{data.summary.torinoGreaterThanZero}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Asteroid</th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Impact Probability</th>
              <th className="text-center py-3 px-4 text-gray-400 font-semibold text-sm">Torino Scale</th>
              <th className="text-center py-3 px-4 text-gray-400 font-semibold text-sm">Palermo Scale</th>
              <th className="text-center py-3 px-4 text-gray-400 font-semibold text-sm">Hazard Level</th>
            </tr>
          </thead>
          <tbody>
            {filteredObjects.map((obj, index) => (
              <motion.tr
                key={obj.designation}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
              >
                <td className="py-4 px-4">
                  <p className="font-semibold text-white">{obj.fullName}</p>
                  <p className="text-xs text-gray-500">Last obs: {obj.lastObservation}</p>
                </td>
                <td className="py-4 px-4">
                  <p className="font-medium text-orange-400">{obj.impactOdds}</p>
                  <p className="text-xs text-gray-500">{obj.numberOfImpacts} scenarios</p>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                    obj.torinoScale === 0 ? 'bg-gray-700 text-gray-300' :
                    obj.torinoScale === 1 ? 'bg-green-500/20 text-green-400' :
                    obj.torinoScale <= 4 ? 'bg-yellow-500/20 text-yellow-400' :
                    obj.torinoScale <= 7 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {obj.torinoScale}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-white font-medium">{obj.palermoScale.toFixed(2)}</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getHazardBadgeColor(obj.hazardColor)}`}>
                    {obj.hazardLevel}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredObjects.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No asteroids match the current filter.</p>
          <p className="text-sm mt-2">All monitored objects currently have Torino Scale 0 (No Hazard).</p>
        </div>
      )}

      {/* Educational Note */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>Note:</strong> The Torino Scale (0-10) communicates impact hazard to the public.
          0 = No Hazard, 1-4 = Meriting Attention, 5-7 = Threatening, 8-10 = Certain Collision.
          Most objects are rated 0 as observations refine their orbits.
        </p>
      </div>
    </div>
  );
}
