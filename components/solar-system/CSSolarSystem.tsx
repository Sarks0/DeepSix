'use client';

import { useState } from 'react';

export function CSSolarSystem({ className = 'w-full h-full' }) {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);

  const planets = [
    { name: 'Mercury', size: 8, orbit: 60, color: 'bg-gray-400', speed: '4s', distance: '0.39 AU' },
    { name: 'Venus', size: 14, orbit: 90, color: 'bg-yellow-200', speed: '7s', distance: '0.72 AU' },
    { name: 'Earth', size: 14, orbit: 120, color: 'bg-blue-500', speed: '10s', distance: '1.0 AU' },
    { name: 'Mars', size: 10, orbit: 150, color: 'bg-red-500', speed: '15s', distance: '1.52 AU' },
    { name: 'Jupiter', size: 28, orbit: 200, color: 'bg-orange-300', speed: '30s', distance: '5.20 AU' },
    { name: 'Saturn', size: 24, orbit: 250, color: 'bg-yellow-600', speed: '45s', distance: '9.54 AU' },
    { name: 'Uranus', size: 18, orbit: 300, color: 'bg-cyan-400', speed: '60s', distance: '19.2 AU' },
    { name: 'Neptune', size: 18, orbit: 350, color: 'bg-blue-700', speed: '90s', distance: '30.1 AU' },
  ];

  return (
    <div className={`${className} bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden relative`}>
      {/* Stars background */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: Math.random() * 2 + 'px',
              height: Math.random() * 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: (Math.random() * 3 + 2) + 's',
            }}
          />
        ))}
      </div>

      {/* Solar System Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Sun */}
        <div className="absolute w-12 h-12 bg-yellow-400 rounded-full shadow-2xl"
          style={{
            boxShadow: '0 0 60px #FDB813, 0 0 100px #FDB813',
          }}
        >
          <div className="absolute inset-0 bg-yellow-300 rounded-full animate-pulse" />
        </div>

        {/* Planets */}
        {planets.map((planet) => (
          <div key={planet.name}>
            {/* Orbit */}
            <div
              className="absolute border border-gray-700/30 rounded-full"
              style={{
                width: `${planet.orbit * 2}px`,
                height: `${planet.orbit * 2}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
            
            {/* Planet Container */}
            <div
              className="absolute"
              style={{
                width: `${planet.orbit * 2}px`,
                height: `${planet.orbit * 2}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `orbit ${planet.speed} linear infinite`,
              }}
            >
              {/* Planet */}
              <div
                className={`absolute ${planet.color} rounded-full cursor-pointer transition-transform hover:scale-125`}
                style={{
                  width: `${planet.size}px`,
                  height: `${planet.size}px`,
                  top: `-${planet.size / 2}px`,
                  left: `calc(50% - ${planet.size / 2}px)`,
                }}
                onClick={() => setSelectedPlanet(planet.name)}
                title={planet.name}
              >
                {/* Saturn's rings */}
                {planet.name === 'Saturn' && (
                  <div
                    className="absolute border-2 border-yellow-700/50 rounded-full"
                    style={{
                      width: `${planet.size * 1.6}px`,
                      height: `${planet.size * 0.6}px`,
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Planet Info Panel */}
      {selectedPlanet && (
        <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 p-4 max-w-sm">
          <h3 className="text-lg font-bold text-white mb-2">{selectedPlanet}</h3>
          <p className="text-sm text-gray-300">
            Distance from Sun: {planets.find(p => p.name === selectedPlanet)?.distance}
          </p>
          <button
            onClick={() => setSelectedPlanet(null)}
            className="mt-2 text-xs text-gray-400 hover:text-white"
          >
            Click to close
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700 p-3">
        <h3 className="text-xs font-bold text-white mb-2">Planets</h3>
        <div className="space-y-1">
          {planets.map((planet) => (
            <div key={planet.name} className="flex items-center gap-2">
              <div className={`w-2 h-2 ${planet.color} rounded-full`} />
              <span className="text-xs text-gray-300">{planet.name}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes orbit {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}