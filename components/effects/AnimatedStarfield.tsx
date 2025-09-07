'use client';

import { useEffect, useRef } from 'react';

export function AnimatedStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Star properties
    const stars: Array<{
      x: number;
      y: number;
      z: number;
      prevX?: number;
      prevY?: number;
    }> = [];
    const numStars = 800;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const speed = 0.005;

    // Initialize stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 1000,
      });
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(6, 10, 20, 0.1)'; // Dark blue-black with trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw stars
      stars.forEach((star) => {
        // Store previous position for motion blur
        star.prevX = (star.x / star.z) * centerX + centerX;
        star.prevY = (star.y / star.z) * centerY + centerY;

        // Move star closer
        star.z -= speed * star.z;

        // Reset star if it gets too close
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * 2000;
          star.y = (Math.random() - 0.5) * 2000;
          star.z = 1000;
          star.prevX = undefined;
          star.prevY = undefined;
        }

        // Calculate screen position
        const x = (star.x / star.z) * centerX + centerX;
        const y = (star.y / star.z) * centerY + centerY;

        // Calculate size and opacity based on distance
        const size = (1 - star.z / 1000) * 2;
        const opacity = 1 - star.z / 1000;

        // Draw motion trail
        if (star.prevX !== undefined && star.prevY !== undefined) {
          ctx.beginPath();
          ctx.moveTo(star.prevX, star.prevY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = `rgba(147, 197, 253, ${opacity * 0.5})`;
          ctx.lineWidth = size * 0.5;
          ctx.stroke();
        }

        // Draw star
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);

        // Create gradient for glow effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(147, 197, 253, ${opacity * 0.5})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        background: 'linear-gradient(to bottom, #030712, #0a0f1f, #030712)',
        zIndex: -1,
      }}
    />
  );
}
