'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { PLANETS, SPACECRAFT } from '@/lib/solar-system-data';

interface CameraControllerProps {
  focusTarget: string | null;
  autoRotate: boolean;
}

export function CameraController({ focusTarget, autoRotate }: CameraControllerProps) {
  const controlsRef = useRef<any>(null);
  const { camera, scene } = useThree();
  const targetPosition = useRef(new Vector3(0, 0, 0));
  const currentTarget = useRef<string | null>(null);

  // Update camera target when focus changes
  useEffect(() => {
    if (!controlsRef.current) return;

    if (focusTarget === null || focusTarget === '') {
      // Free camera mode - no specific target
      targetPosition.current.set(0, 0, 0);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
      currentTarget.current = null;
      return;
    }

    // Find the object to focus on
    let targetObject = null;

    // Check if it's the Sun
    if (focusTarget === 'Sun') {
      targetObject = scene.getObjectByName('Sun');
      targetPosition.current.set(0, 0, 0);
    }
    // Check planets
    else {
      const planet = PLANETS.find((p) => p.name === focusTarget);
      if (planet) {
        targetObject = scene.getObjectByName(focusTarget);
        if (targetObject) {
          targetPosition.current.copy(targetObject.position);
        }
      } else {
        // Check spacecraft
        const spacecraft = SPACECRAFT.find((s) => s.name === focusTarget);
        if (spacecraft) {
          targetObject = scene.getObjectByName(focusTarget);
          if (targetObject) {
            targetPosition.current.copy(targetObject.position);
          }
        }
      }
    }

    if (targetObject) {
      // Update orbit controls target
      controlsRef.current.target.copy(targetPosition.current);

      // Calculate appropriate camera distance based on object size
      let distance = 10; // default distance

      if (focusTarget === 'Sun') {
        distance = 30;
      } else if (focusTarget === 'Jupiter' || focusTarget === 'Saturn') {
        distance = 20;
      } else if (SPACECRAFT.find((s) => s.name === focusTarget)) {
        distance = 5;
      } else {
        distance = 15;
      }

      // Smoothly move camera to a good viewing position
      const offset = new Vector3(distance, distance * 0.5, distance);
      const newCameraPosition = targetPosition.current.clone().add(offset);
      camera.position.lerp(newCameraPosition, 0.1);

      controlsRef.current.update();
      currentTarget.current = focusTarget;
    }
  }, [focusTarget, camera, scene]);

  // Smooth tracking of moving objects
  useFrame(() => {
    if (!controlsRef.current || !currentTarget.current || currentTarget.current === 'Sun') return;

    // For moving objects (planets, spacecraft), update target position
    const targetObject = scene.getObjectByName(currentTarget.current);
    if (targetObject) {
      // Smoothly interpolate to new position
      targetPosition.current.lerp(targetObject.position, 0.05);
      controlsRef.current.target.lerp(targetPosition.current, 0.05);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={2}
      maxDistance={500}
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
      dampingFactor={0.05}
      enableDamping={true}
      autoRotate={autoRotate && !focusTarget}
      autoRotateSpeed={0.5}
      makeDefault
    />
  );
}
