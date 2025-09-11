'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientCache, PerformanceMonitor } from '@/lib/services/mission-data-cache';

interface Discovery {
  id: string;
  title: string;
  description: string;
  category: 'science' | 'engineering' | 'milestone' | 'imagery';
  significance: 'low' | 'medium' | 'high' | 'breakthrough';
  date: Date;
  missionPhase?: string;
  relatedInstrument?: string;
}

interface DiscoveryFeedProps {
  missionId: string;
  className?: string;
  maxItems?: number;
}

const discoveryData: Record<string, () => Promise<Discovery[]>> = {
  'perseverance': async () => [
    {
      id: 'organic-compounds',
      title: 'Organic Compounds Detected',
      description: 'PIXL instrument confirms organic molecules in rock samples from Jezero Crater delta formations',
      category: 'science',
      significance: 'breakthrough',
      date: new Date('2025-09-08'),
      missionPhase: 'Delta Front Campaign',
      relatedInstrument: 'PIXL'
    },
    {
      id: 'sample-24',
      title: 'Sample Collection Milestone',
      description: 'Successfully cached 24th rock sample "Lefroy Bay" with high probability of ancient microbial biosignatures',
      category: 'milestone',
      significance: 'high',
      date: new Date('2025-09-05'),
      missionPhase: 'Sample Collection',
      relatedInstrument: 'Sampling System'
    },
    {
      id: 'methane-plume',
      title: 'Atmospheric Methane Spike',
      description: 'MOXIE detected unusual methane concentration suggesting seasonal geological activity',
      category: 'science',
      significance: 'medium',
      date: new Date('2025-09-02'),
      relatedInstrument: 'MOXIE'
    },
    {
      id: 'ingenuity-flight-67',
      title: 'Ingenuity Flight 67 Success',
      description: 'Helicopter completed record-breaking 18-minute flight over challenging crater terrain',
      category: 'engineering',
      significance: 'high',
      date: new Date('2025-08-30'),
      relatedInstrument: 'Ingenuity Helicopter'
    }
  ],

  'curiosity': async () => [
    {
      id: 'sulfur-crystals',
      title: 'Pure Sulfur Crystal Discovery',
      description: 'First discovery of pure sulfur crystals on Mars surface, revealing unexpected geological processes',
      category: 'science',
      significance: 'breakthrough',
      date: new Date('2025-09-07'),
      missionPhase: 'Gediz Vallis Ridge',
      relatedInstrument: 'ChemCam'
    },
    {
      id: 'seasonal-methane',
      title: 'Methane Seasonal Pattern Confirmed',
      description: 'TLS confirms repeating seasonal methane cycle with 2.8x concentration variation',
      category: 'science',
      significance: 'high',
      date: new Date('2025-09-01'),
      relatedInstrument: 'SAM-TLS'
    },
    {
      id: 'wheel-durability',
      title: 'Wheel Performance Update',
      description: 'After 12+ years, wheels show remarkable durability with 85% tread remaining',
      category: 'engineering',
      significance: 'medium',
      date: new Date('2025-08-28'),
      missionPhase: 'Extended Mission'
    }
  ],

  'mars-reconnaissance-orbiter': async () => [
    {
      id: 'recurring-slope-lineae',
      title: 'Seasonal Water Activity Mapped',
      description: 'HiRISE confirms 127 new recurring slope lineae sites suggesting active subsurface water',
      category: 'science',
      significance: 'breakthrough',
      date: new Date('2025-09-09'),
      relatedInstrument: 'HiRISE'
    },
    {
      id: 'polar-ice-analysis',
      title: 'Polar Ice Cap Evolution',
      description: 'CRISM spectroscopy reveals 3,000-year climate cycle in north polar layered deposits',
      category: 'science',
      significance: 'high',
      date: new Date('2025-09-04'),
      relatedInstrument: 'CRISM'
    },
    {
      id: 'dust-devil-tracking',
      title: 'Dust Devil Formation Study',
      description: 'CTX camera captured complete dust devil lifecycle from formation to dissipation',
      category: 'science',
      significance: 'medium',
      date: new Date('2025-08-25'),
      relatedInstrument: 'CTX'
    }
  ],

  'maven': async () => [
    {
      id: 'atmospheric-escape-rate',
      title: 'Atmospheric Loss Rate Refined',
      description: 'NGIMS measurements show Mars loses 2 kg/s of atmosphere during solar maximum periods',
      category: 'science',
      significance: 'breakthrough',
      date: new Date('2025-09-06'),
      relatedInstrument: 'NGIMS'
    },
    {
      id: 'aurora-discovery',
      title: 'Discrete Aurora Phenomenon',
      description: 'IUVS discovered localized aurora events linked to crustal magnetic anomalies',
      category: 'science',
      significance: 'high',
      date: new Date('2025-08-29'),
      relatedInstrument: 'IUVS'
    },
    {
      id: 'solar-wind-interaction',
      title: 'Solar Wind Deflection Mapped',
      description: 'SWIA measured complete solar wind interaction patterns during recent solar storm',
      category: 'science',
      significance: 'medium',
      date: new Date('2025-08-22'),
      relatedInstrument: 'SWIA'
    }
  ],

  'mars-odyssey': async () => [
    {
      id: 'subsurface-ice-map',
      title: 'Global Subsurface Ice Map Updated',
      description: 'Neutron spectrometer completes most detailed map of subsurface water ice distribution',
      category: 'science',
      significance: 'breakthrough',
      date: new Date('2025-09-10'),
      relatedInstrument: 'Neutron Spectrometer'
    },
    {
      id: 'thermal-emission-anomaly',
      title: 'Thermal Anomaly Investigation',
      description: 'THEMIS detected unexpected thermal signatures in Valles Marineris suggesting active geology',
      category: 'science',
      significance: 'high',
      date: new Date('2025-09-03'),
      relatedInstrument: 'THEMIS'
    },
    {
      id: 'mission-longevity',
      title: '24-Year Operation Milestone',
      description: 'Odyssey celebrates 24 years of continuous Mars operations, far exceeding design life',
      category: 'milestone',
      significance: 'high',
      date: new Date('2025-08-24'),
      missionPhase: 'Extended Mission'
    }
  ],

  'james-webb-space-telescope': async () => [
    {
      id: 'earliest-galaxy',
      title: 'Most Distant Galaxy Confirmed',
      description: 'NIRSpec confirms galaxy JADES-GS-z13-0 at redshift 13.2, formed 325 million years after Big Bang',
      category: 'science',
      significance: 'breakthrough',
      date: new Date('2025-09-08'),
      relatedInstrument: 'NIRSpec'
    },
    {
      id: 'exoplanet-atmosphere',
      title: 'Exoplanet Atmosphere Mapped',
      description: 'NIRISS successfully mapped water vapor and clouds in WASP-96b atmosphere',
      category: 'science',
      significance: 'high',
      date: new Date('2025-09-04'),
      relatedInstrument: 'NIRISS'
    },
    {
      id: 'star-formation-nursery',
      title: 'Star Formation Process Revealed',
      description: 'NIRCam captured unprecedented detail of stellar nursery in Carina Nebula',
      category: 'imagery',
      significance: 'high',
      date: new Date('2025-08-31'),
      relatedInstrument: 'NIRCam'
    },
    {
      id: 'gravitational-lensing',
      title: 'Gravitational Lens Discovery',
      description: 'MIRI identified new gravitational lensing system magnifying background galaxies 15x',
      category: 'science',
      significance: 'medium',
      date: new Date('2025-08-26'),
      relatedInstrument: 'MIRI'
    }
  ],

  'voyager-1': async () => [
    {
      id: 'interstellar-plasma',
      title: 'Interstellar Plasma Density Study',
      description: 'PWS measurements reveal plasma density variations suggesting interstellar weather patterns',
      category: 'science',
      significance: 'high',
      date: new Date('2025-09-05'),
      relatedInstrument: 'Plasma Wave System'
    },
    {
      id: 'power-management',
      title: 'Power Conservation Success',
      description: 'Successfully extended mission life by optimizing power usage and instrument scheduling',
      category: 'engineering',
      significance: 'high',
      date: new Date('2025-08-20'),
      missionPhase: 'Interstellar Mission'
    }
  ],

  'voyager-2': async () => [
    {
      id: 'heliopause-boundary',
      title: 'Heliopause Structure Analysis',
      description: 'MAG instrument reveals complex magnetic field structure at interstellar boundary',
      category: 'science',
      significance: 'high',
      date: new Date('2025-09-02'),
      relatedInstrument: 'Magnetometer'
    },
    {
      id: 'cosmic-ray-increase',
      title: 'Cosmic Ray Intensity Surge',
      description: 'CRS detected 15% increase in galactic cosmic ray intensity over past solar minimum',
      category: 'science',
      significance: 'medium',
      date: new Date('2025-08-18'),
      relatedInstrument: 'Cosmic Ray System'
    }
  ],

  'parker-solar-probe': async () => [
    {
      id: 'solar-wind-origin',
      title: 'Solar Wind Source Identified',
      description: 'SWEAP pinpointed coronal holes as primary source of fast solar wind streams',
      category: 'science',
      significance: 'breakthrough',
      date: new Date('2025-09-07'),
      relatedInstrument: 'SWEAP'
    },
    {
      id: 'magnetic-switchbacks',
      title: 'Magnetic Switchback Formation',
      description: 'FIELDS revealed mechanism behind mysterious magnetic field reversals in solar wind',
      category: 'science',
      significance: 'high',
      date: new Date('2025-08-27'),
      relatedInstrument: 'FIELDS'
    },
    {
      id: 'perihelion-25',
      title: 'Record-Breaking Perihelion',
      description: 'Completed 25th closest approach to Sun, reaching 7.26 million km from solar surface',
      category: 'milestone',
      significance: 'high',
      date: new Date('2025-08-15'),
      missionPhase: 'Solar Encounter'
    }
  ]
};

