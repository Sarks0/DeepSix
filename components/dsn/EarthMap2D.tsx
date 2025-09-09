'use client';

import { motion } from 'framer-motion';
import type { DSNStation } from '@/lib/api/dsn';

const STATION_LOCATIONS: Record<string, { lat: number; lon: number; name: string }> = {
  gdscc: { lat: 35.4, lon: -116.9, name: 'Goldstone, CA' },
  mdscc: { lat: 40.4, lon: -4.2, name: 'Madrid, Spain' },
  cdscc: { lat: -35.4, lon: 148.9, name: 'Canberra, Australia' }
};

interface EarthMap2DProps {
  stations: DSNStation[];
}

export function EarthMap2D({ stations }: EarthMap2DProps) {
  // Convert lat/lon to percentage positions on a 2D map
  const latLonToPercent = (lat: number, lon: number) => {
    const x = ((lon + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x, y };
  };

  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden relative">
      {/* Satellite map background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: `url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/2/1/2')`,
          backgroundSize: 'cover',
          filter: 'brightness(0.7) contrast(1.2)'
        }}
      />
      
      {/* Earth map image overlay */}
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Whole_world_-_land_and_oceans_12000.jpg/1920px-Whole_world_-_land_and_oceans_12000.jpg"
        alt="World Map"
        className="absolute inset-0 w-full h-full object-cover opacity-50"
        style={{ filter: 'brightness(0.6) contrast(1.1) saturate(0.8)' }}
      />

      {/* Gradient overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-transparent to-gray-900/40" />
      
      {/* World map grid overlay */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 360 180">
          {/* Grid lines */}
          {[...Array(7)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * 30}
              x2="360"
              y2={i * 30}
              stroke="white"
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}
          {[...Array(13)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 30}
              y1="0"
              x2={i * 30}
              y2="180"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}
          {/* Equator */}
          <line x1="0" y1="90" x2="360" y2="90" stroke="white" strokeWidth="1" opacity="0.5" />
          {/* Prime Meridian */}
          <line x1="180" y1="0" x2="180" y2="180" stroke="white" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>

      {/* Station markers */}
      {stations.map((station) => {
        const location = STATION_LOCATIONS[station.name];
        if (!location) return null;

        const { x, y } = latLonToPercent(location.lat, location.lon);
        const hasActiveComms = station.dishes.some(dish => 
          dish.targets.some(t => t.spacecraft && t.spacecraft.length > 0)
        );

        return (
          <motion.div
            key={station.name}
            className="absolute"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: stations.indexOf(station) * 0.1 }}
          >
            {/* Station dot */}
            <div className="relative">
              <div className={`w-5 h-5 rounded-full border-2 border-white/80 ${
                hasActiveComms ? 'bg-green-500' : 'bg-red-500'
              } shadow-2xl`} style={{
                boxShadow: hasActiveComms 
                  ? '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.4)' 
                  : '0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.4)'
              }}>
                {hasActiveComms && (
                  <div className="absolute inset-0 rounded-full bg-green-400 animate-ping" />
                )}
              </div>

              {/* Station label */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap">
                <div className="bg-gray-900/95 backdrop-blur-sm px-2 py-1 rounded text-xs border border-gray-700/50">
                  <div className="font-semibold text-white">{station.friendlyName}</div>
                  <div className="text-gray-400">{location.name}</div>
                  {hasActiveComms && (
                    <div className="text-green-400 text-xs">
                      {station.dishes.filter(d => d.targets.some(t => t.spacecraft && t.spacecraft.length > 0)).length} active
                    </div>
                  )}
                </div>
              </div>

              {/* Signal beams for active communications */}
              {hasActiveComms && (
                <svg className="absolute inset-0 w-32 h-32 -translate-x-1/2 -translate-y-1/2" style={{ left: '50%', top: '50%' }}>
                  <circle
                    cx="64"
                    cy="64"
                    r="30"
                    fill="none"
                    stroke="rgb(34 197 94)"
                    strokeWidth="1"
                    opacity="0.3"
                    className="animate-pulse"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="45"
                    fill="none"
                    stroke="rgb(34 197 94)"
                    strokeWidth="0.5"
                    opacity="0.2"
                    className="animate-pulse"
                    style={{ animationDelay: '0.5s' }}
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    fill="none"
                    stroke="rgb(34 197 94)"
                    strokeWidth="0.3"
                    opacity="0.1"
                    className="animate-pulse"
                    style={{ animationDelay: '1s' }}
                  />
                </svg>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Connection lines between active stations */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {stations.map((station1, i) => {
          const loc1 = STATION_LOCATIONS[station1.name];
          if (!loc1) return null;
          const pos1 = latLonToPercent(loc1.lat, loc1.lon);
          const active1 = station1.dishes.some(d => d.targets.some(t => t.spacecraft && t.spacecraft.length > 0));
          if (!active1) return null;

          return stations.slice(i + 1).map((station2) => {
            const loc2 = STATION_LOCATIONS[station2.name];
            if (!loc2) return null;
            const pos2 = latLonToPercent(loc2.lat, loc2.lon);
            const active2 = station2.dishes.some(d => d.targets.some(t => t.spacecraft && t.spacecraft.length > 0));
            if (!active2) return null;

            return (
              <motion.line
                key={`${station1.name}-${station2.name}`}
                x1={`${pos1.x}%`}
                y1={`${pos1.y}%`}
                x2={`${pos2.x}%`}
                y2={`${pos2.y}%`}
                stroke="rgb(96 165 250)"
                strokeWidth="1"
                opacity="0.2"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
              />
            );
          });
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/95 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
            <span className="text-gray-300">Active Station</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
            <span className="text-gray-300">Idle Station</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-4 left-4 bg-gray-900/95 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50">
        <h3 className="text-lg font-bold text-white">Global Station Network</h3>
        <p className="text-xs text-gray-400">Real-time communication status</p>
      </div>
    </div>
  );
}