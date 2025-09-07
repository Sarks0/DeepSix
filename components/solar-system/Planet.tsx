'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { Text } from '@react-three/drei';
import {
  PlanetData,
  calculateOrbitalPosition,
  calculatePlanetScale,
} from '@/lib/solar-system-data';

interface PlanetProps {
  data: PlanetData;
  time: number;
  showLabels: boolean;
  performanceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  focusTarget?: string | null;
}

export function Planet({ data, time, showLabels, performanceLevel, focusTarget }: PlanetProps) {
  const groupRef = useRef<Group>(null);
  const planetRef = useRef<Mesh>(null);

  // Calculate current orbital position
  const position = useMemo(() => {
    return calculateOrbitalPosition(data.distance, time, data.orbitalSpeed);
  }, [data.distance, time, data.orbitalSpeed]);

  // Scale planet appropriately
  const scale = useMemo(() => {
    return calculatePlanetScale(data.radius);
  }, [data.radius]);

  // Performance-based detail levels
  const segments = useMemo(() => {
    switch (performanceLevel) {
      case 'HIGH':
        return 64;
      case 'MEDIUM':
        return 32;
      case 'LOW':
        return 16;
      default:
        return 32;
    }
  }, [performanceLevel]);

  // Animate planet rotation
  useFrame((state, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * data.rotationSpeed * 0.1;
    }

    if (groupRef.current) {
      groupRef.current.position.set(...position);

      // Apply axial tilt
      groupRef.current.rotation.z = (data.tilt * Math.PI) / 180;
    }
  });

  // Check if this planet is focused
  const isFocused = focusTarget === data.name;
  const labelScale = isFocused ? 1.5 : 1.0;

  return (
    <group ref={groupRef} name={data.name}>
      {/* Planet sphere */}
      <mesh ref={planetRef} castShadow receiveShadow>
        <sphereGeometry args={[scale, segments, segments]} />
        <meshStandardMaterial
          color={data.color}
          roughness={0.8}
          metalness={0.1}
          emissive={data.name === 'Sun' ? data.color : '#000000'}
          emissiveIntensity={data.name === 'Sun' ? 0.5 : 0}
        />
      </mesh>

      {/* Planet rings for gas giants */}
      {data.hasRings && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 1.5, scale * 2.5, 64]} />
          <meshStandardMaterial
            color={data.color}
            opacity={0.6}
            transparent
            side={2} // DoubleSide
          />
        </mesh>
      )}

      {/* Planet label */}
      {showLabels && (
        <Text
          position={[0, scale + 0.5, 0]}
          fontSize={0.3 * labelScale}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          {data.name}
          {data.moons && data.moons > 0 && (
            <Text
              position={[0, -0.4, 0]}
              fontSize={0.2}
              color="#888888"
              anchorX="center"
              anchorY="middle"
            >
              {data.moons} moon{data.moons > 1 ? 's' : ''}
            </Text>
          )}
        </Text>
      )}

      {/* Subtle glow effect for focused planet */}
      {isFocused && (
        <mesh>
          <sphereGeometry args={[scale * 1.1, 16, 16]} />
          <meshBasicMaterial color={data.color} transparent opacity={0.2} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
