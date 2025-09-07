'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RoverIcon, ProbeIcon, SolarIcon } from '@/components/icons/MissionIcons';
import { StatusBarSkeleton } from '@/components/ui/loading-skeleton';

interface SystemStatus {
  name: string;
  value: number;
  max: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

interface MissionStatusProps {
  missionId: string;
  missionName: string;
  type: 'rover' | 'probe' | 'solar';
}

export function MissionStatus({ missionId, missionName, type }: MissionStatusProps) {
  const [systems, setSystems] = useState<SystemStatus[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    setLoading(true);

    // Initialize mission systems based on type after a brief delay
    const loadTimeout = setTimeout(() => {
      const initialSystems = getMissionSystems(type);
      setSystems(initialSystems);
      setLastUpdate(new Date());
      setLoading(false);
    }, 800);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystems((prev) =>
        prev.map((system) => ({
          ...system,
          value: updateSystemValue(system),
          status: getSystemStatus(system),
        }))
      );
      setLastUpdate(new Date());
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(loadTimeout);
    };
  }, [type]);

  function getMissionSystems(type: string): SystemStatus[] {
    switch (type) {
      case 'rover':
        return [
          { name: 'Battery', value: 85, max: 100, unit: '%', status: 'good' },
          { name: 'Temperature', value: -45, max: 50, unit: '°C', status: 'good' },
          { name: 'Memory', value: 2.3, max: 8, unit: 'GB', status: 'good' },
          { name: 'Signal', value: -75, max: -50, unit: 'dBm', status: 'good' },
        ];
      case 'probe':
        return [
          { name: 'RTG Power', value: 245, max: 300, unit: 'W', status: 'good' },
          { name: 'Data Buffer', value: 45, max: 100, unit: '%', status: 'good' },
          { name: 'Antenna Align', value: 98, max: 100, unit: '%', status: 'good' },
          { name: 'Fuel', value: 12, max: 100, unit: 'kg', status: 'warning' },
        ];
      case 'solar':
        return [
          { name: 'Heat Shield', value: 1377, max: 1500, unit: '°C', status: 'warning' },
          { name: 'Solar Panels', value: 95, max: 100, unit: '%', status: 'good' },
          { name: 'Instruments', value: 7, max: 8, unit: 'ON', status: 'good' },
          { name: 'Cooling', value: 78, max: 100, unit: '%', status: 'good' },
        ];
      default:
        return [];
    }
  }

  function updateSystemValue(system: SystemStatus): number {
    const variance = system.max * 0.05;
    const newValue = system.value + (Math.random() - 0.5) * variance;
    return Math.max(0, Math.min(system.max, newValue));
  }

  function getSystemStatus(system: SystemStatus): 'good' | 'warning' | 'critical' {
    const percentage = (system.value / system.max) * 100;
    if (system.name === 'Temperature' || system.name === 'Heat Shield') {
      if (percentage > 90) return 'critical';
      if (percentage > 75) return 'warning';
      return 'good';
    }
    if (percentage < 20) return 'critical';
    if (percentage < 40) return 'warning';
    return 'good';
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'rover':
        return <RoverIcon size={24} className="text-white" />;
      case 'probe':
        return <ProbeIcon size={24} className="text-white" />;
      case 'solar':
        return <SolarIcon size={24} className="text-white" />;
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-lg border border-blue-500/30">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{missionName}</h3>
            <p className="text-xs text-gray-400">Last update: {lastUpdate.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <StatusBarSkeleton count={4} shimmer={true} />
        ) : (
          systems.map((system, index) => (
            <motion.div
              key={system.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-400">{system.name}</span>
                <span className="text-sm font-mono text-white">
                  {typeof system.value === 'number' ? system.value.toFixed(1) : system.value}{' '}
                  {system.unit}
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${getStatusColor(system.status)} transition-all duration-1000`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.abs((system.value / system.max) * 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