export function DiscoveryFeed({ missionId, className = '', maxItems = 3 }: DiscoveryFeedProps) {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDiscoveries() {
      const cacheKey = `discoveries-${missionId}`;
      
      try {
        PerformanceMonitor.markStart(`fetch-${missionId}-discoveries`);
        
        let data = ClientCache.get<Discovery[]>(cacheKey);
        
        if (!data && discoveryData[missionId]) {
          data = await discoveryData[missionId]();
          ClientCache.set(cacheKey, data, 10 * 60 * 1000); // 10 minute cache
        }
        
        if (data) {
          setDiscoveries(data.slice(0, maxItems));
        }
        
        PerformanceMonitor.markEnd(`fetch-${missionId}-discoveries`);
      } catch (error) {
        console.warn(`Failed to fetch discoveries for ${missionId}:`, error);
      } finally {
        setLoading(false);
      }
    }

    fetchDiscoveries();
    const interval = setInterval(fetchDiscoveries, 10 * 60 * 1000); // Refresh every 10 minutes
    return () => clearInterval(interval);
  }, [missionId, maxItems]);

  useEffect(() => {
    if (discoveries.length > 1) {
      const rotationInterval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % discoveries.length);
      }, 12000); // Rotate every 12 seconds
      
      return () => clearInterval(rotationInterval);
    }
  }, [discoveries.length]);

  if (loading || discoveries.length === 0) {
    return (
      <div className={`bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-28 mb-3"></div>
          <div className="h-5 bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const currentDiscovery = discoveries[currentIndex];
  
  const significanceColors = {
    low: 'text-gray-400 bg-gray-500/20',
    medium: 'text-blue-400 bg-blue-500/20',
    high: 'text-yellow-400 bg-yellow-500/20',
    breakthrough: 'text-purple-400 bg-purple-500/20'
  };

  const categoryLabels = {
    science: 'Science',
    engineering: 'Engineering',
    milestone: 'Milestone',
    imagery: 'Imagery'
  };

  const formatDate = (date: Date | string) => {
    const now = new Date();
    const targetDate = date instanceof Date ? date : new Date(date);
    const diffDays = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return targetDate.toLocaleDateString();
  };

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300">Latest Discoveries</h3>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-400`}>
            {categoryLabels[currentDiscovery.category]}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${significanceColors[currentDiscovery.significance]}`}>
            {currentDiscovery.significance}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentDiscovery.id}-${currentIndex}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.6 }}
          className="space-y-3"
        >
          <h4 className="text-lg font-semibold text-white leading-tight">
            {currentDiscovery.title}
          </h4>
          
          <p className="text-sm text-gray-300 leading-relaxed">
            {currentDiscovery.description}
          </p>
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
            <div className="text-xs text-gray-500">
              {currentDiscovery.relatedInstrument && (
                <span className="text-blue-400">{currentDiscovery.relatedInstrument}</span>
              )}
              {currentDiscovery.missionPhase && (
                <span className="ml-2 text-gray-400">• {currentDiscovery.missionPhase}</span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(currentDiscovery.date)}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {discoveries.length > 1 && (
        <div className="flex justify-center mt-4 space-x-1">
          {discoveries.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-purple-400' : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}