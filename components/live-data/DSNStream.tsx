'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ListSkeleton } from '@/components/ui/loading-skeleton';

interface DSNConnection {
  spacecraft: string;
  station: string;
  dish: string;
  dataRate: number;
  frequency: number;
  power: number;
  signalType: string;
  timestamp: string;
}

interface DSNStreamProps {
  missionFilter?: string;
}

export function DSNStream({ missionFilter }: DSNStreamProps) {
  const [connections, setConnections] = useState<DSNConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDSNData(isRefresh = false) {
      try {
        if (isRefresh) {
          setRefreshing(true);
        }

        // Fetch from NASA DSN Now API
        const response = await fetch('/api/dsn-now');

        if (!response.ok) {
          throw new Error('Failed to fetch DSN data');
        }

        const data = await response.json();

        if (data && data.connections) {
          // Filter connections based on mission if filter is provided
          let filteredConnections = data.connections;

          if (missionFilter) {
            // Map mission IDs to spacecraft names - more flexible matching
            const missionMapping: Record<string, string[]> = {
              perseverance: ['MARS2020', 'M20', 'PERSEVERANCE', 'MARS 2020', 'PERCY'],
              curiosity: ['MSL', 'CURIOSITY', 'MARS SCIENCE', 'MARS_SCIENCE'],
              'voyager-1': ['VOYAGER1', 'VGR1', 'VOYAGER 1', 'VOYAGER_1', 'VGR 1'],
              'voyager-2': ['VOYAGER2', 'VGR2', 'VOYAGER 2', 'VOYAGER_2', 'VGR 2'],
              'parker-solar-probe': ['PSP', 'PARKER', 'PARKER SOLAR', 'SOLAR PROBE', 'SPP'],
            };

            const searchTerms = missionMapping[missionFilter] || [];

            if (searchTerms.length > 0) {
              filteredConnections = data.connections.filter((conn: DSNConnection) => {
                const spacecraftUpper = conn.spacecraft.toUpperCase().replace(/[-_]/g, ' ');
                return searchTerms.some((term) => spacecraftUpper.includes(term));
              });

              // Debug logging
              console.log(`DSN Filter: ${missionFilter}`);
              console.log(
                'Available spacecraft:',
                data.connections.map((c: DSNConnection) => c.spacecraft)
              );
              console.log('Filtered connections:', filteredConnections.length);
            }
          }

          setConnections(filteredConnections);
          setError(
            filteredConnections.length === 0 && missionFilter
              ? `No active DSN connections for this mission`
              : null
          );
        } else {
          setError('No active connections');
        }
      } catch (err) {
        console.error('DSN fetch error:', err);
        setError('Unable to connect to Deep Space Network');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }

    fetchDSNData();
    const interval = setInterval(() => fetchDSNData(true), 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [missionFilter]);

  const getSignalStrength = (power: number) => {
    if (power > -100) return 'text-green-400';
    if (power > -120) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatDataRate = (rate: number) => {
    if (rate > 1000000) return `${(rate / 1000000).toFixed(2)} Mbps`;
    if (rate > 1000) return `${(rate / 1000).toFixed(2)} kbps`;
    return `${rate.toFixed(0)} bps`;
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Deep Space Network</h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${loading || refreshing ? 'bg-yellow-400' : error ? 'bg-red-400' : 'bg-green-400'} animate-pulse`}
          />
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            {loading ? 'Connecting' : refreshing ? 'Updating' : error ? 'Error' : 'Live'}
          </span>
        </div>
      </div>

      <div className="space-y-1 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {loading ? (
          <ListSkeleton count={5} shimmer={true} />
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-400 text-sm">{error}</div>
            <div className="text-gray-500 text-xs mt-2">Retrying in 30 seconds...</div>
          </div>
        ) : connections.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">No active spacecraft connections</div>
          </div>
        ) : (
          connections.map((connection, index) => (
            <motion.div
              key={`${connection.spacecraft}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex flex-col gap-1 p-2 rounded border border-gray-800 bg-gray-900/30 font-mono text-xs"
            >
              <div className="flex justify-between items-center">
                <span className="text-blue-400 font-semibold">{connection.spacecraft}</span>
                <span className="text-gray-500">
                  {new Date(connection.timestamp).toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>
                  {connection.station} / {connection.dish}
                </span>
                <span className={getSignalStrength(connection.power)}>
                  {connection.power.toFixed(1)} dBm
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>{connection.signalType}</span>
                <span>{formatDataRate(connection.dataRate)}</span>
              </div>
              <div className="text-gray-500">{connection.frequency.toFixed(2)} MHz</div>
            </motion.div>
          ))
        )}
      </div>

      <div className="text-xs text-gray-500 text-center mt-3">
        Real-time data from NASA Deep Space Network
      </div>
    </div>
  );
}
