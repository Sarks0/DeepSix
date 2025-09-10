'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientCache, PerformanceMonitor } from '@/lib/services/mission-data-cache';

interface MissionDataItem {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  description: string;
  type: 'metric' | 'status' | 'discovery' | 'achievement';
  timestamp: Date;
  source: string;
}

interface MissionDataFeedProps {
  missionId: string;
  className?: string;
}

const missionDataSources: Record<string, () => Promise<MissionDataItem[]>> = {
  'perseverance': async () => [
    {
      id: 'sol',
      title: 'Sol (Mars Day)',
      value: Math.floor(Math.random() * 50) + 1320,
      description: 'Days since landing on Mars',
      type: 'metric',
      timestamp: new Date(),
      source: 'Mission Operations'
    },
    {
      id: 'samples',
      title: 'Rock Samples',
      value: 24,
      description: 'Samples collected and cached for future return',
      type: 'achievement',
      timestamp: new Date(),
      source: 'Sample & Caching System'
    },
    {
      id: 'distance',
      title: 'Distance Traveled',
      value: (28.52 + Math.random() * 0.5).toFixed(2),
      unit: 'km',
      description: 'Total distance driven on Mars surface',
      type: 'metric',
      timestamp: new Date(),
      source: 'Navigation System'
    },
    {
      id: 'weather',
      title: 'Temperature',
      value: Math.floor(Math.random() * 30) - 80,
      unit: '°C',
      description: 'Current atmospheric temperature',
      type: 'status',
      timestamp: new Date(),
      source: 'MEDA Weather Station'
    }
  ],
  
  'curiosity': async () => [
    {
      id: 'sol',
      title: 'Sol (Mars Day)', 
      value: Math.floor(Math.random() * 50) + 4380,
      description: 'Days since landing on Mars',
      type: 'metric',
      timestamp: new Date(),
      source: 'Mission Operations'
    },
    {
      id: 'distance',
      title: 'Distance Traveled',
      value: (31.18 + Math.random() * 0.1).toFixed(2),
      unit: 'km',
      description: 'Total distance driven exploring Gale Crater',
      type: 'metric',
      timestamp: new Date(),
      source: 'Navigation System'
    },
    {
      id: 'drill-holes',
      title: 'Drill Sites',
      value: 39,
      description: 'Rock samples drilled and analyzed',
      type: 'achievement',
      timestamp: new Date(),
      source: 'Sample Analysis at Mars'
    },
    {
      id: 'methane',
      title: 'Methane Detection',
      value: Math.random() > 0.7 ? 'Detected' : 'Background',
      description: 'Atmospheric methane monitoring',
      type: 'discovery',
      timestamp: new Date(),
      source: 'TLS Spectrometer'
    }
  ],

  'mars-reconnaissance-orbiter': async () => [
    {
      id: 'orbit',
      title: 'Orbital Period',
      value: '112',
      unit: 'min',
      description: 'Time to complete one orbit around Mars',
      type: 'metric',
      timestamp: new Date(),
      source: 'Flight Navigation'
    },
    {
      id: 'images',
      title: 'HiRISE Images',
      value: (69000 + Math.floor(Math.random() * 100)).toLocaleString(),
      description: 'High-resolution images captured to date',
      type: 'achievement',
      timestamp: new Date(),
      source: 'HiRISE Camera'
    },
    {
      id: 'data-relay',
      title: 'Data Relay',
      value: Math.floor(Math.random() * 500) + 2000,
      unit: 'GB',
      description: 'Data relayed from surface missions this month',
      type: 'metric',
      timestamp: new Date(),
      source: 'Communications System'
    },
    {
      id: 'subsurface',
      title: 'Subsurface Radar',
      value: 'Active Scan',
      description: 'SHARAD mapping underground ice deposits',
      type: 'status',
      timestamp: new Date(),
      source: 'SHARAD Instrument'
    }
  ],

  'maven': async () => [
    {
      id: 'altitude',
      title: 'Orbit Altitude',
      value: `${Math.floor(Math.random() * 500) + 4500}-${Math.floor(Math.random() * 1000) + 6200}`,
      unit: 'km',
      description: 'Current orbital altitude range',
      type: 'metric',
      timestamp: new Date(),
      source: 'Flight Navigation'
    },
    {
      id: 'atmospheric-loss',
      title: 'Atmospheric Escape Rate',
      value: (Math.random() * 0.5 + 0.2).toFixed(2),
      unit: 'kg/s',
      description: 'Current rate of atmospheric loss to space',
      type: 'discovery',
      timestamp: new Date(),
      source: 'NGIMS Spectrometer'
    },
    {
      id: 'solar-wind',
      title: 'Solar Wind Pressure',
      value: (Math.random() * 3 + 1).toFixed(1),
      unit: 'nPa',
      description: 'Solar wind dynamic pressure measurement',
      type: 'metric',
      timestamp: new Date(),
      source: 'SWIA Instrument'
    },
    {
      id: 'aurora',
      title: 'Aurora Activity',
      value: Math.random() > 0.6 ? 'Detected' : 'Quiet',
      description: 'Martian aurora observations',
      type: 'status',
      timestamp: new Date(),
      source: 'IUVS Spectrograph'
    }
  ],

  'mars-odyssey': async () => [
    {
      id: 'orbit-count',
      title: 'Completed Orbits',
      value: (98500 + Math.floor(Math.random() * 100)).toLocaleString(),
      description: 'Total orbits since arrival in 2001',
      type: 'achievement',
      timestamp: new Date(),
      source: 'Mission Operations'
    },
    {
      id: 'thermal-data',
      title: 'Surface Temperature',
      value: Math.floor(Math.random() * 40) - 85,
      unit: '°C',
      description: 'THEMIS infrared temperature reading',
      type: 'metric',
      timestamp: new Date(),
      source: 'THEMIS Camera'
    },
    {
      id: 'water-ice',
      title: 'Subsurface Ice',
      value: Math.floor(Math.random() * 15) + 25,
      unit: '%',
      description: 'Water ice concentration in observed region',
      type: 'discovery',
      timestamp: new Date(),
      source: 'Neutron Spectrometer'
    },
    {
      id: 'radiation',
      title: 'Radiation Environment',
      value: (Math.random() * 0.5 + 0.2).toFixed(3),
      unit: 'mGy/day',
      description: 'Daily radiation dose measurement',
      type: 'metric',
      timestamp: new Date(),
      source: 'MARIE Instrument'
    }
  ],

  'james-webb-space-telescope': async () => [
    {
      id: 'observations',
      title: 'Total Observations',
      value: (2800 + Math.floor(Math.random() * 50)).toLocaleString(),
      description: 'Scientific observations completed',
      type: 'achievement',
      timestamp: new Date(),
      source: 'Mission Operations'
    },
    {
      id: 'temperature',
      title: 'Instrument Temperature',
      value: Math.floor(Math.random() * 5) + 47,
      unit: 'K',
      description: 'Operating temperature of instruments',
      type: 'metric',
      timestamp: new Date(),
      source: 'Thermal Control'
    },
    {
      id: 'target',
      title: 'Current Target',
      value: ['NGC 6302', 'WASP-96b', 'HD 149026b', 'Carina Nebula', 'SMACS 0723'][Math.floor(Math.random() * 5)],
      description: 'Active observation target',
      type: 'status',
      timestamp: new Date(),
      source: 'Observation Planning'
    },
    {
      id: 'distance',
      title: 'Distance from Earth',
      value: (1.5 + Math.random() * 0.1).toFixed(2),
      unit: 'million km',
      description: 'Current distance at L2 Lagrange point',
      type: 'metric',
      timestamp: new Date(),
      source: 'Flight Navigation'
    }
  ],

  'voyager-1': async () => [
    {
      id: 'distance',
      title: 'Distance from Earth',
      value: (24.2 + Math.random() * 0.1).toFixed(2),
      unit: 'billion km',
      description: 'Current distance in interstellar space',
      type: 'metric',
      timestamp: new Date(),
      source: 'Deep Space Network'
    },
    {
      id: 'signal-time',
      title: 'Signal Travel Time',
      value: Math.floor((24.2 * 1000000000) / 299792458 / 3600),
      unit: 'hours',
      description: 'Time for signals to reach Earth',
      type: 'metric',
      timestamp: new Date(),
      source: 'Communications'
    },
    {
      id: 'power',
      title: 'Available Power',
      value: Math.floor(Math.random() * 10) + 250,
      unit: 'watts',
      description: 'Current power from RTG generators',
      type: 'status',
      timestamp: new Date(),
      source: 'Power Subsystem'
    },
    {
      id: 'plasma-density',
      title: 'Plasma Density',
      value: (Math.random() * 0.02 + 0.08).toFixed(3),
      unit: 'cm⁻³',
      description: 'Interstellar plasma measurements',
      type: 'discovery',
      timestamp: new Date(),
      source: 'Plasma Wave System'
    }
  ],

  'voyager-2': async () => [
    {
      id: 'distance',
      title: 'Distance from Earth',
      value: (20.1 + Math.random() * 0.1).toFixed(2),
      unit: 'billion km',
      description: 'Current distance in interstellar space',
      type: 'metric',
      timestamp: new Date(),
      source: 'Deep Space Network'
    },
    {
      id: 'signal-time',
      title: 'Signal Travel Time',
      value: Math.floor((20.1 * 1000000000) / 299792458 / 3600),
      unit: 'hours',
      description: 'Time for signals to reach Earth',
      type: 'metric',
      timestamp: new Date(),
      source: 'Communications'
    },
    {
      id: 'power',
      title: 'Available Power',
      value: Math.floor(Math.random() * 15) + 230,
      unit: 'watts',
      description: 'Current power from RTG generators',
      type: 'status',
      timestamp: new Date(),
      source: 'Power Subsystem'
    },
    {
      id: 'magnetic-field',
      title: 'Magnetic Field',
      value: (Math.random() * 0.2 + 0.4).toFixed(2),
      unit: 'nT',
      description: 'Interstellar magnetic field strength',
      type: 'discovery',
      timestamp: new Date(),
      source: 'Magnetometer'
    }
  ],

  'parker-solar-probe': async () => [
    {
      id: 'solar-distance',
      title: 'Distance from Sun',
      value: (Math.random() * 50 + 10).toFixed(1),
      unit: 'million km',
      description: 'Current distance from the Sun',
      type: 'metric',
      timestamp: new Date(),
      source: 'Navigation System'
    },
    {
      id: 'speed',
      title: 'Velocity',
      value: Math.floor(Math.random() * 100) + 400,
      unit: 'km/s',
      description: 'Current velocity relative to Sun',
      type: 'metric',
      timestamp: new Date(),
      source: 'Flight Dynamics'
    },
    {
      id: 'temperature',
      title: 'Heat Shield Temp',
      value: Math.floor(Math.random() * 200) + 1200,
      unit: '°C',
      description: 'Thermal Protection System temperature',
      type: 'status',
      timestamp: new Date(),
      source: 'Thermal Control'
    },
    {
      id: 'solar-wind',
      title: 'Solar Wind Speed',
      value: Math.floor(Math.random() * 200) + 300,
      unit: 'km/s',
      description: 'Measured solar wind velocity',
      type: 'discovery',
      timestamp: new Date(),
      source: 'SWEAP Instrument'
    }
  ]
};

