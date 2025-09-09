'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface SignalVisualizerProps {
  dataRate: number;
  frequency: number;
  power: number;
  signalType: 'uplink' | 'downlink';
  spacecraftName: string;
  isActive: boolean;
}

export function SignalVisualizer({
  dataRate,
  frequency,
  power,
  signalType,
  spacecraftName,
  isActive
}: SignalVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2; // Retina display
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    let offset = 0;
    const width = canvas.width / 2;
    const height = canvas.height / 2;

    // Generate waveform based on signal properties
    const draw = () => {
      ctx.fillStyle = 'rgba(17, 24, 39, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Draw waveform
      ctx.strokeStyle = signalType === 'uplink' 
        ? 'rgba(251, 146, 60, 0.8)' // Orange for uplink
        : 'rgba(59, 130, 246, 0.8)'; // Blue for downlink
      ctx.lineWidth = 2;
      ctx.beginPath();

      const amplitude = Math.min(50, (power / 1000) * 30);
      const waveFrequency = Math.log10(dataRate + 1) * 0.5;

      for (let x = 0; x < width; x++) {
        const y = height / 2 + 
          Math.sin((x + offset) * waveFrequency * 0.02) * amplitude * 
          Math.sin((x + offset) * 0.001) * // Modulation
          (1 + Math.random() * 0.1); // Noise
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Draw signal strength indicator
      const signalStrength = Math.min(100, (power / 1000) * 100);
      ctx.fillStyle = signalType === 'uplink' 
        ? 'rgba(251, 146, 60, 0.3)'
        : 'rgba(59, 130, 246, 0.3)';
      ctx.fillRect(0, height - 5, (width * signalStrength) / 100, 5);

      offset += dataRate > 0 ? Math.log10(dataRate + 1) : 0.5;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dataRate, frequency, power, signalType, isActive]);

  // Audio synthesis (optional)
  useEffect(() => {
    if (!audioEnabled || !isActive) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Map frequency to audible range
    const audioFreq = 200 + (frequency / 1000000) * 100; // Scale to 200-300 Hz
    oscillator.frequency.value = audioFreq;
    oscillator.type = signalType === 'uplink' ? 'sawtooth' : 'sine';

    gainNode.gain.value = 0.05; // Very quiet
    oscillator.start();

    return () => {
      oscillator.stop();
      audioContext.close();
    };
  }, [audioEnabled, frequency, signalType, isActive]);

  if (!isActive) {
    return (
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <p className="text-gray-500 text-center">No active signal</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
    >
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-sm font-semibold text-white">
            {signalType === 'uplink' ? '↑ Uplink' : '↓ Downlink'} Signal
          </h3>
          <p className="text-xs text-gray-400">{spacecraftName}</p>
        </div>
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`p-2 rounded transition-colors ${
            audioEnabled 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
          title="Toggle audio simulation"
        >
          {audioEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-24 rounded bg-gray-950"
      />

      <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
        <div>
          <p className="text-gray-500">Data Rate</p>
          <p className="font-mono text-green-400">{formatDataRate(dataRate)}</p>
        </div>
        <div>
          <p className="text-gray-500">Frequency</p>
          <p className="font-mono text-blue-400">{(frequency / 1000000).toFixed(2)} MHz</p>
        </div>
        <div>
          <p className="text-gray-500">Power</p>
          <p className="font-mono text-yellow-400">{power.toFixed(1)} W</p>
        </div>
      </div>
    </motion.div>
  );
}

function formatDataRate(rate: number): string {
  if (rate === 0) return '0 b/s';
  if (rate < 1000) return `${rate} b/s`;
  if (rate < 1000000) return `${(rate / 1000).toFixed(1)} kb/s`;
  return `${(rate / 1000000).toFixed(1)} Mb/s`;
}