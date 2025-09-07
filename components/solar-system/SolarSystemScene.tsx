'use client';

import { Suspense, useState, useRef, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { Sun } from './Sun';
import { Planet } from './Planet';
import { Spacecraft } from './Spacecraft';
import { Starfield } from './Starfield';
import { OrbitPath } from './OrbitPath';
import { CameraController } from './CameraController';
import { PLANETS, SPACECRAFT, PerformanceLevel } from '@/lib/solar-system-data';

interface SolarSystemProps {
  showOrbits: boolean;
  showLabels: boolean;
  showSpacecraft: boolean;
  autoRotate: boolean;
  timeSpeed: number;
  focusTarget?: string | null;
  onFocusChange?: (target: string | null) => void;
  performanceLevel: PerformanceLevel;
}

// This component contains all the Three.js elements and must be inside Canvas
function SolarSystemContent({
  showOrbits,
  showLabels,
  showSpacecraft,
  autoRotate,
  timeSpeed,
  focusTarget,
  onFocusChange,
  performanceLevel,
}: SolarSystemProps) {
  const [time, setTime] = useState(0);
  const groupRef = useRef<Group>(null);

  // Animate time for orbital mechanics
  useFrame((state, delta) => {
    setTime((prev) => prev + delta * timeSpeed);

    // Auto-rotation of the entire solar system
    if (autoRotate && groupRef.current && !focusTarget) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  // Handle clicking on objects to focus
  const handleObjectClick = useCallback(
    (objectName: string) => {
      if (onFocusChange) {
        onFocusChange(focusTarget === objectName ? null : objectName);
      }
    },
    [focusTarget, onFocusChange]
  );

  return (
    <group ref={groupRef}>
      {/* Starfield background */}
      <Starfield performanceLevel={performanceLevel} />

      {/* Central Sun */}
      <group onClick={() => handleObjectClick('Sun')}>
        <Sun
          showLabels={showLabels}
          performanceLevel={performanceLevel}
          focusTarget={focusTarget}
        />
      </group>

      {/* Planets and their orbital paths */}
      {PLANETS.map((planet) => (
        <group key={planet.name}>
          {/* Orbital path */}
          {showOrbits && <OrbitPath distance={planet.distance} visible={showOrbits} />}

          {/* Planet */}
          <group onClick={() => handleObjectClick(planet.name)}>
            <Planet
              data={planet}
              time={time}
              showLabels={showLabels}
              performanceLevel={performanceLevel}
              focusTarget={focusTarget}
            />
          </group>
        </group>
      ))}

      {/* Spacecraft */}
      {showSpacecraft &&
        SPACECRAFT.map((spacecraft) => (
          <group key={spacecraft.name} onClick={() => handleObjectClick(spacecraft.name)}>
            <Spacecraft
              data={spacecraft}
              time={time}
              showLabels={showLabels}
              focusTarget={focusTarget}
            />
          </group>
        ))}

      {/* Camera controls */}
      <CameraController focusTarget={focusTarget || null} autoRotate={autoRotate} />

      {/* Additional lighting */}
      <hemisphereLight color="#ffffff" groundColor="#404040" intensity={0.3} />
    </group>
  );
}

interface SolarSystemSceneProps {
  className?: string;
  showOrbits: boolean;
  showLabels: boolean;
  showSpacecraft: boolean;
  autoRotate: boolean;
  timeSpeed: number;
  focusTarget?: string | null;
  onFocusChange?: (target: string | null) => void;
}

export function SolarSystemScene({
  className = 'w-full h-full',
  showOrbits = true,
  showLabels = true,
  showSpacecraft = true,
  autoRotate = false,
  timeSpeed = 1,
  focusTarget,
  onFocusChange,
}: SolarSystemSceneProps) {
  const [performanceLevel, setPerformanceLevel] = useState<PerformanceLevel>('HIGH');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Hide any external loading overlays that might be covering the scene
    const hideExternalLoadingOverlays = () => {
      const loadingOverlays = document.querySelectorAll('div.absolute.inset-0');
      loadingOverlays.forEach((overlay) => {
        const overlayEl = overlay as HTMLElement;
        if (
          overlayEl.style.background?.includes('black') ||
          overlayEl.classList.contains('bg-black') ||
          overlayEl.textContent?.includes('Loading Solar System')
        ) {
          overlayEl.style.display = 'none';
          // Hidden external loading overlay
        }
      });
    };

    // Hide immediately and after a delay to ensure Canvas is ready
    hideExternalLoadingOverlays();
    const timer = setTimeout(hideExternalLoadingOverlays, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Performance Monitor - Outside Canvas */}
      <div className="absolute top-4 left-4 bg-black/70 rounded-lg p-3 text-white font-mono text-sm backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Quality:</span>
            <span
              className={`font-bold ${
                performanceLevel === 'HIGH'
                  ? 'text-green-400'
                  : performanceLevel === 'MEDIUM'
                    ? 'text-yellow-400'
                    : 'text-red-400'
              }`}
            >
              {performanceLevel}
            </span>
          </div>

          <div className="flex gap-1">
            {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setPerformanceLevel(level)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  performanceLevel === level
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 20, 40], fov: 60 }}
        gl={{
          antialias: performanceLevel === 'HIGH',
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, performanceLevel === 'HIGH' ? 2 : 1]}
        shadows={performanceLevel === 'HIGH'}
        onCreated={() => {
          // Canvas is ready, hide any loading overlays
          const hideOverlays = () => {
            const loadingOverlays = document.querySelectorAll('div.absolute.inset-0');
            loadingOverlays.forEach((overlay) => {
              const overlayEl = overlay as HTMLElement;
              if (
                overlayEl.style.background?.includes('black') ||
                overlayEl.classList.contains('bg-black') ||
                overlayEl.textContent?.includes('Loading Solar System')
              ) {
                overlayEl.style.display = 'none';
                // Hidden loading overlay from Canvas onCreated
              }
            });
          };
          hideOverlays();
          setIsLoading(false);
        }}
      >
        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="#333333" wireframe />
            </mesh>
          }
        >
          <SolarSystemContent
            showOrbits={showOrbits}
            showLabels={showLabels}
            showSpacecraft={showSpacecraft}
            autoRotate={autoRotate}
            timeSpeed={timeSpeed}
            focusTarget={focusTarget}
            onFocusChange={onFocusChange}
            performanceLevel={performanceLevel}
          />
        </Suspense>
      </Canvas>

      {/* Controlled loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center pointer-events-none">
          <div className="text-white text-lg animate-pulse">Loading Solar System...</div>
        </div>
      )}
    </div>
  );
}
