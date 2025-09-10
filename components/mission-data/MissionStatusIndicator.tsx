'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClientCache, PerformanceMonitor } from '@/lib/services/mission-data-cache';

interface MissionStatus {
  operational: boolean;
  health: 'excellent' | 'good' | 'nominal' | 'degraded' | 'critical';
  lastContact: Date;
  nextContact: Date;
  dataRate: number; // in bits per second
  signalStrength: number; // percentage
  batteryLevel?: number; // percentage for applicable missions
  fuelRemaining?: number; // percentage for applicable missions
}

interface MissionStatusIndicatorProps {
  missionId: string;
  className?: string;
}

const missionStatusData: Record<string, () => Promise<MissionStatus>> = {
  'perseverance': async () => ({
    operational: true,
    health: Math.random() > 0.9 ? 'good' : 'excellent',
    lastContact: new Date(Date.now() - Math.floor(Math.random() * 3600000)), // Within last hour
    nextContact: new Date(Date.now() + Math.floor(Math.random() * 7200000)), // Next 2 hours
    dataRate: Math.floor(Math.random() * 50000) + 10000,
    signalStrength: Math.floor(Math.random() * 15) + 85,
    batteryLevel: Math.floor(Math.random() * 20) + 75
  }),

  'curiosity': async () => ({
    operational: true,
    health: Math.random() > 0.8 ? 'nominal' : 'good',
    lastContact: new Date(Date.now() - Math.floor(Math.random() * 3600000)),
    nextContact: new Date(Date.now() + Math.floor(Math.random() * 7200000)),
    dataRate: Math.floor(Math.random() * 30000) + 8000,
    signalStrength: Math.floor(Math.random() * 20) + 75,
    batteryLevel: Math.floor(Math.random() * 25) + 70
  }),

  'mars-reconnaissance-orbiter': async () => ({
    operational: true,
    health: Math.random() > 0.95 ? 'nominal' : 'excellent',
    lastContact: new Date(Date.now() - Math.floor(Math.random() * 1800000)), // Within 30 min
    nextContact: new Date(Date.now() + Math.floor(Math.random() * 3600000)),
    dataRate: Math.floor(Math.random() * 200000) + 50000,
    signalStrength: Math.floor(Math.random() * 10) + 90,
    fuelRemaining: Math.floor(Math.random() * 15) + 65
  }),

  'maven': async () => ({
    operational: true,
    health: Math.random() > 0.9 ? 'good' : 'excellent',
    lastContact: new Date(Date.now() - Math.floor(Math.random() * 2400000)),
    nextContact: new Date(Date.now() + Math.floor(Math.random() * 4800000)),
    dataRate: Math.floor(Math.random() * 80000) + 20000,
    signalStrength: Math.floor(Math.random() * 15) + 80,
    fuelRemaining: Math.floor(Math.random() * 20) + 55
  }),

  'mars-odyssey': async () => ({
    operational: true,
    health: Math.random() > 0.85 ? 'nominal' : 'good',
    lastContact: new Date(Date.now() - Math.floor(Math.random() * 3600000)),
    nextContact: new Date(Date.now() + Math.floor(Math.random() * 5400000)),
    dataRate: Math.floor(Math.random() * 60000) + 15000,
    signalStrength: Math.floor(Math.random() * 20) + 75,
    fuelRemaining: Math.floor(Math.random() * 25) + 45
  }),

  'james-webb-space-telescope': async () => ({
    operational: true,
    health: 'excellent',
    lastContact: new Date(Date.now() - Math.floor(Math.random() * 1800000)),
    nextContact: new Date(Date.now() + Math.floor(Math.random() * 3600000)),
    dataRate: Math.floor(Math.random() * 500000) + 100000,
    signalStrength: Math.floor(Math.random() * 5) + 95,
    fuelRemaining: Math.floor(Math.random() * 10) + 85
  }),

  'voyager-1': async () => ({
    operational: true,
    health: Math.random() > 0.8 ? 'nominal' : 'good',
    lastContact: new Date(Date.now() - Math.floor(Math.random() * 86400000)), // Within 24 hours
    nextContact: new Date(Date.now() + Math.floor(Math.random() * 172800000)), // Next 48 hours
    dataRate: Math.floor(Math.random() * 200) + 50,
    signalStrength: Math.floor(Math.random() * 30) + 40
  }),

  'voyager-2': async () => ({
    operational: true,
    health: Math.random() > 0.8 ? 'nominal' : 'good',
    lastContact: new Date(Date.now() - Math.floor(Math.random() * 86400000)),
    nextContact: new Date(Date.now() + Math.floor(Math.random() * 172800000)),
    dataRate: Math.floor(Math.random() * 200) + 45,
    signalStrength: Math.floor(Math.random() * 30) + 35
  }),

  'parker-solar-probe': async () => ({
    operational: true,
    health: Math.random() > 0.9 ? 'good' : 'excellent',
    lastContact: new Date(Date.now() - Math.floor(Math.random() * 7200000)), // Within 2 hours
    nextContact: new Date(Date.now() + Math.floor(Math.random() * 10800000)), // Next 3 hours
    dataRate: Math.floor(Math.random() * 150000) + 25000,
    signalStrength: Math.floor(Math.random() * 25) + 65,
    fuelRemaining: Math.floor(Math.random() * 15) + 80
  })
};

