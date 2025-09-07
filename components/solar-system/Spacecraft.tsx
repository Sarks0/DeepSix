'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { Text } from '@react-three/drei';
import { SpacecraftData, PLANETS, calculateOrbitalPosition } from '@/lib/solar-system-data';

interface SpacecraftProps {
  data: SpacecraftData;
  time: number;
  showLabels: boolean;
  focusTarget?: string | null;
}

export function Spacecraft({ data, time, showLabels, focusTarget }: SpacecraftProps) {
  const groupRef = useRef<Group>(null);
  const spacecraftRef = useRef<Mesh>(null);

  // Generate a stable unique offset for each spacecraft based on its name
  const uniqueOffset = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < data.name.length; i++) {
      hash = (hash << 5) - hash + data.name.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return {
      angle: (hash % 360) * (Math.PI / 180), // Convert to radians
      radius: 0.3 + Math.abs(hash % 5) * 0.15, // Vary radius between 0.3 and 1.05
      height: (hash % 3) * 0.2 - 0.2, // Vary height between -0.2 and 0.2
    };
  }, [data.name]);

  // Calculate spacecraft position based on type and location
  const position = useMemo((): [number, number, number] => {
    if (data.location.planet) {
      // Spacecraft on or orbiting a planet
      const planet = PLANETS.find((p) => p.name === data.location.planet);
      if (planet) {
        const planetPos = calculateOrbitalPosition(planet.distance, time, planet.orbitalSpeed);

        // For rovers, place them at specific locations on the planet surface
        if (data.type === 'rover') {
          // Different positioning for each rover to simulate different landing sites
          const roverOffset =
            data.name === 'Perseverance'
              ? { angle: 0, radius: 0.4, height: 0.1 } // Jezero Crater position
              : { angle: Math.PI, radius: 0.5, height: -0.1 }; // Gale Crater position (opposite side)

          // Keep rovers on the surface, rotating with the planet
          const surfaceAngle = roverOffset.angle + time * 0.2; // Slow rotation with Mars
          return [
            planetPos[0] + Math.cos(surfaceAngle) * roverOffset.radius,
            planetPos[1] + roverOffset.height,
            planetPos[2] + Math.sin(surfaceAngle) * roverOffset.radius,
          ];
        } else {
          // Orbiters circle the planet
          const orbitAngle = uniqueOffset.angle + time * 1.5;
          return [
            planetPos[0] + Math.cos(orbitAngle) * uniqueOffset.radius * 1.5,
            planetPos[1] + uniqueOffset.height,
            planetPos[2] + Math.sin(orbitAngle) * uniqueOffset.radius * 1.5,
          ];
        }
      }
    } else if (data.location.distance) {
      // Deep space probe - use stable positioning
      const baseAngle = uniqueOffset.angle;
      const angle = baseAngle + time * 0.0005; // Very slow orbit
      const distance = data.location.distance * 10; // scale factor
      return [
        Math.cos(angle) * distance,
        Math.sin(baseAngle) * 2, // Fixed vertical offset based on unique angle
        Math.sin(angle) * distance,
      ];
    } else if (data.location.position) {
      return data.location.position;
    }

    return [0, 0, 0];
  }, [data, time, uniqueOffset]);

  // Animate spacecraft (subtle rotation only)
  useFrame((state, delta) => {
    if (spacecraftRef.current) {
      spacecraftRef.current.rotation.y += delta * 0.3; // Slower rotation

      // Very subtle pulsing effect for active spacecraft
      if (data.status === 'active') {
        const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.02 + 1; // Much smaller pulse
        spacecraftRef.current.scale.setScalar(pulse);
      }
    }

    if (groupRef.current) {
      groupRef.current.position.set(...position);
    }
  });

  // Get spacecraft shape based on type
  const getSpacecraftGeometry = () => {
    switch (data.type) {
      case 'rover':
        return <boxGeometry args={[0.1, 0.05, 0.15]} />;
      case 'probe':
        return <coneGeometry args={[0.05, 0.2, 8]} />;
      case 'orbiter':
        return <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />;
      default:
        return <sphereGeometry args={[0.05]} />;
    }
  };

  const isFocused = focusTarget === data.name;
  const labelScale = isFocused ? 1.5 : 1.0;

  // Status indicator color
  const getStatusColor = () => {
    switch (data.status) {
      case 'active':
        return '#00FF00';
      case 'inactive':
        return '#FFAA00';
      case 'lost':
        return '#FF4444';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <group ref={groupRef} name={data.name}>
      {/* Main spacecraft body */}
      <mesh ref={spacecraftRef}>
        {getSpacecraftGeometry()}
        <meshStandardMaterial
          color={data.color}
          metalness={0.8}
          roughness={0.2}
          emissive={data.status === 'active' ? data.color : '#000000'}
          emissiveIntensity={data.status === 'active' ? 0.1 : 0}
        />
      </mesh>

      {/* Status indicator light */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.02]} />
        <meshBasicMaterial
          color={getStatusColor()}
          transparent
          opacity={data.status === 'active' ? 1 : 0.5}
        />
      </mesh>

      {/* Solar panels for probes */}
      {data.type === 'probe' && (
        <>
          <mesh position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <planeGeometry args={[0.2, 0.08]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <planeGeometry args={[0.2, 0.08]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
          </mesh>
        </>
      )}

      {/* Communication trail for active spacecraft */}
      {data.status === 'active' && (
        <mesh position={[0, -0.1, 0]}>
          <coneGeometry args={[0.02, 0.5, 4]} />
          <meshBasicMaterial color={data.color} transparent opacity={0.3} depthWrite={false} />
        </mesh>
      )}

      {/* Spacecraft label */}
      {showLabels && (
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.15 * labelScale}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="black"
        >
          {data.name}
          <Text
            position={[0, -0.2, 0]}
            fontSize={0.1}
            color={getStatusColor()}
            anchorX="center"
            anchorY="middle"
          >
            {data.status.toUpperCase()}
          </Text>
          <Text
            position={[0, -0.35, 0]}
            fontSize={0.08}
            color="#888888"
            anchorX="center"
            anchorY="middle"
          >
            {data.mission}
          </Text>
        </Text>
      )}

      {/* Focus highlight */}
      {isFocused && (
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color={data.color} transparent opacity={0.2} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
