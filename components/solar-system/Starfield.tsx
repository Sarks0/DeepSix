'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points } from 'three';
import { PerformanceLevel, PERFORMANCE_LEVELS } from '@/lib/solar-system-data';

interface StarfieldProps {
  performanceLevel: PerformanceLevel;
}

export function Starfield({ performanceLevel }: StarfieldProps) {
  const pointsRef = useRef<Points>(null);

  const { positions, colors, sizes } = useMemo(() => {
    const starCount = PERFORMANCE_LEVELS[performanceLevel].starCount;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    // Generate random star positions on a sphere
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;

      // Generate random point on sphere surface
      const radius = 500 + Math.random() * 500; // Distance from center
      const theta = Math.random() * Math.PI * 2; // Azimuth angle
      const phi = Math.acos(2 * Math.random() - 1); // Polar angle (uniform distribution)

      // Convert spherical to cartesian coordinates
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Star color variations (cooler to hotter stars)
      const temperature = Math.random();
      if (temperature < 0.3) {
        // Red stars
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.3 + Math.random() * 0.4;
        colors[i3 + 2] = 0.1 + Math.random() * 0.2;
      } else if (temperature < 0.6) {
        // Yellow/orange stars (like our Sun)
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i3 + 2] = 0.4 + Math.random() * 0.3;
      } else if (temperature < 0.85) {
        // White stars
        const intensity = 0.9 + Math.random() * 0.1;
        colors[i3] = intensity;
        colors[i3 + 1] = intensity;
        colors[i3 + 2] = intensity;
      } else {
        // Blue stars
        colors[i3] = 0.6 + Math.random() * 0.4;
        colors[i3 + 1] = 0.7 + Math.random() * 0.3;
        colors[i3 + 2] = 1.0;
      }

      // Star size based on apparent magnitude
      const magnitude = Math.random();
      sizes[i] =
        magnitude < 0.1
          ? 3.0 // Bright stars
          : magnitude < 0.3
            ? 2.0 // Medium stars
            : magnitude < 0.7
              ? 1.5 // Normal stars
              : 1.0; // Dim stars
    }

    return { positions, colors, sizes };
  }, [performanceLevel]);

  // Subtle rotation of the starfield
  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.0001;
      pointsRef.current.rotation.x += delta * 0.00005;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={1}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={2} // AdditiveBlending for glow effect
      />
    </points>
  );
}
