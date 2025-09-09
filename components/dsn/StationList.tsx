'use client';

import { motion } from 'framer-motion';
import type { DSNStation } from '@/lib/api/dsn';

interface StationListProps {
  stations: DSNStation[];
}

// Station information with countries and flags
const STATION_INFO = {
  gdscc: {
    name: 'Goldstone',
    location: 'California, USA',
    flag: '🇺🇸',
    timezone: 'PST/PDT',
    coordinates: '35.4°N, 116.9°W'
  },
  mdscc: {
    name: 'Madrid',
    location: 'Spain',
    flag: '🇪🇸',
    timezone: 'CET/CEST',
    coordinates: '40.4°N, 4.2°W'
  },
  cdscc: {
    name: 'Canberra',
    location: 'Australia',
    flag: '🇦🇺',
    timezone: 'AEST/AEDT',
    coordinates: '35.4°S, 149.0°E'
  }
};

export function StationList({ stations }: StationListProps) {
  const formatDataRate = (rate: number): string => {
    if (rate === 0) return '0 b/s';
    if (rate < 1000) return `${rate} b/s`;
    if (rate < 1000000) return `${(rate / 1000).toFixed(1)} kb/s`;
    if (rate < 1000000000) return `${(rate / 1000000).toFixed(2)} Mb/s`;
    return `${(rate / 1000000000).toFixed(2)} Gb/s`;
  };

  const getActivityColor = (activity: string): string => {
    const activityLower = activity.toLowerCase();
    if (activityLower.includes('spacecraft') || activityLower.includes('telemetry')) {
      return 'text-green-400 bg-green-900/20 border-green-600/50';
    }
    if (activityLower.includes('maintenance') || activityLower.includes('calibration')) {
      return 'text-yellow-400 bg-yellow-900/20 border-yellow-600/50';
    }
    if (activityLower.includes('upgrade') || activityLower.includes('engineering')) {
      return 'text-blue-400 bg-blue-900/20 border-blue-600/50';
    }
    return 'text-gray-400 bg-gray-900/20 border-gray-600/50';
  };

  return (
    <div className="space-y-6">
      {stations.map((station, index) => {
        const info = STATION_INFO[station.name as keyof typeof STATION_INFO];
        if (!info) return null;

        const activeDishes = station.dishes.filter(dish => 
          dish.targets?.some(t => t.spacecraft && t.spacecraft.length > 0 && t.spacecraft[0] !== 'DSN')
        );

        const totalDishes = station.dishes.length;

        return (
          <motion.div
            key={station.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden"
          >
            {/* Station Header */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{info.flag}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {info.name} Deep Space Complex
                      {activeDishes.length > 0 && (
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-400">{info.location} • {info.coordinates}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Local Time</p>
                  <p className="text-lg font-mono text-white">
                    {new Date(station.timeUTC).toLocaleTimeString('en-US', {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                  <p className="text-xs text-gray-500">{info.timezone}</p>
                </div>
              </div>
              
              {/* Station Statistics */}
              <div className="flex gap-4 mt-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Total Antennas:</span>
                  <span className="font-semibold text-white">{totalDishes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Active:</span>
                  <span className="font-semibold text-green-400">{activeDishes.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Idle:</span>
                  <span className="font-semibold text-gray-400">{totalDishes - activeDishes.length}</span>
                </div>
              </div>
            </div>

            {/* Dishes Grid */}
            <div className="p-4">
              {station.dishes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No antenna data available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {station.dishes.map((dish) => {
                    const hasActiveComms = dish.targets?.some(t => 
                      t.spacecraft && t.spacecraft.length > 0 && t.spacecraft[0] !== 'DSN'
                    );
                    
                    return (
                      <div
                        key={dish.name}
                        className={`p-3 rounded-lg border transition-all ${
                          hasActiveComms 
                            ? 'bg-green-900/20 border-green-600/50 shadow-lg shadow-green-500/10' 
                            : 'bg-gray-800/50 border-gray-700'
                        }`}
                      >
                        {/* Dish Header */}
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-white flex items-center gap-2">
                            {dish.name}
                            {hasActiveComms && (
                              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            )}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            hasActiveComms ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
                          }`}>
                            {hasActiveComms ? 'ACTIVE' : 'IDLE'}
                          </span>
                        </div>

                        {/* Activity */}
                        {dish.activity && (
                          <div className={`text-xs px-2 py-1 rounded mb-2 border ${getActivityColor(dish.activity)}`}>
                            {dish.activity}
                          </div>
                        )}

                        {/* Antenna Position */}
                        <div className="text-xs text-gray-400 space-y-1 mb-2">
                          <div className="flex justify-between">
                            <span>Azimuth:</span>
                            <span className="font-mono text-white">{dish.azimuthAngle.toFixed(1)}°</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Elevation:</span>
                            <span className="font-mono text-white">{dish.elevationAngle.toFixed(1)}°</span>
                          </div>
                          {dish.windSpeed && (
                            <div className="flex justify-between">
                              <span>Wind:</span>
                              <span className="font-mono text-white">{dish.windSpeed} km/h</span>
                            </div>
                          )}
                        </div>

                        {/* Active Communications */}
                        {hasActiveComms && dish.targets && (
                          <div className="border-t border-gray-700 pt-2 space-y-2">
                            {dish.targets
                              .filter(t => t.spacecraft && t.spacecraft.length > 0 && t.spacecraft[0] !== 'DSN')
                              .map((target, idx) => (
                                <div key={idx} className="text-xs">
                                  <div className="font-semibold text-blue-400 mb-1">
                                    {target.spacecraft?.[0] || target.name}
                                  </div>
                                  {target.downSignal && target.downSignal.active && (
                                    <div className="flex items-center gap-2 text-green-400">
                                      <span>↓</span>
                                      <span>{formatDataRate(target.downSignal.dataRate)}</span>
                                      {target.downSignal.band && (
                                        <span className="text-gray-500">({target.downSignal.band}-band)</span>
                                      )}
                                    </div>
                                  )}
                                  {target.upSignal && target.upSignal.active && (
                                    <div className="flex items-center gap-2 text-orange-400">
                                      <span>↑</span>
                                      <span>{formatDataRate(target.upSignal.dataRate)}</span>
                                      {target.upSignal.band && (
                                        <span className="text-gray-500">({target.upSignal.band}-band)</span>
                                      )}
                                    </div>
                                  )}
                                  {target.rtlt && parseFloat(target.rtlt) > 0 && (
                                    <div className="text-gray-500 mt-1">
                                      Round-trip: {(parseFloat(target.rtlt) / 60).toFixed(1)} min
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}