'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { DSNStation } from '@/lib/api/dsn';

const STATION_LOCATIONS: Record<string, { lat: number; lon: number }> = {
  gdscc: { lat: 35.4, lon: -116.9 }, // Goldstone, California
  mdscc: { lat: 40.4, lon: -4.2 },    // Madrid, Spain
  cdscc: { lat: -35.4, lon: 148.9 }   // Canberra, Australia
};

function Earth({ stations }: { stations: DSNStation[] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Convert lat/lon to 3D coordinates
  const latLonToVector3 = (lat: number, lon: number, radius: number = 1) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  // Station markers
  const stationMarkers = useMemo(() => {
    return stations.map(station => {
      const location = STATION_LOCATIONS[station.name];
      if (!location) return null;

      const position = latLonToVector3(location.lat, location.lon, 1.02);
      const hasActiveComms = station.dishes.some(dish => 
        dish.targets.some(t => t.spacecraft && t.spacecraft.length > 0)
      );

      return {
        position,
        name: station.friendlyName,
        active: hasActiveComms
      };
    }).filter(Boolean);
  }, [stations]);

  // Rotate the Earth
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Earth sphere */}
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <meshPhongMaterial
          color="#2563eb"
          emissive="#1e40af"
          emissiveIntensity={0.1}
          shininess={10}
        />
      </Sphere>

      {/* Atmosphere */}
      <Sphere args={[1.01, 64, 64]}>
        <meshPhongMaterial
          color="#60a5fa"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Station markers */}
      {stationMarkers.map((marker, idx) => marker && (
        <group key={idx}>
          {/* Station point */}
          <mesh position={marker.position}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshBasicMaterial
              color={marker.active ? '#10b981' : '#ef4444'}
            />
          </mesh>

          {/* Pulsing ring for active stations */}
          {marker.active && (
            <mesh position={marker.position}>
              <ringGeometry args={[0.03, 0.04, 32]} />
              <meshBasicMaterial
                color="#10b981"
                transparent
                opacity={0.5}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {/* Signal beam for active communications */}
          {marker.active && (
            <Line
              points={[marker.position, marker.position.clone().multiplyScalar(2)]}
              color="#60a5fa"
              lineWidth={1}
              transparent
              opacity={0.5}
            />
          )}
        </group>
      ))}

      {/* Grid lines */}
      <gridHelper args={[2, 10]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
}

interface EarthGlobeProps {
  stations: DSNStation[];
}

export default function EarthGlobe3D({ stations }: EarthGlobeProps) {
  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Earth stations={stations} />
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={5}
          autoRotate
          autoRotateSpeed={0.5}
        />
        
        {/* Stars background */}
        <mesh>
          <sphereGeometry args={[10, 32, 32]} />
          <meshBasicMaterial
            color="#000000"
            side={THREE.BackSide}
          />
        </mesh>
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-300">Active Station</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-300">Idle Station</span>
          </div>
        </div>
      </div>
    </div>
  );
}