import { useEffect, useMemo, useState, memo } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

interface ParticlesBackgroundProps {
  variant: 'ambient' | 'confetti' | 'fireworks' | 'celebration' | 'winnerBurst';
}

// Track initialization state globally
let engineInitialized = false;
let initPromise: Promise<void> | null = null;

export const ParticlesBackground = memo(function ParticlesBackground({ variant }: ParticlesBackgroundProps) {
  const [isReady, setIsReady] = useState(engineInitialized);

  useEffect(() => {
    if (engineInitialized) {
      setIsReady(true);
      return;
    }

    if (!initPromise) {
      initPromise = initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      }).then(() => {
        engineInitialized = true;
      });
    }

    initPromise.then(() => setIsReady(true));
  }, []);

  const options = useMemo((): ISourceOptions => {
    switch (variant) {
      case 'ambient':
        return {
          fullScreen: { enable: false },
          particles: {
            number: { value: 50, density: { enable: true } },
            color: { value: ['#FFD700', '#FFA500', '#FFFFFF'] },
            shape: { type: 'circle' },
            opacity: { value: { min: 0.1, max: 0.4 } },
            size: { value: { min: 1, max: 3 } },
            move: {
              enable: true,
              speed: 0.5,
              direction: 'none',
              random: true,
              straight: false,
              outModes: 'out',
            },
          },
          detectRetina: true,
        };

      case 'confetti':
        return {
          fullScreen: { enable: false },
          particles: {
            number: { value: 0 },
            color: {
              value: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#FF69B4', '#00FF7F'],
            },
            shape: {
              type: ['square', 'circle'],
            },
            opacity: { value: 1 },
            size: { value: { min: 8, max: 15 } },
            move: {
              enable: true,
              speed: { min: 15, max: 30 },
              direction: 'bottom',
              gravity: { enable: true, acceleration: 8 },
              outModes: 'out',
            },
            rotate: {
              value: { min: 0, max: 360 },
              direction: 'random',
              animation: { enable: true, speed: 80 },
            },
            tilt: {
              direction: 'random',
              enable: true,
              value: { min: 0, max: 360 },
              animation: { enable: true, speed: 80 },
            },
            wobble: {
              enable: true,
              distance: 40,
              speed: 20,
            },
          },
          emitters: [
            { position: { x: 50, y: -5 }, rate: { quantity: 20, delay: 0.03 }, size: { width: 100, height: 0 }, life: { duration: 8 } },
            { position: { x: 0, y: 50 }, rate: { quantity: 10, delay: 0.05 }, direction: 'right', life: { duration: 8 } },
            { position: { x: 100, y: 50 }, rate: { quantity: 10, delay: 0.05 }, direction: 'left', life: { duration: 8 } },
          ],
          detectRetina: true,
        };

      case 'fireworks':
        return {
          fullScreen: { enable: false },
          particles: {
            number: { value: 0 },
            color: { value: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFFFFF'] },
            shape: { type: 'circle' },
            opacity: {
              value: { min: 0, max: 1 },
              animation: { enable: true, speed: 1, startValue: 'max', destroy: 'min' },
            },
            size: {
              value: { min: 2, max: 4 },
              animation: { enable: true, speed: 5, startValue: 'min', destroy: 'max' },
            },
            move: {
              enable: true,
              speed: { min: 10, max: 25 },
              direction: 'none',
              outModes: 'destroy',
              gravity: { enable: true, acceleration: 3 },
            },
            life: {
              count: 1,
              duration: { value: { min: 1, max: 2 } },
            },
          },
          emitters: [
            { position: { x: 20, y: 60 }, rate: { quantity: 30, delay: 0.5 }, life: { duration: 0.1, count: 3 } },
            { position: { x: 80, y: 60 }, rate: { quantity: 30, delay: 0.7 }, life: { duration: 0.1, count: 3 } },
            { position: { x: 50, y: 50 }, rate: { quantity: 40, delay: 0.3 }, life: { duration: 0.1, count: 3 } },
          ],
          detectRetina: true,
        };

      case 'celebration':
        return {
          fullScreen: { enable: false },
          particles: {
            number: { value: 0 },
            color: {
              value: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
            },
            shape: { type: ['circle', 'square', 'star'] },
            opacity: { value: 1 },
            size: { value: { min: 3, max: 8 } },
            move: {
              enable: true,
              speed: { min: 5, max: 15 },
              direction: 'none',
              outModes: 'out',
              gravity: { enable: true, acceleration: 2 },
            },
            rotate: {
              value: { min: 0, max: 360 },
              animation: { enable: true, speed: 30 },
            },
          },
          emitters: [
            { position: { x: 0, y: 100 }, rate: { quantity: 5, delay: 0.1 }, life: { duration: 5 }, direction: 'top-right' },
            { position: { x: 100, y: 100 }, rate: { quantity: 5, delay: 0.1 }, life: { duration: 5 }, direction: 'top-left' },
          ],
          detectRetina: true,
        };

      case 'winnerBurst':
        return {
          fullScreen: { enable: false },
          particles: {
            number: { value: 0 },
            color: {
              value: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF69B4', '#00FF7F', '#FF4500'],
            },
            shape: {
              type: ['square', 'circle', 'star'],
            },
            opacity: { value: 1 },
            size: { value: { min: 10, max: 25 } },
            move: {
              enable: true,
              speed: { min: 40, max: 80 },
              direction: 'none',
              outModes: 'out',
              gravity: { enable: true, acceleration: 10 },
            },
            rotate: {
              value: { min: 0, max: 360 },
              direction: 'random',
              animation: { enable: true, speed: 120 },
            },
            tilt: {
              direction: 'random',
              enable: true,
              value: { min: 0, max: 360 },
              animation: { enable: true, speed: 120 },
            },
            wobble: {
              enable: true,
              distance: 60,
              speed: 40,
            },
          },
          emitters: [
            // Initial massive burst from center
            { position: { x: 50, y: 50 }, rate: { quantity: 150, delay: 0 }, life: { duration: 0.2, count: 1 } },
            // Side bursts
            { position: { x: 10, y: 50 }, rate: { quantity: 80, delay: 0 }, life: { duration: 0.15, count: 1 } },
            { position: { x: 90, y: 50 }, rate: { quantity: 80, delay: 0 }, life: { duration: 0.15, count: 1 } },
            // Corner bursts with delay
            { position: { x: 20, y: 30 }, rate: { quantity: 50, delay: 0.1 }, life: { duration: 0.1, count: 1 } },
            { position: { x: 80, y: 30 }, rate: { quantity: 50, delay: 0.1 }, life: { duration: 0.1, count: 1 } },
            { position: { x: 20, y: 70 }, rate: { quantity: 50, delay: 0.15 }, life: { duration: 0.1, count: 1 } },
            { position: { x: 80, y: 70 }, rate: { quantity: 50, delay: 0.15 }, life: { duration: 0.1, count: 1 } },
          ],
          detectRetina: true,
        };
    }
  }, [variant]);

  if (!isReady) {
    return null;
  }

  return (
    <Particles
      id={`particles-${variant}`}
      className="absolute inset-0 pointer-events-none"
      options={options}
    />
  );
});
