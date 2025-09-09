'use client';

import { useEffect, useState } from 'react';
import type { DSNStation } from '@/lib/api/dsn';

interface EarthGlobeProps {
  stations: DSNStation[];
}

export function EarthGlobe({ stations }: EarthGlobeProps) {
  const [Globe3D, setGlobe3D] = useState<React.ComponentType<{ stations: DSNStation[] }> | null>(null);

  useEffect(() => {
    // Only load Three.js components on client side
    if (typeof window !== 'undefined') {
      import('./EarthGlobe3D').then(mod => {
        setGlobe3D(() => mod.default);
      });
    }
  }, []);

  if (!Globe3D) {
    return (
      <div className="w-full h-96 bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-gray-400">Loading 3D visualization...</div>
      </div>
    );
  }

  return <Globe3D stations={stations} />;
}