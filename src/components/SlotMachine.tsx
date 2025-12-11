import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Member, Team, PrizeType, DrawingPhase } from '../types';
import { useSound } from '../hooks/useSound';
import { ParticlesBackground } from './Particles';

interface SlotMachineProps {
  member: Member;
  team: Team;
  availablePrizeTypes: PrizeType[];
  onComplete: (prizeType: PrizeType) => void;
  onCancel: () => void;
}

export function SlotMachine({ member, team, availablePrizeTypes, onComplete, onCancel }: SlotMachineProps) {
  const [phase, setPhase] = useState<DrawingPhase>('idle');
  const [currentPrize, setCurrentPrize] = useState<PrizeType | null>(null);
  const [winningPrize, setWinningPrize] = useState<PrizeType | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [reelOffset, setReelOffset] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const { play, stopAll, fadeOut } = useSound();

  // Create a shuffled list for the reel
  const shuffledPrizes = useRef<PrizeType[]>([]);

  // Shuffle array helper
  const shuffle = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Select random prize
  const selectWinningPrize = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * availablePrizeTypes.length);
    return availablePrizeTypes[randomIndex];
  }, [availablePrizeTypes]);

  // Start the drawing
  const startDrawing = useCallback(() => {
    if (phase !== 'idle') return;

    const selectedPrize = selectWinningPrize();
    setWinningPrize(selectedPrize);

    // Shuffle prizes and ensure winner is somewhere in the middle-end
    const shuffled = shuffle(availablePrizeTypes.filter(p => p.id !== selectedPrize.id));
    const insertIndex = Math.floor(shuffled.length * 0.7) + Math.floor(Math.random() * (shuffled.length * 0.3));
    shuffled.splice(insertIndex, 0, selectedPrize);
    shuffledPrizes.current = shuffled;

    setPhase('building');
    play('drumroll', { loop: true, volume: 0.5 });

    // Building phase - 2 seconds
    setTimeout(() => {
      setPhase('spinning');
      fadeOut('drumroll', 500);
      play('suspense', { loop: true, volume: 0.4 });

      let currentIndex = 0;
      let speed = 50; // Start fast
      const totalPrizes = shuffledPrizes.current.length;
      const winnerIndex = shuffledPrizes.current.findIndex(p => p.id === selectedPrize.id);

      const spin = () => {
        const prize = shuffledPrizes.current[currentIndex % totalPrizes];
        setCurrentPrize(prize);
        setReelOffset(prev => prev + 1);

        // Play tick on every prize change
        play('tick', { volume: 0.3 });

        currentIndex++;

        // Calculate how close we are to the winning prize
        const distanceToWinner = winnerIndex - (currentIndex % totalPrizes);
        const loopsCompleted = Math.floor(currentIndex / totalPrizes);

        // After 2 full loops, start slowing when approaching winner
        if (loopsCompleted >= 2 && distanceToWinner >= 0 && distanceToWinner <= 15) {
          // Gradually slow down
          const slowdownFactor = 1 + ((15 - distanceToWinner) * 0.3);
          speed = Math.min(50 * slowdownFactor, 800);

          if (distanceToWinner <= 3) {
            setPhase('slowing');
            speed = 400 + ((3 - distanceToWinner) * 300);
          }

          // Final stop on winner
          if (distanceToWinner === 0) {
            clearInterval(intervalRef.current!);
            setCurrentPrize(selectedPrize);

            setTimeout(() => {
              setPhase('reveal');
              stopAll();
              setShowFlash(true);

              // Play big explosion sound
              play('boom', { volume: 1.0 });

              setTimeout(() => {
                setShowFlash(false);
                setShowCelebration(true);

                // Play celebration sounds
                play('fanfare', { volume: 0.8 });
                play('cheering', { volume: 0.6 });

                setPhase('celebrating');
              }, 300);
            }, 600);
            return;
          }
        }

        // Continue spinning with dynamic speed
        intervalRef.current = window.setTimeout(spin, speed);
      };

      // Start spinning
      spin();
    }, 2000);
  }, [phase, availablePrizeTypes, selectWinningPrize, play, fadeOut, stopAll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
      stopAll();
    };
  }, [stopAll]);

  // Handle completion
  const handleContinue = () => {
    if (winningPrize) {
      stopAll();
      onComplete(winningPrize);
    }
  };

  // Get tier styling
  const getTierStyle = (tier: PrizeType['tier']) => {
    switch (tier) {
      case 'grand':
        return 'text-purple-400 bg-purple-500/20';
      case 'gold':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'silver':
        return 'text-gray-300 bg-gray-500/20';
      case 'bronze':
        return 'text-amber-500 bg-amber-500/20';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Ambient particles - visible during all phases except celebration */}
      {!showCelebration && (
        <ParticlesBackground key="ambient-stable" variant="ambient" />
      )}

      {/* Flash overlay */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-white z-50"
          />
        )}
      </AnimatePresence>

      {/* Celebration particles - only when celebrating */}
      {showCelebration && (
        <>
          <ParticlesBackground variant="winnerBurst" />
          <ParticlesBackground variant="confetti" />
          <ParticlesBackground variant="fireworks" />
        </>
      )}

      {/* Main content */}
      <div className={`relative z-10 text-center px-8 ${phase === 'reveal' || phase === 'celebrating' ? 'shake' : ''}`}>

        {/* Member display */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
          style={{ marginBottom: '5rem' }}
        >
          <span className="text-6xl block mb-3">{team.emoji}</span>
          <h2 className="text-5xl font-bold text-white mb-2">{member.name}</h2>
          <p className="text-2xl text-slate-400 mb-4">{team.name}</p>
          <p className="text-xl text-yellow-400">¡Listo para sortear un premio!</p>
        </motion.div>

        {/* Slot machine display */}
        <div className="relative w-[750px] max-w-[95vw] h-[380px] mx-auto" style={{ marginBottom: '5rem' }}>
          {/* Decorative frame */}
          <div className="absolute inset-0 border-4 border-yellow-500/40 rounded-2xl glow-gold" />
          <div className="absolute inset-2 border-2 border-yellow-500/20 rounded-xl" />

          {/* Center highlight bar */}
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-52 bg-yellow-500/10 border-y-2 border-yellow-500/30 pointer-events-none z-10" />

          {/* Prize display */}
          <div className="absolute inset-4 overflow-hidden rounded-lg bg-slate-900/90">
            <AnimatePresence mode="wait">
              {phase === 'idle' && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <p className="text-5xl font-bold text-slate-500">
                    Listo para sortear...
                  </p>
                </motion.div>
              )}

              {phase === 'building' && (
                <motion.div
                  key="building"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="text-center">
                    <p className="text-6xl font-bold text-yellow-400 text-glow">
                      ¿QUÉ GANARÁ?
                    </p>
                    <p className="text-2xl text-slate-400 mt-4">
                      ¡Pulsa GIRAR para descubrirlo!
                    </p>
                  </div>
                </motion.div>
              )}

              {(phase === 'spinning' || phase === 'slowing') && currentPrize && (
                <motion.div
                  key={`spinning-${reelOffset}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: phase === 'slowing' ? 0.12 : 0.02 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="flex items-center gap-6">
                    <span className={`text-6xl ${phase === 'slowing' ? 'text-7xl' : ''}`}>
                      {currentPrize.emoji}
                    </span>
                    <p className={`font-bold text-white ${phase === 'slowing' ? 'text-5xl' : 'text-4xl'}`}>
                      {currentPrize.name}
                    </p>
                  </div>
                </motion.div>
              )}

              {(phase === 'reveal' || phase === 'celebrating') && winningPrize && (
                <motion.div
                  key="winner"
                  initial={{ scale: 0, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 10,
                  }}
                  className="absolute inset-0 flex items-center justify-center px-8"
                >
                  <div className="text-center">
                    <span className="text-7xl block mb-3">{winningPrize.emoji}</span>
                    <p className="text-4xl font-bold text-gold-gradient text-glow winner-reveal mb-3">
                      {winningPrize.name}
                    </p>
                    <p className="text-2xl text-green-400 font-bold mb-2">
                      Valor: {winningPrize.value}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase ${getTierStyle(winningPrize.tier)}`}>
                        {winningPrize.tier}
                      </span>
                      <p className="text-lg text-slate-400">{winningPrize.description}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Side decorations */}
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-40 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-l-xl shadow-lg" />
          <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-40 bg-gradient-to-l from-yellow-600 to-yellow-500 rounded-r-xl shadow-lg" />

          {/* Top/bottom light effects */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-40 h-6 bg-gradient-to-b from-yellow-400/50 to-transparent rounded-full blur-sm" />
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-40 h-6 bg-gradient-to-t from-yellow-400/50 to-transparent rounded-full blur-sm" />
        </div>

        {/* Action buttons */}
        <div className="flex gap-8 justify-center">
          {phase === 'idle' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startDrawing}
                className="btn-gold text-3xl px-16 py-6"
              >
                🎰 ¡GIRAR PARA GANAR!
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="px-16 py-6 bg-slate-800 text-slate-300 font-bold rounded-xl text-2xl hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </motion.button>
            </>
          )}

          {phase === 'celebrating' && (
            <motion.button
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleContinue}
              className="btn-gold text-3xl px-16 py-6"
            >
              🎉 Continuar
            </motion.button>
          )}
        </div>

        {/* Spinning indicator */}
        {(phase === 'spinning' || phase === 'slowing' || phase === 'building') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginTop: '4rem' }}
          >
            <div className="flex gap-4 justify-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: phase === 'slowing' ? 0.8 : 0.4,
                    delay: i * 0.15,
                  }}
                  className="w-5 h-5 bg-yellow-500 rounded-full"
                />
              ))}
            </div>
            <p className="text-slate-500 mt-6 text-xl">
              {phase === 'building' ? 'Get ready...' : phase === 'slowing' ? 'Almost there...' : 'Spinning...'}
            </p>
          </motion.div>
        )}

        {/* Winner celebration text */}
        {phase === 'celebrating' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ marginTop: '3rem' }}
          >
            <p className="text-3xl text-yellow-400 font-bold animate-pulse">
              🎊 ¡{member.name} GANA! 🎊
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