export function MissionDataFeed({ missionId, className = '' }: MissionDataFeedProps) {
  const [currentData, setCurrentData] = useState<MissionDataItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMissionData() {
      const cacheKey = `mission-data-${missionId}`;
      
      try {
        PerformanceMonitor.markStart(`fetch-${missionId}-data`);
        
        let data = ClientCache.get<MissionDataItem[]>(cacheKey);
        
        if (!data && missionDataSources[missionId]) {
          data = await missionDataSources[missionId]();
          ClientCache.set(cacheKey, data, 5 * 60 * 1000); // 5 minute cache
        }
        
        if (data) {
          setCurrentData(data);
        }
        
        PerformanceMonitor.markEnd(`fetch-${missionId}-data`);
      } catch (error) {
        console.warn(`Failed to fetch mission data for ${missionId}:`, error);
      } finally {
        setLoading(false);
      }
    }

    fetchMissionData();
    const interval = setInterval(fetchMissionData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [missionId]);

  useEffect(() => {
    if (currentData.length > 0) {
      const rotationInterval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % currentData.length);
      }, 8000); // Rotate every 8 seconds
      
      return () => clearInterval(rotationInterval);
    }
  }, [currentData.length]);

  if (loading || currentData.length === 0) {
    return (
      <div className={`bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-700 rounded w-16 mb-1"></div>
          <div className="h-3 bg-gray-700 rounded w-32"></div>
        </div>
      </div>
    );
  }

  const currentItem = currentData[currentIndex];
  const typeColors = {
    metric: 'text-blue-400',
    status: 'text-green-400', 
    discovery: 'text-purple-400',
    achievement: 'text-yellow-400'
  };

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentItem.id}-${currentIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-400 uppercase tracking-wider">
              {currentItem.title}
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-${currentItem.type === 'metric' ? 'blue' : currentItem.type === 'status' ? 'green' : currentItem.type === 'discovery' ? 'purple' : 'yellow'}-500/20 text-${currentItem.type === 'metric' ? 'blue' : currentItem.type === 'status' ? 'green' : currentItem.type === 'discovery' ? 'purple' : 'yellow'}-400`}>
              {currentItem.type}
            </div>
          </div>
          
          <div className={`text-2xl font-bold mb-1 ${typeColors[currentItem.type]}`}>
            {currentItem.value}{currentItem.unit && ` ${currentItem.unit}`}
          </div>
          
          <div className="text-sm text-gray-300 mb-2">
            {currentItem.description}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{currentItem.source}</span>
            <span>{currentItem.timestamp.toLocaleTimeString()}</span>
          </div>
        </motion.div>
      </AnimatePresence>
      
      <div className="flex justify-center mt-3 space-x-1">
        {currentData.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              index === currentIndex ? 'bg-blue-400' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}