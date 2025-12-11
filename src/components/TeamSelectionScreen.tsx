import { motion } from 'framer-motion';
import { Users, Trophy, Sparkles, ChevronRight } from 'lucide-react';
import type { Team } from '../types';
import { ParticlesBackground } from './Particles';

interface TeamSelectionScreenProps {
  teams: Team[];
  hasMemberWon: (memberId: number) => boolean;
  onSelectTeam: (team: Team) => void;
  onViewWinners: () => void;
}

// CAMERA-OPTIMIZED: Higher contrast solid colors
const teamColorConfig: Record<string, { bg: string; border: string; glow: string; fill: string }> = {
  blue: {
    bg: 'bg-blue-600',
    border: 'border-blue-400',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.6)]',
    fill: 'bg-blue-500',
  },
  red: {
    bg: 'bg-red-600',
    border: 'border-red-400',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.6)]',
    fill: 'bg-red-500',
  },
  pink: {
    bg: 'bg-pink-600',
    border: 'border-pink-400',
    glow: 'shadow-[0_0_30px_rgba(236,72,153,0.6)]',
    fill: 'bg-pink-500',
  },
  purple: {
    bg: 'bg-purple-600',
    border: 'border-purple-400',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.6)]',
    fill: 'bg-purple-500',
  },
  green: {
    bg: 'bg-green-600',
    border: 'border-green-400',
    glow: 'shadow-[0_0_30px_rgba(34,197,94,0.6)]',
    fill: 'bg-green-500',
  },
  amber: {
    bg: 'bg-amber-600',
    border: 'border-amber-400',
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.6)]',
    fill: 'bg-amber-500',
  },
  emerald: {
    bg: 'bg-emerald-600',
    border: 'border-emerald-400',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.6)]',
    fill: 'bg-emerald-500',
  },
  orange: {
    bg: 'bg-orange-600',
    border: 'border-orange-400',
    glow: 'shadow-[0_0_30px_rgba(249,115,22,0.6)]',
    fill: 'bg-orange-500',
  },
  cyan: {
    bg: 'bg-cyan-600',
    border: 'border-cyan-400',
    glow: 'shadow-[0_0_30px_rgba(6,182,212,0.6)]',
    fill: 'bg-cyan-500',
  },
  sky: {
    bg: 'bg-sky-600',
    border: 'border-sky-400',
    glow: 'shadow-[0_0_30px_rgba(14,165,233,0.6)]',
    fill: 'bg-sky-500',
  },
  teal: {
    bg: 'bg-teal-600',
    border: 'border-teal-400',
    glow: 'shadow-[0_0_30px_rgba(20,184,166,0.6)]',
    fill: 'bg-teal-500',
  },
  fuchsia: {
    bg: 'bg-fuchsia-600',
    border: 'border-fuchsia-400',
    glow: 'shadow-[0_0_30px_rgba(217,70,239,0.6)]',
    fill: 'bg-fuchsia-500',
  },
  yellow: {
    bg: 'bg-yellow-600',
    border: 'border-yellow-400',
    glow: 'shadow-[0_0_30px_rgba(234,179,8,0.6)]',
    fill: 'bg-yellow-500',
  },
  lime: {
    bg: 'bg-lime-600',
    border: 'border-lime-400',
    glow: 'shadow-[0_0_30px_rgba(132,204,22,0.6)]',
    fill: 'bg-lime-500',
  },
};

