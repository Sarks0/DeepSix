'use client';

import dynamic from 'next/dynamic';

// Dynamic import for Three.js component to avoid SSR issues
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

export default function SolarSystemPage() {
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
        <SimpleSolarSystem className="w-full h-full" />
        
        {/* Controls Info */}
        <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700 p-4 max-w-sm">
          <h3 className="text-sm font-bold text-white mb-2">Controls</h3>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>🖱️ Left Click + Drag: Rotate view</li>
            <li>🖱️ Right Click + Drag: Pan camera</li>
            <li>🖱️ Scroll: Zoom in/out</li>
          </ul>
        </div>

        {/* Performance Info */}
        <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700 p-3">
          <div className="text-xs text-gray-400">
            <div>Optimized for performance</div>
            <div className="text-green-400">Low power mode</div>
          </div>
        </div>
      </div>
    </div>
  );
}