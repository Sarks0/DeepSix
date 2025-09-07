'use client';

import { useState } from 'react';
import { PLANETS, SPACECRAFT } from '@/lib/solar-system-data';

interface SolarSystemControlsProps {
  showOrbits: boolean;
  showLabels: boolean;
  showSpacecraft: boolean;
  autoRotate: boolean;
  timeSpeed: number;
  focusTarget: string | null;
  onShowOrbitsChange: (show: boolean) => void;
  onShowLabelsChange: (show: boolean) => void;
  onShowSpacecraftChange: (show: boolean) => void;
  onAutoRotateChange: (rotate: boolean) => void;
  onTimeSpeedChange: (speed: number) => void;
  onFocusChange: (target: string | null) => void;
}

export function SolarSystemControls({
  showOrbits,
  showLabels,
  showSpacecraft,
  autoRotate,
  timeSpeed,
  focusTarget,
  onShowOrbitsChange,
  onShowLabelsChange,
  onShowSpacecraftChange,
  onAutoRotateChange,
  onTimeSpeedChange,
  onFocusChange,
}: SolarSystemControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const allTargets = [
    { name: 'Sun', type: 'star' },
    ...PLANETS.map((p) => ({ name: p.name, type: 'planet' })),
    ...SPACECRAFT.map((s) => ({ name: s.name, type: 'spacecraft' })),
  ];

  return (
    <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 text-white">
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-800 rounded-lg transition-colors"
      >
        <span className="font-semibold">Solar System Controls</span>
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded controls */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-700 space-y-4">
          {/* Display toggles */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-300">Display Options</h3>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOrbits}
                onChange={(e) => onShowOrbitsChange(e.target.checked)}
                className="w-4 h-4 rounded border-gray-500 bg-gray-800"
              />
              <span className="text-sm">Show Orbital Paths</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => onShowLabelsChange(e.target.checked)}
                className="w-4 h-4 rounded border-gray-500 bg-gray-800"
              />
              <span className="text-sm">Show Labels</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showSpacecraft}
                onChange={(e) => onShowSpacecraftChange(e.target.checked)}
                className="w-4 h-4 rounded border-gray-500 bg-gray-800"
              />
              <span className="text-sm">Show Spacecraft</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRotate}
                onChange={(e) => onAutoRotateChange(e.target.checked)}
                className="w-4 h-4 rounded border-gray-500 bg-gray-800"
              />
              <span className="text-sm">Auto Rotate</span>
            </label>
          </div>

          {/* Time speed control */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-300">Animation Speed</h3>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={timeSpeed}
                onChange={(e) => onTimeSpeedChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-mono w-8">{timeSpeed.toFixed(1)}x</span>
            </div>
          </div>

          {/* Focus target selection */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-300">Focus Target</h3>
            <select
              value={focusTarget || ''}
              onChange={(e) => onFocusChange(e.target.value || null)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm"
            >
              <option value="">Free Camera</option>
              {allTargets.map((target) => (
                <option key={target.name} value={target.name}>
                  {target.name} ({target.type})
                </option>
              ))}
            </select>
          </div>

          {/* Quick focus buttons */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-300">Quick Focus</h3>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => onFocusChange('Sun')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  focusTarget === 'Sun'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                Sun
              </button>
              <button
                onClick={() => onFocusChange('Earth')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  focusTarget === 'Earth'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                Earth
              </button>
              <button
                onClick={() => onFocusChange('Mars')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  focusTarget === 'Mars'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                Mars
              </button>
              <button
                onClick={() => onFocusChange('Jupiter')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  focusTarget === 'Jupiter'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                Jupiter
              </button>
            </div>
          </div>

          {/* Mission info */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-300">Active Missions</h3>
            <div className="space-y-1">
              {SPACECRAFT.filter((s) => s.status === 'active').map((spacecraft) => (
                <button
                  key={spacecraft.name}
                  onClick={() => onFocusChange(spacecraft.name)}
                  className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                    focusTarget === spacecraft.name
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>{spacecraft.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-400 space-y-1">
            <div>🖱️ Click and drag to rotate</div>
            <div>🔍 Scroll to zoom in/out</div>
            <div>🎯 Click objects to focus</div>
          </div>
        </div>
      )}
    </div>
  );
}
