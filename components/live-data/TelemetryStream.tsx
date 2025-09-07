'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TelemetryData {
  timestamp: string;
  type: string;
  value: string | number;
  unit?: string;
  status?: 'normal' | 'warning' | 'critical';
}

export function TelemetryStream({ missionId }: { missionId: string }) {
  const [dataStream, setDataStream] = useState<TelemetryData[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate real-time telemetry data
    const interval = setInterval(
      () => {
        const newData: TelemetryData = generateTelemetryData(missionId);
        setDataStream((prev) => [newData, ...prev].slice(0, 50)); // Keep last 50 entries
        setIsConnected(true);
      },
      Math.random() * 2000 + 1000
    ); // Random interval between 1-3 seconds

    return () => clearInterval(interval);
  }, [missionId]);

  function generateTelemetryData(mission: string): TelemetryData {
    const timestamp = new Date().toISOString();
    const telemetryTypes = {
      perseverance: [
        {
          type: 'TEMP_CPU',
          value: (20 + Math.random() * 10).toFixed(1),
          unit: '°C',
          status: 'normal',
        },
        {
          type: 'PWR_SOLAR',
          value: (450 + Math.random() * 50).toFixed(0),
          unit: 'W',
          status: 'normal',
        },
        {
          type: 'BATT_LEVEL',
          value: (75 + Math.random() * 20).toFixed(0),
          unit: '%',
          status: Math.random() > 0.8 ? 'warning' : 'normal',
        },
        {
          type: 'WHEEL_RPM',
          value: (Math.random() * 10).toFixed(2),
          unit: 'rpm',
          status: 'normal',
        },
        {
          type: 'SIGNAL_STR',
          value: (-80 + Math.random() * 20).toFixed(0),
          unit: 'dBm',
          status: 'normal',
        },
        {
          type: 'MEM_USAGE',
          value: (60 + Math.random() * 30).toFixed(0),
          unit: '%',
          status: Math.random() > 0.9 ? 'critical' : 'normal',
        },
      ],
      voyager: [
        {
          type: 'RTG_PWR',
          value: (240 + Math.random() * 10).toFixed(1),
          unit: 'W',
          status: 'normal',
        },
        {
          type: 'DIST_EARTH',
          value: (23.5 + Math.random() * 0.01).toFixed(3),
          unit: 'B km',
          status: 'normal',
        },
        { type: 'DATA_RATE', value: (160).toFixed(0), unit: 'bps', status: 'normal' },
        {
          type: 'PLASMA_DENS',
          value: (Math.random() * 0.01).toFixed(4),
          unit: 'cm⁻³',
          status: 'normal',
        },
        {
          type: 'MAG_FIELD',
          value: (Math.random() * 0.5).toFixed(3),
          unit: 'nT',
          status: 'normal',
        },
      ],
      parker: [
        {
          type: 'HEAT_SHIELD',
          value: (1300 + Math.random() * 100).toFixed(0),
          unit: '°C',
          status: Math.random() > 0.7 ? 'warning' : 'normal',
        },
        {
          type: 'VELOCITY',
          value: (430 + Math.random() * 20).toFixed(0),
          unit: 'km/s',
          status: 'normal',
        },
        { type: 'DIST_SUN', value: (8.5 + Math.random()).toFixed(2), unit: 'R☉', status: 'normal' },
        {
          type: 'SOLAR_WIND',
          value: (300 + Math.random() * 100).toFixed(0),
          unit: 'km/s',
          status: 'normal',
        },
        {
          type: 'PARTICLE_CNT',
          value: (Math.random() * 1000000).toFixed(0),
          unit: 'p/s',
          status: 'normal',
        },
      ],
    };

    const missionKey = mission.toLowerCase().includes('voyager')
      ? 'voyager'
      : mission.toLowerCase().includes('parker')
        ? 'parker'
        : 'perseverance';
    const types = telemetryTypes[missionKey] || telemetryTypes['perseverance'];
    const telemetry = types[Math.floor(Math.random() * types.length)];

    return {
      timestamp,
      ...telemetry,
      status: telemetry.status as 'normal' | 'warning' | 'critical',
    };
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-400 border-red-500/30';
      case 'warning':
        return 'text-yellow-400 border-yellow-500/30';
      default:
        return 'text-green-400 border-green-500/30';
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Telemetry Stream</h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}
          />
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="space-y-1 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {dataStream.map((data, index) => (
          <motion.div
            key={`${data.timestamp}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center gap-3 p-2 rounded border ${getStatusColor(data.status)} bg-gray-900/30 font-mono text-xs`}
          >
            <span className="text-gray-500 w-20">
              {new Date(data.timestamp).toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
            <span className="text-blue-400 w-24">{data.type}</span>
            <span className="flex-1 text-right">
              {data.value} {data.unit && <span className="text-gray-500">{data.unit}</span>}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
