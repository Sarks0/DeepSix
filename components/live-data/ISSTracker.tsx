'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ISSPosition {
  latitude: string;
  longitude: string;
  altitude: string;
  velocity: string;
  visibility: string;
  footprint: string;
  timestamp: number;
  daynum: number;
  solar_lat: number;
  solar_lon: number;
  units: string;
}

interface ISSCrew {
  name: string;
  craft: string;
}

export function ISSTracker() {
  const [position, setPosition] = useState<ISSPosition | null>(null);
  const [crew, setCrew] = useState<ISSCrew[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchISSData() {
      try {
        // Fetch ISS position (real-time, no auth required)
        const posResponse = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        if (posResponse.ok) {
          const posData = await posResponse.json();
          setPosition(posData);
        }

        // Fetch crew data (real-time, no auth required)
        const crewResponse = await fetch('http://api.open-notify.org/astros.json');
        if (crewResponse.ok) {
          const crewData = await crewResponse.json();
          setCrew(crewData.people.filter((person: ISSCrew) => person.craft === 'ISS'));
        }
      } catch (error) {
        console.error('Failed to fetch ISS data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchISSData();
    const interval = setInterval(fetchISSData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">ISS Live Position</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-400 uppercase tracking-wider">Live</span>
        </div>
      </div>

      {position && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Latitude</div>
              <div className="font-mono text-sm text-white">
                {parseFloat(position.latitude).toFixed(4)}°
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Longitude</div>
              <div className="font-mono text-sm text-white">
                {parseFloat(position.longitude).toFixed(4)}°
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Altitude</div>
              <div className="font-mono text-sm text-white">
                {parseFloat(position.altitude).toFixed(1)} km
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Velocity</div>
              <div className="font-mono text-sm text-white">
                {parseFloat(position.velocity).toFixed(0)} km/h
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Visibility</div>
            <div className="text-sm text-white capitalize">{position.visibility}</div>
          </div>

          {crew.length > 0 && (
            <div className="pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                Crew Onboard ({crew.length})
              </div>
              <div className="space-y-1">
                {crew.map((member, index) => (
                  <div key={index} className="text-sm text-white">
                    {member.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center pt-2">Updates every 5 seconds</div>
        </div>
      )}
    </motion.div>
  );
}