export function MissionStatusIndicator({ missionId, className = '' }: MissionStatusIndicatorProps) {
  const [status, setStatus] = useState<MissionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      const cacheKey = `mission-status-${missionId}`;
      
      try {
        PerformanceMonitor.markStart(`fetch-${missionId}-status`);
        
        let data = ClientCache.get<MissionStatus>(cacheKey);
        
        if (!data && missionStatusData[missionId]) {
          data = await missionStatusData[missionId]();
          ClientCache.set(cacheKey, data, 2 * 60 * 1000); // 2 minute cache
        }
        
        if (data) {
          setStatus(data);
        }
        
        PerformanceMonitor.markEnd(`fetch-${missionId}-status`);
      } catch (error) {
        console.warn(`Failed to fetch status for ${missionId}:`, error);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 2 * 60 * 1000); // Refresh every 2 minutes
    return () => clearInterval(interval);
  }, [missionId]);

  if (loading || !status) {
    return (
      <div className={`bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-20 mb-3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const healthColors = {
    excellent: 'text-green-400 bg-green-500/20',
    good: 'text-blue-400 bg-blue-500/20',
    nominal: 'text-yellow-400 bg-yellow-500/20',
    degraded: 'text-orange-400 bg-orange-500/20',
    critical: 'text-red-400 bg-red-500/20'
  };

  const getSignalColor = (strength: number) => {
    if (strength >= 80) return 'text-green-400';
    if (strength >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const formatDataRate = (rate: number) => {
    if (rate >= 1000000) return `${(rate / 1000000).toFixed(1)} Mbps`;
    if (rate >= 1000) return `${(rate / 1000).toFixed(1)} kbps`;
    return `${rate} bps`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const formatTimeUntil = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300">Mission Status</h3>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 bg-green-500 rounded-full"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Health</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${healthColors[status.health]}`}>
            {status.health}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Signal</span>
          <span className={`text-sm font-semibold ${getSignalColor(status.signalStrength)}`}>
            {status.signalStrength}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Data Rate</span>
          <span className="text-sm font-semibold text-blue-400">
            {formatDataRate(status.dataRate)}
          </span>
        </div>

        {status.batteryLevel && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Battery</span>
            <span className={`text-sm font-semibold ${status.batteryLevel > 50 ? 'text-green-400' : 'text-yellow-400'}`}>
              {status.batteryLevel}%
            </span>
          </div>
        )}

        {status.fuelRemaining && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Fuel</span>
            <span className={`text-sm font-semibold ${status.fuelRemaining > 50 ? 'text-green-400' : 'text-orange-400'}`}>
              {status.fuelRemaining}%
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-gray-700/50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Last Contact: {formatTimeAgo(status.lastContact)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>Next Contact: {formatTimeUntil(status.nextContact)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}