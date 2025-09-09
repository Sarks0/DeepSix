'use client';

import dynamic from 'next/dynamic';
import type { DSNStation } from '@/lib/api/dsn';

// Dynamic import for the 3D component to avoid SSR issues
const EarthGlobe3D = dynamic(() => import('./EarthGlobe3D').then(mod => mod.default), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-900 rounded-lg flex items-center justify-center">
      <div className="text-gray-400">Loading 3D visualization...</div>
    </div>
  )
});

interface EarthGlobeProps {
  stations: DSNStation[];
}

export function EarthGlobe({ stations }: EarthGlobeProps) {
  return <EarthGlobe3D stations={stations} />;
}