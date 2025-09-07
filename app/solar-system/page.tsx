'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with comprehensive error handling
const SimpleSolarSystem = dynamic(
  () => import('@/components/solar-system/SimpleSolarSystem').then(mod => mod.SimpleSolarSystem),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading Solar System...</p>
          <p className="text-sm text-gray-400 mt-2">Initializing 3D visualization</p>
        </div>
      </div>
    ),
  }
);

// Static fallback component for when 3D fails
function StaticSolarSystem() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center p-8 max-w-2xl">
        <h2 className="text-3xl font-bold text-white mb-4">Solar System Overview</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="text-yellow-400 text-2xl mb-2">☀️</div>
            <h3 className="text-white font-semibold">Sun</h3>
            <p className="text-gray-400 text-sm">Our Star</p>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="text-gray-400 text-2xl mb-2">🪐</div>
            <h3 className="text-white font-semibold">Mercury</h3>
            <p className="text-gray-400 text-sm">0.39 AU</p>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="text-yellow-600 text-2xl mb-2">🪐</div>
            <h3 className="text-white font-semibold">Venus</h3>
            <p className="text-gray-400 text-sm">0.72 AU</p>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="text-blue-500 text-2xl mb-2">🌍</div>
            <h3 className="text-white font-semibold">Earth</h3>
            <p className="text-gray-400 text-sm">1.0 AU</p>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="text-red-500 text-2xl mb-2">🪐</div>
            <h3 className="text-white font-semibold">Mars</h3>
            <p className="text-gray-400 text-sm">1.52 AU</p>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="text-orange-400 text-2xl mb-2">🪐</div>
            <h3 className="text-white font-semibold">Jupiter</h3>
            <p className="text-gray-400 text-sm">5.20 AU</p>
          </div>
        </div>
        
        <p className="text-gray-500 mt-6 text-sm">
          3D visualization is currently unavailable. Showing static view.
        </p>
      </div>
    </div>
  );
}

export default function SolarSystemPage() {
  const [hasError, setHasError] = useState(false);
  const [is3DSupported, setIs3DSupported] = useState(true);

  useEffect(() => {
    // Check if WebGL is supported
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setIs3DSupported(false);
      }
    } catch (e) {
      setIs3DSupported(false);
    }

    // Global error handler for React Three Fiber issues
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('ReactCurrentBatchConfig') || 
          event.message.includes('THREE') ||
          event.message.includes('fiber')) {
        event.preventDefault();
        setHasError(true);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative z-10 p-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-orange-400 bg-clip-text text-transparent">
          3D Solar System Explorer
        </h1>
        <p className="text-gray-400 mt-2">
          Interactive visualization of our solar system
        </p>
      </div>

      {/* Main 3D Scene Container */}
      <div className="relative w-full h-[calc(100vh-120px)]">
        {!hasError && is3DSupported ? (
          <SimpleSolarSystem className="w-full h-full" />
        ) : (
          <StaticSolarSystem />
        )}
        
        {/* Controls Info - only show when 3D is working */}
        {!hasError && is3DSupported && (
          <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700 p-4 max-w-sm">
            <h3 className="text-sm font-bold text-white mb-2">Controls</h3>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>🖱️ Left Click + Drag: Rotate view</li>
              <li>🖱️ Right Click + Drag: Pan camera</li>
              <li>🖱️ Scroll: Zoom in/out</li>
            </ul>
          </div>
        )}

        {/* Performance Info */}
        <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700 p-3">
          <div className="text-xs text-gray-400">
            <div>Mode: {hasError || !is3DSupported ? 'Static' : '3D'}</div>
            <div className={hasError || !is3DSupported ? 'text-yellow-400' : 'text-green-400'}>
              {hasError ? 'Fallback mode' : is3DSupported ? 'Low power mode' : 'WebGL not supported'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}