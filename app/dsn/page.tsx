'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dsnService, type DSNData } from '@/lib/api/dsn';
import { SignalVisualizer } from '@/components/dsn/SignalVisualizer';
import { MissionControlDashboard } from '@/components/dsn/MissionControlDashboard';
import { StationList } from '@/components/dsn/StationList';

export default function DeepSpaceNetworkPage() {
  const [dsnData, setDsnData] = useState<DSNData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'standard' | 'mission-control'>('standard');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dsnService.fetchDSNStatus();
        setDsnData(data);
        setLastUpdate(new Date());
        setError(null);
      } catch (err) {
        setError('Failed to fetch DSN data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling every 10 seconds
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-pulse mb-4">
              <div className="w-16 h-16 mx-auto bg-blue-500 rounded-full animate-ping"></div>
            </div>
            <p className="text-gray-400">Connecting to Deep Space Network...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dsnData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-400">
          <p>{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  const activeSpacecraft = dsnService.getActiveSpacecraft(dsnData);

  // Mission Control Mode
  if (viewMode === 'mission-control') {
    return (
      <MissionControlDashboard
        dsnData={dsnData}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
    );
  }

  // Standard View
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Deep Space Network
            </h1>
            <p className="text-gray-400">
              Real-time communication status with spacecraft across the solar system
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastUpdate.toLocaleTimeString()} • Updates every 10 seconds
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('mission-control')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Mission Control Mode
            </button>
          </div>
        </div>
      </motion.div>

      {/* Station List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">Global Station Network</h2>
        <StationList stations={dsnData.stations} />
      </motion.div>

      {/* Active Communications Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Active Stations</p>
          <p className="text-3xl font-bold text-blue-400">{dsnData.stations.length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Spacecraft in Contact</p>
          <p className="text-3xl font-bold text-green-400">{activeSpacecraft.length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Total Antennas</p>
          <p className="text-3xl font-bold text-purple-400">
            {dsnData.stations.reduce((acc, s) => acc + s.dishes.length, 0)}
          </p>
        </div>
      </motion.div>

      {/* Signal Visualizers for Active Communications */}
      {activeSpacecraft.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Live Signal Visualization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSpacecraft.slice(0, 4).map((sc, idx) => {
              const dish = dsnData.stations
                .flatMap(s => s.dishes)
                .find(d => d.targets.some(t => t.spacecraft?.includes(sc.spacecraft)));
              
              const target = dish?.targets.find(t => t.spacecraft?.includes(sc.spacecraft));
              
              if (!target) return null;

              return (
                <SignalVisualizer
                  key={`${sc.spacecraft}-${idx}`}
                  dataRate={target.downSignal?.dataRate || target.upSignal?.dataRate || 0}
                  frequency={target.downSignal?.frequency || target.upSignal?.frequency || 0}
                  power={target.downSignal?.power || target.upSignal?.power || 0}
                  signalType={target.downSignal ? 'downlink' : 'uplink'}
                  spacecraftName={dsnService.formatSpacecraftName(sc.spacecraft)}
                  isActive={true}
                />
              );
            })}
          </div>
        </motion.div>
      )}


    </div>
  );
}

// Helper functions
function getTimeZone(stationName: string): string {
  const timeZones: Record<string, string> = {
    'gdscc': 'America/Los_Angeles',  // Goldstone, California
    'mdscc': 'Europe/Madrid',         // Madrid, Spain
    'cdscc': 'Australia/Sydney'       // Canberra, Australia
  };
  return timeZones[stationName] || 'UTC';
}

function formatDataRate(rate: number): string {
  if (rate === 0) return '0 b/s';
  if (rate < 1000) return `${rate} b/s`;
  if (rate < 1000000) return `${(rate / 1000).toFixed(1)} kb/s`;
  if (rate < 1000000000) return `${(rate / 1000000).toFixed(1)} Mb/s`;
  return `${(rate / 1000000000).toFixed(1)} Gb/s`;
}