'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

// Simple planet component
function SimplePlanet({ 
  name, 
  radius, 
  distance, 
  color, 
  speed = 1 
}: { 
  name: string;
  radius: number;
  distance: number;
  color: string;
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y = state.clock.elapsedTime * speed * 0.1;
    }
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={orbitRef}>
      <mesh ref={ref} position={[distance, 0, 0]}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[distance, radius + 1, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
}

// Simple sun component
function SimpleSun() {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial color="#FDB813" />
      <pointLight intensity={2} />
    </mesh>
  );
}

// Main scene content
function SolarSystemContent() {
  const planets = [
    { name: 'Mercury', radius: 0.2, distance: 4, color: '#8C7853', speed: 4 },
    { name: 'Venus', radius: 0.5, distance: 6, color: '#FFC649', speed: 3 },
    { name: 'Earth', radius: 0.5, distance: 8, color: '#4B70F5', speed: 2 },
    { name: 'Mars', radius: 0.3, distance: 10, color: '#CD5C5C', speed: 1.5 },
    { name: 'Jupiter', radius: 1.2, distance: 14, color: '#C88B3A', speed: 0.8 },
    { name: 'Saturn', radius: 1, distance: 18, color: '#FAD5A5', speed: 0.6 },
  ];

  return (
    <>
      <ambientLight intensity={0.1} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      
      <SimpleSun />
      
      {planets.map((planet) => (
        <SimplePlanet key={planet.name} {...planet} />
      ))}
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={0.6}
        panSpeed={0.5}
        rotateSpeed={0.4}
        minDistance={5}
        maxDistance={50}
      />
    </>
  );
}

export function SimpleSolarSystem({ className = 'w-full h-full' }) {
  return (
    <div className={className}>
      <Canvas 
        camera={{ position: [15, 10, 15], fov: 60 }}
        gl={{ 
          antialias: false,
          powerPreference: 'low-power',
          alpha: true 
        }}
        dpr={[1, 1]}
      >
        <Suspense fallback={null}>
          <SolarSystemContent />
        </Suspense>
      </Canvas>
    </div>
  );
}