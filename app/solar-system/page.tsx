'use client';

import { CSSolarSystem } from '@/components/solar-system/CSSolarSystem';

export default function SolarSystemPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative z-10 p-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-orange-400 bg-clip-text text-transparent">
          Solar System Explorer
        </h1>
        <p className="text-gray-400 mt-2">
          Interactive visualization of our solar system
        </p>
      </div>

      {/* Main Solar System Container */}
      <div className="relative w-full h-[calc(100vh-120px)]">
        <CSSolarSystem className="w-full h-full" />
        
        {/* Controls Info */}
        <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700 p-4 max-w-sm">
          <h3 className="text-sm font-bold text-white mb-2">Interactive Features</h3>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>🌍 Click on any planet to see details</li>
            <li>🌌 Watch planets orbit around the sun</li>
            <li>📏 Realistic relative distances</li>
          </ul>
        </div>
      </div>
    </div>
  );
}