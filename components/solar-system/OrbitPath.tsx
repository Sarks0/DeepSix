'use client';

import { useMemo } from 'react';
import { Vector3 } from 'three';

interface OrbitPathProps {
  distance: number;
  visible: boolean;
}

export function OrbitPath({ distance, visible }: OrbitPathProps) {
  const points = useMemo(() => {
    const orbitPoints: Vector3[] = [];
    const segments = 128;
    const scaledDistance = distance * 10; // same scale factor as planets

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * scaledDistance;
      const z = Math.sin(angle) * scaledDistance;
      orbitPoints.push(new Vector3(x, 0, z));
    }

    return orbitPoints;
  }, [distance]);

  if (!visible) return null;

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#444444" transparent opacity={0.3} />
    </line>
  );
}
