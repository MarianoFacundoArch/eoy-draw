import { useCallback, useRef } from 'react';

type SoundName = 'drumroll' | 'tick' | 'boom' | 'fanfare' | 'cheering' | 'suspense';

// Audio context singleton
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

// Create a simple oscillator-based sound
function createTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.5
): { play: () => void; stop: () => void } {
  let oscillator: OscillatorNode | null = null;
  let gainNode: GainNode | null = null;

  return {
    play: () => {
      oscillator = ctx.createOscillator();
      gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    },
    stop: () => {
      if (oscillator) {
        try { oscillator.stop(); } catch { /* ignore */ }
      }
    }
  };
}

// Create noise-based sound (for drums, cheering, etc.)
function createNoise(
  ctx: AudioContext,
  duration: number,
  volume: number = 0.5,
  filterFreq: number = 1000
): { play: () => void; stop: () => void } {
  let source: AudioBufferSourceNode | null = null;

  return {
    play: () => {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, ctx.currentTime);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start(ctx.currentTime);
    },
    stop: () => {
      if (source) {
        try { source.stop(); } catch { /* ignore */ }
      }
    }
  };
}

// Sound generators for each type
const soundGenerators: Record<SoundName, (ctx: AudioContext, volume: number) => { play: () => void; stop: () => void; interval?: number }> = {
  tick: (ctx, volume) => ({
    ...createTone(ctx, 1200, 0.05, 'square', volume * 0.3),
  }),

  drumroll: (ctx, volume) => {
    let intervalId: number | null = null;
    let isPlaying = false;

    return {
      play: () => {
        isPlaying = true;
        const playBeat = () => {
          if (!isPlaying) return;
          createNoise(ctx, 0.08, volume * 0.4, 800).play();
        };
        playBeat();
        intervalId = window.setInterval(playBeat, 60);
      },
      stop: () => {
        isPlaying = false;
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      },
      interval: 1
    };
  },

  boom: (ctx, volume) => {
    return {
      play: () => {
        // MASSIVE LOW BOOM - deep bass hit
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(80, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.8);
        gain1.gain.setValueAtTime(volume, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.8);

        // Mid punch
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(200, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.4);
        gain2.gain.setValueAtTime(volume * 0.7, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.4);

        // Explosive impact noise
        createNoise(ctx, 0.5, volume * 0.8, 800).play();

        // Secondary crackle
        setTimeout(() => {
          createNoise(ctx, 0.3, volume * 0.5, 2000).play();
        }, 100);

        // Third layer - shimmer
        setTimeout(() => {
          createNoise(ctx, 0.2, volume * 0.3, 4000).play();
        }, 200);
      },
      stop: () => {}
    };
  },

  fanfare: (ctx, volume) => {
    let timeoutIds: number[] = [];

    return {
      play: () => {
        // TRIUMPHANT FANFARE - multiple layers
        const notes = [392, 523, 659, 784, 1047, 1319]; // G4, C5, E5, G5, C6, E6
        const durations = [0.12, 0.12, 0.12, 0.12, 0.2, 0.5];

        let time = 0;
        notes.forEach((freq, i) => {
          const id = window.setTimeout(() => {
            // Main brass-like tone
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durations[i] * 1.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + durations[i] * 1.5);

            // Harmonic layer
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime);
            gain2.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durations[i]);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(ctx.currentTime);
            osc2.stop(ctx.currentTime + durations[i]);
          }, time * 1000);
          timeoutIds.push(id);
          time += durations[i] * 0.7;
        });
      },
      stop: () => {
        timeoutIds.forEach(id => clearTimeout(id));
        timeoutIds = [];
      }
    };
  },

  cheering: (ctx, volume) => {
    let intervalId: number | null = null;
    let isPlaying = false;

    return {
      play: () => {
        isPlaying = true;
        const playCheer = () => {
          if (!isPlaying) return;
          // Random pitch noise bursts for crowd effect
          const freq = 800 + Math.random() * 1200;
          createNoise(ctx, 0.15, volume * 0.25, freq).play();
        };
        playCheer();
        intervalId = window.setInterval(playCheer, 100);
      },
      stop: () => {
        isPlaying = false;
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      },
      interval: 1
    };
  },

  suspense: (ctx, volume) => {
    let intervalId: number | null = null;
    let isPlaying = false;

    return {
      play: () => {
        isPlaying = true;
        let phase = 0;

        const playPulse = () => {
          if (!isPlaying) return;

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          // Alternating low tones for suspense
          const freq = phase % 2 === 0 ? 110 : 130;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          gain.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.4);

          phase++;
        };

        playPulse();
        intervalId = window.setInterval(playPulse, 500);
      },
      stop: () => {
        isPlaying = false;
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      },
      interval: 1
    };
  }
};

export function useSound() {
  const activeSoundsRef = useRef<Map<SoundName, { stop: () => void }>>(new Map());

  const play = useCallback((name: SoundName, options?: { loop?: boolean; volume?: number }) => {
    const ctx = getAudioContext();

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const volume = options?.volume ?? 0.5;
    const sound = soundGenerators[name](ctx, volume);

    // Stop any existing instance of this sound
    const existing = activeSoundsRef.current.get(name);
    if (existing) {
      existing.stop();
    }

    activeSoundsRef.current.set(name, sound);
    sound.play();

    // If not looping and no interval, auto-cleanup after a reasonable duration
    if (!options?.loop && !('interval' in sound)) {
      setTimeout(() => {
        activeSoundsRef.current.delete(name);
      }, 2000);
    }
  }, []);

  const stop = useCallback((name: SoundName) => {
    const sound = activeSoundsRef.current.get(name);
    if (sound) {
      sound.stop();
      activeSoundsRef.current.delete(name);
    }
  }, []);

  const stopAll = useCallback(() => {
    activeSoundsRef.current.forEach(sound => sound.stop());
    activeSoundsRef.current.clear();
  }, []);

  const fadeOut = useCallback((name: SoundName, _duration: number = 1000) => {
    // For Web Audio API sounds, we just stop them
    // A proper fadeout would require more complex gain ramping
    const sound = activeSoundsRef.current.get(name);
    if (sound) {
      sound.stop();
      activeSoundsRef.current.delete(name);
    }
  }, []);

  return { play, stop, stopAll, fadeOut };
}
