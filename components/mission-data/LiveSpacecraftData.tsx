'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SpacecraftData {
  distance: {
    km: number;
    au: number;
    lightTime: string;
  };
  velocity: {
    kms: number;
  };
  communicationDelay: {
    oneWay: string;
    roundTrip: string;
  };
  dataSource: string;
  timestamp: string;
}

interface LiveSpacecraftDataProps {
  spacecraftId: string;
  showVelocity?: boolean;
  showCommunicationDelay?: boolean;
  className?: string;
}

export function LiveSpacecraftData({
  spacecraftId,
  showVelocity = true,
  showCommunicationDelay = true,
  className = '',
}: LiveSpacecraftDataProps) {
  const [data, setData] = useState<SpacecraftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    async function fetchSpacecraftData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/spacecraft/${spacecraftId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch spacecraft data: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success !== false) {
          setData({
            distance: result.distance,
            velocity: result.velocity,
            communicationDelay: result.communicationDelay,
            dataSource: result.dataSource,
            timestamp: result.timestamp,
          });
          setLastUpdate(new Date());
        } else {
          throw new Error(result.message || 'Failed to load spacecraft data');
        }
      } catch (err) {
        console.error('Error fetching spacecraft data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchSpacecraftData();

    // Refresh every 5 minutes
    const interval = setInterval(fetchSpacecraftData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [spacecraftId]);

  if (loading) {
    return (
      <div className={`rounded-lg p-6 bg-gray-900 border border-gray-700 ${className}`}>
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-32"></div>
          <div className="h-8 bg-gray-700 rounded w-48"></div>
          <div className="h-4 bg-gray-700 rounded w-32"></div>
          <div className="h-8 bg-gray-700 rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`rounded-lg p-6 bg-red-900/10 border border-red-500/30 ${className}`}>
        <p className="text-red-400 text-sm">
          Unable to load live data. {error || 'Please try again later.'}
        </p>
      </div>
    );
  }

  const formatDistance = () => {
    if (data.distance.au >= 1) {
      return `${data.distance.au.toFixed(2)} AU`;
    } else {
      return `${(data.distance.km / 1000000).toFixed(2)} million km`;
    }
  };

  const isHorizonsData = data.dataSource.includes('Horizons');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg p-6 bg-gradient-to-br from-purple-900/20 via-gray-900 to-blue-900/20 border ${
        isHorizonsData ? 'border-purple-500/30' : 'border-gray-700'
      } ${className}`}
    >
      <div className="space-y-4">
        {/* Distance */}
        <div>
          <p className="text-sm text-gray-400 mb-1">Distance from Earth</p>
          <p className="text-3xl font-mono font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {formatDistance()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.distance.km.toLocaleString()} km
          </p>
        </div>

        {/* Velocity */}
        {showVelocity && (
          <div>
            <p className="text-sm text-gray-400 mb-1">Current Velocity</p>
            <p className="text-xl font-mono font-semibold text-blue-400">
              {data.velocity.kms.toFixed(2)} km/s
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {(data.velocity.kms * 3600).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}{' '}
              km/h
            </p>
          </div>
        )}

        {/* Communication Delay */}
        {showCommunicationDelay && (
          <div>
            <p className="text-sm text-gray-400 mb-1">Signal Travel Time</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <p className="text-lg font-mono text-yellow-400">
                One-way: {data.communicationDelay.oneWay}
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Round-trip: {data.communicationDelay.roundTrip}
            </p>
          </div>
        )}

        {/* Data Source */}
        <div className="pt-3 border-t border-gray-700/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {isHorizonsData ? (
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                  NASA JPL Horizons (Real-time)
                </span>
              ) : (
                data.dataSource
              )}
            </span>
            <span className="text-gray-600">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