export function TeamSelectionScreen({
  teams,
  hasMemberWon,
  onSelectTeam,
  onViewWinners,
}: TeamSelectionScreenProps) {
  const getTeamWinnerCount = (team: Team) => {
    return team.members.filter(m => hasMemberWon(m.id)).length;
  };

  const getRemainingMembers = (team: Team) => {
    return team.members.filter(m => !hasMemberWon(m.id));
  };

  const totalMembers = teams.reduce((sum, t) => sum + t.members.length, 0);
  const totalWinners = teams.reduce((sum, t) => sum + getTeamWinnerCount(t), 0);
  const remainingPrizes = totalMembers - totalWinners;

  return (
    // CAMERA-OPTIMIZED: Solid black background
    <div className="min-h-screen bg-black relative overflow-hidden">
      <ParticlesBackground variant="ambient" />

      <div className="relative z-10 min-h-screen w-full flex justify-center">
        <div className="w-full max-w-7xl px-8" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>

          {/* CAMERA-OPTIMIZED: Massive header */}
          <motion.header
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
            style={{ marginBottom: '3rem' }}
          >
            <div className="flex items-center justify-center gap-6 mb-4">
              <Sparkles className="w-16 h-16 text-amber-400 animate-pulse" />
              <h1 className="font-display font-black text-gold-gradient text-glow" style={{ fontSize: '5rem', lineHeight: 1.1 }}>
                Sorteo de Fin de Año
              </h1>
              <Sparkles className="w-16 h-16 text-amber-400 animate-pulse" />
            </div>
            <p className="text-white font-bold" style={{ fontSize: '2rem' }}>Selecciona un equipo para comenzar</p>
          </motion.header>

          {/* CAMERA-OPTIMIZED: Large stats bar with solid backgrounds */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-8"
            style={{ marginBottom: '3rem' }}
          >
            {/* Teams stat */}
            <div
              className="flex items-center bg-blue-900 rounded-2xl border-4 border-blue-500"
              style={{ gap: '1.5rem', padding: '1.5rem 2.5rem' }}
            >
              <div className="w-20 h-20 rounded-xl bg-blue-600 flex items-center justify-center border-2 border-blue-400">
                <Users className="w-12 h-12 text-white" />
              </div>
              <div>
                <p className="font-black text-white" style={{ fontSize: '3.5rem', lineHeight: 1 }}>{teams.length}</p>
                <p className="font-bold text-blue-200" style={{ fontSize: '1.5rem' }}>Teams</p>
              </div>
            </div>

            {/* Remaining prizes stat */}
            <div
              className="flex items-center bg-emerald-900 rounded-2xl border-4 border-emerald-500"
              style={{ gap: '1.5rem', padding: '1.5rem 2.5rem' }}
            >
              <div className="w-20 h-20 rounded-xl bg-emerald-600 flex items-center justify-center border-2 border-emerald-400">
                <span style={{ fontSize: '3rem' }}>🎁</span>
              </div>
              <div>
                <p className="font-black text-white" style={{ fontSize: '3.5rem', lineHeight: 1 }}>{remainingPrizes}</p>
                <p className="font-bold text-emerald-200" style={{ fontSize: '1.5rem' }}>Premios Restantes</p>
              </div>
            </div>

            {/* Winners button */}
            <button
              onClick={onViewWinners}
              className="flex items-center bg-amber-900 rounded-2xl border-4 border-amber-400 hover:border-amber-300 hover:bg-amber-800 transition-all group"
              style={{ gap: '1.5rem', padding: '1.5rem 2.5rem' }}
            >
              <div className="w-20 h-20 rounded-xl bg-amber-600 flex items-center justify-center border-2 border-amber-400">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <div className="text-left">
                <p className="font-black text-white" style={{ fontSize: '3.5rem', lineHeight: 1 }}>{totalWinners}</p>
                <p className="font-bold text-amber-200" style={{ fontSize: '1.5rem' }}>Ganadores</p>
              </div>
              <ChevronRight className="w-10 h-10 text-amber-300 group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>

          {/* CAMERA-OPTIMIZED: Large team cards grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {teams.map((team, index) => {
              const colorConfig = teamColorConfig[team.color] || teamColorConfig.blue;
              const remaining = getRemainingMembers(team);
              const winnerCount = getTeamWinnerCount(team);
              const allDone = remaining.length === 0;

              return (
                <motion.button
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  whileHover={{ scale: allDone ? 1 : 1.02, y: allDone ? 0 : -4 }}
                  whileTap={{ scale: allDone ? 1 : 0.98 }}
                  onClick={() => !allDone && onSelectTeam(team)}
                  disabled={allDone}
                  className={`
                    relative overflow-hidden rounded-2xl border-4 text-left
                    bg-gray-900
                    ${colorConfig.border} ${colorConfig.glow}
                    ${allDone ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-800 cursor-pointer'}
                    transition-all duration-300 group
                  `}
                  style={{ padding: '2rem' }}
                >
                  {/* Team emoji and name */}
                  <div className="flex items-center" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className={`w-24 h-24 rounded-xl ${colorConfig.bg} flex items-center justify-center border-2 border-white/30`}>
                      <span style={{ fontSize: '4rem' }}>{team.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-white" style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>{team.name}</h3>
                      <p className="text-gray-300 font-bold" style={{ fontSize: '1.5rem' }}>{team.members.length} miembros</p>
                    </div>
                    {!allDone && (
                      <ChevronRight className="w-12 h-12 text-white opacity-60 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                    )}
                  </div>

                  {/* Progress bar - CAMERA-OPTIMIZED: Thicker, higher contrast */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div className="flex justify-between font-bold" style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                      <span className="text-gray-300">Progress</span>
                      <span className="text-white">{winnerCount}/{team.members.length}</span>
                    </div>
                    <div className="h-6 bg-gray-700 rounded-full overflow-hidden border-2 border-gray-600">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(winnerCount / team.members.length) * 100}%` }}
                        transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                        className={`h-full ${colorConfig.fill} rounded-full`}
                      />
                    </div>
                  </div>

                  {/* Status - CAMERA-OPTIMIZED: Larger text */}
                  <p className={`font-bold ${allDone ? 'text-green-400' : 'text-gray-400'}`} style={{ fontSize: '1.5rem' }}>
                    {allDone ? '✓ ¡Todos han ganado!' : `${remaining.length} miembros esperando`}
                  </p>
                </motion.button>
              );
            })}
          </motion.div>

          {/* All done message - CAMERA-OPTIMIZED */}
          {remainingPrizes === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
              style={{ marginTop: '4rem' }}
            >
              <Trophy className="w-32 h-32 mx-auto text-amber-400 mb-6" />
              <h2 className="font-black text-white mb-4" style={{ fontSize: '3rem' }}>¡Todos los Premios Entregados!</h2>
              <p className="text-gray-300 font-bold mb-8" style={{ fontSize: '1.75rem' }}>El sorteo ha terminado. ¡Todos tienen un premio!</p>
              <button onClick={onViewWinners} className="btn-gold">
                Ver Muro de Ganadores
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
