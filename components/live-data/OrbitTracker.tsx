'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface OrbitTrackerProps {
  missionId: string;
  missionName: string;
}

export function OrbitTracker({ missionId, missionName }: OrbitTrackerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let time = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const animate = () => {
      ctx.fillStyle = 'rgba(17, 24, 39, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(75, 85, 99, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw central body (planet/sun)
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
      if (missionId.includes('mars')) {
        gradient.addColorStop(0, '#ef4444');
        gradient.addColorStop(1, '#dc2626');
      } else if (missionId.includes('parker')) {
        gradient.addColorStop(0, '#fbbf24');
        gradient.addColorStop(1, '#f59e0b');
      } else {
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#2563eb');
      }
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
      ctx.fill();

      // Draw orbit path
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 100, 80, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw spacecraft position
      const angle = time * 0.02;
      const x = centerX + Math.cos(angle) * 100;
      const y = centerY + Math.sin(angle) * 80;

      // Spacecraft trail
      for (let i = 0; i < 10; i++) {
        const trailAngle = angle - i * 0.05;
        const trailX = centerX + Math.cos(trailAngle) * 100;
        const trailY = centerY + Math.sin(trailAngle) * 80;
        ctx.fillStyle = `rgba(147, 197, 253, ${0.3 - i * 0.03})`;
        ctx.beginPath();
        ctx.arc(trailX, trailY, 3 - i * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spacecraft
      ctx.fillStyle = '#60a5fa';
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw distance line
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Add distance text
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      ctx.fillStyle = '#60a5fa';
      ctx.font = '10px monospace';
      ctx.fillText(`${(distance * 1000).toFixed(0)} km`, x + 10, y - 10);

      time++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [missionId]);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Orbital Trajectory</h3>
        <span className="text-xs text-gray-400 uppercase tracking-wider">{missionName}</span>
      </div>
      <div className="relative">
        <canvas ref={canvasRef} className="w-full h-64 rounded-lg bg-gray-900/50" />
        <div className="absolute bottom-2 left-2 text-xs text-gray-500 font-mono">
          <div>Altitude: {(80 + Math.sin(Date.now() * 0.001) * 10).toFixed(1)} km</div>
          <div>Velocity: {(7.8 + Math.random() * 0.2).toFixed(2)} km/s</div>
        </div>
      </div>
    </div>
  );
}
