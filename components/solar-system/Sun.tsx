'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Text } from '@react-three/drei';

interface SunProps {
  showLabels: boolean;
  performanceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  focusTarget?: string | null;
}

export function Sun({ showLabels, performanceLevel, focusTarget }: SunProps) {
  const sunRef = useRef<Mesh>(null);
  const coronaRef = useRef<Mesh>(null);

  // Animate sun rotation and corona pulsing
  useFrame((state, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.1;
    }

    if (coronaRef.current) {
      coronaRef.current.rotation.y -= delta * 0.05;
      // Subtle pulsing effect
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.05 + 1;
      coronaRef.current.scale.setScalar(pulse);
    }
  });

  // Performance-based detail levels
  const segments = performanceLevel === 'HIGH' ? 64 : performanceLevel === 'MEDIUM' ? 32 : 16;

  const isFocused = focusTarget === 'Sun';
  const labelScale = isFocused ? 1.5 : 1.0;

  return (
    <group position={[0, 0, 0]} name="Sun">
      {/* Main Sun sphere */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[2, segments, segments]} />
        <meshStandardMaterial color="#FDB813" emissive="#FDB813" emissiveIntensity={0.8} />
      </mesh>

      {/* Sun corona/atmosphere effect */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[2.3, 32, 32]} />
        <meshBasicMaterial color="#FFE135" transparent opacity={0.3} depthWrite={false} />
      </mesh>

      {/* Solar flare particles effect (high performance only) */}
      {performanceLevel === 'HIGH' && (
        <mesh>
          <sphereGeometry args={[2.6, 16, 16]} />
          <meshBasicMaterial color="#FF4500" transparent opacity={0.1} depthWrite={false} />
        </mesh>
      )}

      {/* Sun label */}
      {showLabels && (
        <Text
          position={[0, 3, 0]}
          fontSize={0.4 * labelScale}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          Sun
          <Text
            position={[0, -0.6, 0]}
            fontSize={0.2}
            color="#FFD700"
            anchorX="center"
            anchorY="middle"
          >
            G-type Main Sequence Star
          </Text>
          <Text
            position={[0, -1.0, 0]}
            fontSize={0.15}
            color="#FFA500"
            anchorX="center"
            anchorY="middle"
          >
            Surface: 5,778 K
          </Text>
        </Text>
      )}

      {/* Focus highlight */}
      {isFocused && (
        <mesh>
          <sphereGeometry args={[3.0, 16, 16]} />
          <meshBasicMaterial color="#FDB813" transparent opacity={0.1} depthWrite={false} />
        </mesh>
      )}

      {/* Point light emanating from the Sun */}
      <pointLight
        position={[0, 0, 0]}
        color="#FDB813"
        intensity={2}
        distance={200}
        decay={2}
        castShadow={performanceLevel === 'HIGH'}
      />

      {/* Ambient light for general scene illumination */}
      <ambientLight color="#404040" intensity={0.2} />
    </group>
  );
}
