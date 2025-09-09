'use client';

import { motion } from 'framer-motion';
import type { DSNStation } from '@/lib/api/dsn';

const STATION_LOCATIONS: Record<string, { lat: number; lon: number; name: string; region: string }> = {
  gdscc: { lat: 35.4, lon: -116.9, name: 'Goldstone', region: 'California, USA' },
  mdscc: { lat: 40.4, lon: -4.2, name: 'Madrid', region: 'Spain' },
  cdscc: { lat: -35.4, lon: 149.0, name: 'Canberra', region: 'Australia' }
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

  // Draw simplified continents
  const ContinentShapes = () => (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 180" preserveAspectRatio="none">
      {/* North America */}
      <path
        d="M 50 40 Q 80 35, 100 45 L 95 70 Q 70 75, 50 65 Z"
        fill="rgba(34, 197, 94, 0.1)"
        stroke="rgba(34, 197, 94, 0.3)"
        strokeWidth="0.5"
      />
      
      {/* South America */}
      <path
        d="M 70 95 Q 85 90, 90 100 L 85 140 Q 75 145, 70 130 Z"
        fill="rgba(34, 197, 94, 0.1)"
        stroke="rgba(34, 197, 94, 0.3)"
        strokeWidth="0.5"
      />
      
      {/* Europe */}
      <path
        d="M 170 45 Q 185 40, 190 50 L 185 60 Q 175 55, 170 50 Z"
        fill="rgba(34, 197, 94, 0.1)"
        stroke="rgba(34, 197, 94, 0.3)"
        strokeWidth="0.5"
      />
      
      {/* Africa */}
      <path
        d="M 170 70 Q 190 65, 195 80 L 190 120 Q 175 125, 170 110 Z"
        fill="rgba(34, 197, 94, 0.1)"
        stroke="rgba(34, 197, 94, 0.3)"
        strokeWidth="0.5"
      />
      
      {/* Asia */}
      <path
        d="M 200 40 Q 260 35, 280 50 L 270 80 Q 230 85, 200 70 Z"
        fill="rgba(34, 197, 94, 0.1)"
        stroke="rgba(34, 197, 94, 0.3)"
        strokeWidth="0.5"
      />
      
      {/* Australia */}
      <path
        d="M 290 120 Q 315 115, 320 125 L 315 140 Q 295 135, 290 130 Z"
        fill="rgba(34, 197, 94, 0.1)"
        stroke="rgba(34, 197, 94, 0.3)"
        strokeWidth="0.5"
      />
    </svg>
  );

  return (
    <div className="w-full h-96 bg-gradient-to-b from-gray-900 via-blue-950/20 to-gray-900 rounded-lg overflow-hidden relative">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)`
        }} />
      </div>

      {/* Simplified continent shapes */}
      <ContinentShapes />
      
      {/* World map grid overlay */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" viewBox="0 0 360 180" preserveAspectRatio="none">
          {/* Latitude lines */}
          {[30, 60, 90, 120, 150].map(y => (
            <line
              key={`lat-${y}`}
              x1="0"
              y1={y}
              x2="360"
              y2={y}
              stroke="rgba(147, 197, 253, 0.2)"
              strokeWidth="0.5"
              strokeDasharray={y === 90 ? "none" : "2,4"}
            />
          ))}
          
          {/* Longitude lines */}
          {[60, 120, 180, 240, 300].map(x => (
            <line
              key={`lon-${x}`}
              x1={x}
              y1="0"
              x2={x}
              y2="180"
              stroke="rgba(147, 197, 253, 0.2)"
              strokeWidth="0.5"
              strokeDasharray={x === 180 ? "none" : "2,4"}
            />
          ))}
          
          {/* Equator */}
          <line x1="0" y1="90" x2="360" y2="90" stroke="rgba(147, 197, 253, 0.4)" strokeWidth="1" />
          {/* Prime Meridian */}
          <line x1="180" y1="0" x2="180" y2="180" stroke="rgba(147, 197, 253, 0.4)" strokeWidth="1" />
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
        
        const activeDishCount = station.dishes.filter(d => 
          d.targets.some(t => t.spacecraft && t.spacecraft.length > 0)
        ).length;

        return (
          <motion.div
            key={station.name}
            className="absolute"
            style={{ 
              left: `${x}%`, 
              top: `${y}%`, 
              transform: 'translate(-50%, -50%)' 
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: stations.indexOf(station) * 0.2,
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
          >
            {/* Station marker group */}
            <div className="relative group">
              {/* Pulse effect for active stations */}
              {hasActiveComms && (
                <>
                  <div className="absolute inset-0 -m-8">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 animate-ping" />
                  </div>
                  <div className="absolute inset-0 -m-6">
                    <div className="w-12 h-12 rounded-full bg-green-500/30 animate-ping" 
                         style={{ animationDelay: '0.5s' }} />
                  </div>
                </>
              )}

              {/* Station dot */}
              <div className={`relative w-6 h-6 rounded-full border-2 ${
                hasActiveComms 
                  ? 'bg-green-500 border-green-300 shadow-[0_0_20px_rgba(34,197,94,0.8)]' 
                  : 'bg-red-500 border-red-300 shadow-[0_0_20px_rgba(239,68,68,0.8)]'
              } transition-all duration-300 hover:scale-125 cursor-pointer z-10`}>
                <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse" />
              </div>

              {/* Station info tooltip */}
              <div className="absolute left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                <div className="bg-gray-900/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700 shadow-xl whitespace-nowrap">
                  <div className="text-sm font-bold text-white">{location.name}</div>
                  <div className="text-xs text-gray-400">{location.region}</div>
                  <div className="text-xs text-gray-500 mt-1">{station.friendlyName}</div>
                  {hasActiveComms && (
                    <div className="text-xs text-green-400 mt-1">
                      {activeDishCount} dish{activeDishCount !== 1 ? 'es' : ''} active
                    </div>
                  )}
                </div>
              </div>
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
                stroke="url(#gradient-connection)"
                strokeWidth="1"
                opacity="0.4"
                strokeDasharray="5,5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{ duration: 2, delay: 1 }}
              />
            );
          });
        })}
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient-connection" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.6" />
            <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/95 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            <span className="text-gray-300">Active Station</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            <span className="text-gray-300">Idle Station</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-4 left-4 bg-gray-900/95 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50">
        <h3 className="text-lg font-bold text-white">Global Station Network</h3>
        <p className="text-xs text-gray-400">Deep Space Network - Live Status</p>
      </div>

      {/* Station labels always visible */}
      <div className="absolute inset-0 pointer-events-none">
        {stations.map((station) => {
          const location = STATION_LOCATIONS[station.name];
          if (!location) return null;
          const { x, y } = latLonToPercent(location.lat, location.lon);
          
          return (
            <div
              key={`label-${station.name}`}
              className="absolute text-xs font-semibold text-white/80"
              style={{ 
                left: `${x}%`, 
                top: `${y + 5}%`, 
                transform: 'translateX(-50%)'
              }}
            >
              {location.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}