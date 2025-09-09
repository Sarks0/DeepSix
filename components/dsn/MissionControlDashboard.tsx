'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DSNData } from '@/lib/api/dsn';

interface MissionControlDashboardProps {
  dsnData: DSNData;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onExitMissionControl: () => void;
}

export function MissionControlDashboard({ 
  dsnData, 
  isFullscreen, 
  onToggleFullscreen,
  onExitMissionControl 
}: MissionControlDashboardProps) {
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    message: string;
    type: 'info' | 'warning' | 'success';
    timestamp: Date;
  }>>([]);
  

  // Calculate statistics
  const stats = {
    totalDishes: dsnData.stations.reduce((acc, s) => acc + s.dishes.length, 0),
    activeDishes: dsnData.stations.reduce((acc, s) => 
      acc + s.dishes.filter(d => d.targets.some(t => t.spacecraft && t.spacecraft.length > 0)).length, 0
    ),
    totalDataRate: dsnData.stations.reduce((acc, station) => 
      acc + station.dishes.reduce((dAcc, dish) => 
        dAcc + dish.targets.reduce((tAcc, target) => 
          tAcc + (target.downSignal?.dataRate || 0) + (target.upSignal?.dataRate || 0), 0
        ), 0
      ), 0
    ),
    activeSpacecraft: new Set(
      dsnData.stations.flatMap(s => 
        s.dishes.flatMap(d => 
          d.targets.flatMap(t => t.spacecraft || [])
        )
      )
    ).size
  };

  // Track new spacecraft connections
  useEffect(() => {
    const checkForNewConnections = () => {
      // Check for new spacecraft connections
      const currentSpacecraft = new Set(
        dsnData.stations.flatMap(s => 
          s.dishes.flatMap(d => 
            d.targets.flatMap(t => t.spacecraft || [])
          )
        )
      );
      
      // This would track changes in real implementation
      if (currentSpacecraft.size > 0 && alerts.length === 0) {
        const newAlert = {
          id: Date.now().toString(),
          message: `Tracking ${currentSpacecraft.size} spacecraft across ${dsnData.stations.length} stations`,
          type: 'info' as const,
          timestamp: new Date()
        };
        setAlerts([newAlert]);
      }
    };

    checkForNewConnections();
  }, [dsnData, alerts.length]);

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-gray-950' : ''} p-4`}>
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Mission Control</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onExitMissionControl}
            className="px-4 py-2 rounded bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors"
            title="Exit Mission Control"
          >
            ← Back to Standard View
          </button>
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors"
            title="Toggle fullscreen"
          >
            {isFullscreen ? '⛶' : '⛶'}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-900 rounded-lg p-3 border border-gray-800"
        >
          <p className="text-xs text-gray-400 mb-1">Total Antennas</p>
          <p className="text-2xl font-bold text-white">{stats.totalDishes}</p>
          <p className="text-xs text-green-400">{stats.activeDishes} active</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-900 rounded-lg p-3 border border-gray-800"
        >
          <p className="text-xs text-gray-400 mb-1">Spacecraft Tracked</p>
          <p className="text-2xl font-bold text-purple-400">{stats.activeSpacecraft}</p>
          <p className="text-xs text-gray-500">Active connections</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-900 rounded-lg p-3 border border-gray-800"
        >
          <p className="text-xs text-gray-400 mb-1">Data Throughput</p>
          <p className="text-2xl font-bold text-blue-400">
            {(stats.totalDataRate / 1000000).toFixed(2)} Mb/s
          </p>
          <p className="text-xs text-gray-500">Combined rate</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-900 rounded-lg p-3 border border-gray-800"
        >
          <p className="text-xs text-gray-400 mb-1">System Status</p>
          <p className="text-2xl font-bold text-green-400">NOMINAL</p>
          <p className="text-xs text-gray-500">All systems go</p>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-3 gap-4">
        {/* Active Communications */}
        <div className="col-span-2 bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-3">Active Communications</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {dsnData.stations.flatMap(station =>
              station.dishes
                .filter(dish => dish.targets.some(t => t.spacecraft && t.spacecraft.length > 0))
                .map(dish => ({
                  station: station.friendlyName,
                  dish: dish.name,
                  targets: dish.targets
                }))
            ).map((comm, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {comm.targets[0]?.spacecraft?.[0] || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {comm.station} • {comm.dish}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {comm.targets[0]?.downSignal && (
                    <p className="text-xs text-blue-400">
                      ↓ {(comm.targets[0].downSignal.dataRate / 1000).toFixed(1)} kb/s
                    </p>
                  )}
                  {comm.targets[0]?.upSignal && (
                    <p className="text-xs text-orange-400">
                      ↑ {(comm.targets[0].upSignal.dataRate / 1000).toFixed(1)} kb/s
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-3">System Alerts</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {alerts.length === 0 ? (
                <p className="text-sm text-gray-500">No active alerts</p>
              ) : (
                alerts.map(alert => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-2 rounded text-xs ${
                      alert.type === 'success' 
                        ? 'bg-green-900/30 border border-green-800/50 text-green-400'
                        : alert.type === 'warning'
                        ? 'bg-yellow-900/30 border border-yellow-800/50 text-yellow-400'
                        : 'bg-blue-900/30 border border-blue-800/50 text-blue-400'
                    }`}
                  >
                    <p>{alert.message}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Station Overview Grid */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {dsnData.stations.map((station, idx) => (
          <motion.div
            key={station.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-white">{station.friendlyName}</h4>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Active Dishes:</span>
                <span className="text-white">
                  {station.dishes.filter(d => d.targets.some(t => t.spacecraft && t.spacecraft.length > 0)).length}
                  /{station.dishes.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Local Time:</span>
                <span className="text-white font-mono">
                  {new Date(station.timeUTC).toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-1">
              {station.dishes.map(dish => (
                <div
                  key={dish.name}
                  className={`h-6 rounded text-xs flex items-center justify-center ${
                    dish.targets.some(t => t.spacecraft && t.spacecraft.length > 0)
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-700/50 text-gray-600'
                  }`}
                  title={dish.name}
                >
                  {dish.name.replace('DSS', '')}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}