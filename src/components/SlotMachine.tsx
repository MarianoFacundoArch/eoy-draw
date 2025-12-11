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

  const shuffledPrizes = useRef<PrizeType[]>([]);

  const shuffle = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const selectWinningPrize = useCallback(() => {
    const totalProbability = availablePrizeTypes.reduce((sum, prize) => sum + prize.probability, 0);
    const random = Math.random() * totalProbability;
    let cumulative = 0;
    for (const prize of availablePrizeTypes) {
      cumulative += prize.probability;
      if (random <= cumulative) {
        return prize;
      }
    }
    return availablePrizeTypes[availablePrizeTypes.length - 1];
  }, [availablePrizeTypes]);

  const startDrawing = useCallback(() => {
    if (phase !== 'idle') return;

    const selectedPrize = selectWinningPrize();
    setWinningPrize(selectedPrize);

    const shuffled = shuffle(availablePrizeTypes.filter(p => p.id !== selectedPrize.id));
    const insertIndex = Math.floor(shuffled.length * 0.7) + Math.floor(Math.random() * (shuffled.length * 0.3));
    shuffled.splice(insertIndex, 0, selectedPrize);
    shuffledPrizes.current = shuffled;

    setPhase('building');
    play('drumroll', { loop: true, volume: 0.5 });

    setTimeout(() => {
      setPhase('spinning');
      fadeOut('drumroll', 500);
      play('suspense', { loop: true, volume: 0.4 });

      let currentIndex = 0;
      let speed = 50;
      const totalPrizes = shuffledPrizes.current.length;
      const winnerIndex = shuffledPrizes.current.findIndex(p => p.id === selectedPrize.id);

      const spin = () => {
        const prize = shuffledPrizes.current[currentIndex % totalPrizes];
        setCurrentPrize(prize);
        setReelOffset(prev => prev + 1);
        play('tick', { volume: 0.3 });
        currentIndex++;

        const distanceToWinner = winnerIndex - (currentIndex % totalPrizes);
        const loopsCompleted = Math.floor(currentIndex / totalPrizes);

        if (loopsCompleted >= 2 && distanceToWinner >= 0 && distanceToWinner <= 15) {
          const slowdownFactor = 1 + ((15 - distanceToWinner) * 0.3);
          speed = Math.min(50 * slowdownFactor, 800);

          if (distanceToWinner <= 3) {
            setPhase('slowing');
            speed = 400 + ((3 - distanceToWinner) * 300);
          }

          if (distanceToWinner === 0) {
            clearInterval(intervalRef.current!);
            setCurrentPrize(selectedPrize);

            setTimeout(() => {
              setPhase('reveal');
              stopAll();
              setShowFlash(true);
              play('boom', { volume: 1.0 });

              setTimeout(() => {
                setShowFlash(false);
                setShowCelebration(true);
                play('fanfare', { volume: 0.8 });
                play('cheering', { volume: 0.6 });
                setPhase('celebrating');
              }, 300);
            }, 600);
            return;
          }
        }

        intervalRef.current = window.setTimeout(spin, speed);
      };

      spin();
    }, 2000);
  }, [phase, availablePrizeTypes, selectWinningPrize, play, fadeOut, stopAll]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
      stopAll();
    };
  }, [stopAll]);

  const handleContinue = () => {
    if (winningPrize) {
      stopAll();
      onComplete(winningPrize);
    }
  };

  // CAMERA-OPTIMIZED: High contrast tier styling
  const getTierStyle = (tier: PrizeType['tier']) => {
    switch (tier) {
      case 'grand':
        return 'text-white bg-purple-600 border-purple-400';
      case 'gold':
        return 'text-black bg-amber-400 border-amber-300';
      case 'silver':
        return 'text-black bg-gray-300 border-gray-200';
      case 'bronze':
        return 'text-white bg-amber-700 border-amber-500';
    }
  };

  return (
    // CAMERA-OPTIMIZED: Solid black background
    <div className="fixed inset-0 flex items-center justify-center bg-black overflow-hidden">
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
            className="fixed inset-0 bg-amber-300 z-50"
          />
        )}
      </AnimatePresence>

      {/* Celebration particles */}
      {showCelebration && (
        <>
          <ParticlesBackground variant="winnerBurst" />
          <ParticlesBackground variant="confetti" />
          <ParticlesBackground variant="fireworks" />
        </>
      )}

      {/* Main content - CAMERA-OPTIMIZED: Everything massive */}
      <div className={`relative z-10 text-center px-8 w-full max-w-6xl ${phase === 'reveal' || phase === 'celebrating' ? 'shake' : ''}`}>

        {/* CAMERA-OPTIMIZED: Large member display - single line */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
          style={{ marginBottom: '2.5rem' }}
        >
          <h2 className="font-black text-white" style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{member.name} - {team.name}</h2>
          <p className="text-amber-400 font-bold" style={{ fontSize: '1.75rem' }}>¡Listo para sortear un premio!</p>
        </motion.div>

        {/* CAMERA-OPTIMIZED: Massive slot machine display */}
        <div className="relative w-full max-w-5xl h-[450px] mx-auto" style={{ marginBottom: '3rem' }}>
          {/* Decorative frame - CAMERA-OPTIMIZED: Thicker borders */}
          <div className="absolute inset-0 border-8 border-amber-400 rounded-3xl glow-gold-intense" />
          <div className="absolute inset-4 border-4 border-amber-500/60 rounded-2xl" />

          {/* Center highlight bar */}
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-64 bg-amber-500/20 border-y-4 border-amber-400 pointer-events-none z-10" />

          {/* Prize display */}
          <div className="absolute inset-6 overflow-hidden rounded-2xl bg-gray-950">
            <AnimatePresence mode="wait">
              {phase === 'idle' && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <p className="font-black text-gray-500" style={{ fontSize: '4rem' }}>
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
                    <p className="font-black text-amber-400 text-glow" style={{ fontSize: '5rem' }}>
                      ¿QUÉ GANARÁ?
                    </p>
                    <p className="text-white font-bold" style={{ fontSize: '2rem', marginTop: '1rem' }}>
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
                  <div className="flex items-center gap-8">
                    <span style={{ fontSize: phase === 'slowing' ? '8rem' : '6rem' }}>
                      {currentPrize.emoji}
                    </span>
                    <p className={`font-black text-white ${phase === 'slowing' ? '' : ''}`} style={{ fontSize: phase === 'slowing' ? '4rem' : '3.5rem' }}>
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
                  <div className="text-center relative w-full">
                    {/* Value in top right */}
                    <p className="absolute top-0 right-8 font-bold text-green-400" style={{ fontSize: '1.75rem' }}>
                      {winningPrize.value}
                    </p>
                    {/* Prize name - main focus */}
                    <p className="font-black text-gold-gradient text-glow winner-reveal" style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>
                      {winningPrize.name}
                    </p>
                    {/* Tier badge and description */}
                    <div className="flex items-center justify-center gap-6">
                      <span className={`px-8 py-3 rounded-full font-black uppercase border-4 ${getTierStyle(winningPrize.tier)}`} style={{ fontSize: '1.5rem' }}>
                        {winningPrize.tier}
                      </span>
                      <p className="text-gray-300 font-bold" style={{ fontSize: '1.5rem' }}>{winningPrize.description}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Side decorations - CAMERA-OPTIMIZED: Larger */}
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-48 bg-gradient-to-r from-amber-500 to-amber-400 rounded-l-2xl shadow-lg border-4 border-amber-300" />
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-16 h-48 bg-gradient-to-l from-amber-500 to-amber-400 rounded-r-2xl shadow-lg border-4 border-amber-300" />

          {/* Top/bottom glow - CAMERA-OPTIMIZED: More visible */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-64 h-8 bg-gradient-to-b from-amber-400/70 to-transparent rounded-full blur-md" />
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-64 h-8 bg-gradient-to-t from-amber-400/70 to-transparent rounded-full blur-md" />
        </div>

        {/* CAMERA-OPTIMIZED: Massive action buttons */}
        <div className="flex gap-8 justify-center">
          {phase === 'idle' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startDrawing}
                className="btn-gold"
                style={{ fontSize: '2.5rem', padding: '2rem 5rem' }}
              >
                🎰 ¡GIRAR PARA GANAR!
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="bg-gray-800 text-white font-black rounded-2xl border-4 border-gray-600 hover:bg-gray-700 hover:border-gray-500 transition-colors"
                style={{ fontSize: '2rem', padding: '2rem 4rem' }}
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
              className="btn-gold"
              style={{ fontSize: '2.5rem', padding: '2rem 5rem' }}
            >
              🎉 Continuar
            </motion.button>
          )}
        </div>

        {/* Spinning indicator - CAMERA-OPTIMIZED */}
        {(phase === 'spinning' || phase === 'slowing' || phase === 'building') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginTop: '3rem' }}
          >
            <div className="flex gap-6 justify-center">
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
                  className="w-8 h-8 bg-amber-400 rounded-full"
                />
              ))}
            </div>
            <p className="text-gray-400 font-bold" style={{ fontSize: '1.75rem', marginTop: '1.5rem' }}>
              {phase === 'building' ? 'Get ready...' : phase === 'slowing' ? 'Almost there...' : 'Spinning...'}
            </p>
          </motion.div>
        )}

        {/* Winner celebration text - CAMERA-OPTIMIZED: MASSIVE */}
        {phase === 'celebrating' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ marginTop: '2rem' }}
          >
            <p className="text-amber-400 font-black animate-pulse text-glow" style={{ fontSize: '3.5rem' }}>
              🎊 ¡{member.name} GANA! 🎊
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
