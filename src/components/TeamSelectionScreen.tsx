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

const teamColorConfig: Record<string, { bg: string; border: string; glow: string; fill: string }> = {
  blue: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    fill: 'bg-blue-500',
  },
  red: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/50',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    fill: 'bg-red-500',
  },
  pink: {
    bg: 'bg-pink-500/20',
    border: 'border-pink-500/50',
    glow: 'shadow-[0_0_20px_rgba(236,72,153,0.3)]',
    fill: 'bg-pink-500',
  },
  purple: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    fill: 'bg-purple-500',
  },
  green: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/50',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    fill: 'bg-green-500',
  },
  amber: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/50',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    fill: 'bg-amber-500',
  },
  emerald: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/50',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    fill: 'bg-emerald-500',
  },
  orange: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/50',
    glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]',
    fill: 'bg-orange-500',
  },
  cyan: {
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/50',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    fill: 'bg-cyan-500',
  },
  sky: {
    bg: 'bg-sky-500/20',
    border: 'border-sky-500/50',
    glow: 'shadow-[0_0_20px_rgba(14,165,233,0.3)]',
    fill: 'bg-sky-500',
  },
  teal: {
    bg: 'bg-teal-500/20',
    border: 'border-teal-500/50',
    glow: 'shadow-[0_0_20px_rgba(20,184,166,0.3)]',
    fill: 'bg-teal-500',
  },
  fuchsia: {
    bg: 'bg-fuchsia-500/20',
    border: 'border-fuchsia-500/50',
    glow: 'shadow-[0_0_20px_rgba(217,70,239,0.3)]',
    fill: 'bg-fuchsia-500',
  },
  yellow: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/50',
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
    fill: 'bg-yellow-500',
  },
  lime: {
    bg: 'bg-lime-500/20',
    border: 'border-lime-500/50',
    glow: 'shadow-[0_0_20px_rgba(132,204,22,0.3)]',
    fill: 'bg-lime-500',
  },
};

export function TeamSelectionScreen({
  teams,
  hasMemberWon,
  onSelectTeam,
  onViewWinners,
}: TeamSelectionScreenProps) {
  // Count winners per team (using linked member check)
  const getTeamWinnerCount = (team: Team) => {
    return team.members.filter(m => hasMemberWon(m.id)).length;
  };

  // Get members who haven't won yet in a team (using linked member check)
  const getRemainingMembers = (team: Team) => {
    return team.members.filter(m => !hasMemberWon(m.id));
  };

  const totalMembers = teams.reduce((sum, t) => sum + t.members.length, 0);
  const totalWinners = teams.reduce((sum, t) => sum + getTeamWinnerCount(t), 0);
  const remainingPrizes = totalMembers - totalWinners;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <ParticlesBackground variant="ambient" />

      <div className="relative z-10 min-h-screen w-full flex justify-center">
        <div className="w-full max-w-6xl px-6 sm:px-10 lg:px-12" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>

          {/* Header */}
          <motion.header
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
            style={{ marginBottom: '4rem' }}
          >
            <div className="flex items-center justify-center gap-4 mb-5">
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 animate-pulse" />
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-gold-gradient">
                Sorteo de Fin de Año
              </h1>
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-xl sm:text-2xl text-slate-400 font-light">Selecciona un equipo para comenzar</p>
          </motion.header>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-6 sm:gap-8"
            style={{ marginBottom: '6rem' }}
          >
            <div className="flex items-center bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50" style={{ gap: '2rem', padding: '2rem 3rem' }}>
              <div className="w-16 h-16 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <div style={{ marginRight: '1rem' }}>
                <p className="text-4xl font-bold text-white" style={{ marginBottom: '0.25rem' }}>{teams.length}</p>
                <p className="text-base text-slate-400">Teams</p>
              </div>
            </div>

            <div className="flex items-center bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50" style={{ gap: '2rem', padding: '2rem 3rem' }}>
              <div className="w-16 h-16 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <span className="text-3xl">🎁</span>
              </div>
              <div style={{ marginRight: '1rem' }}>
                <p className="text-4xl font-bold text-white" style={{ marginBottom: '0.25rem' }}>{remainingPrizes}</p>
                <p className="text-base text-slate-400">Premios Restantes</p>
              </div>
            </div>

            <button
              onClick={onViewWinners}
              className="flex items-center bg-slate-800/60 backdrop-blur-sm rounded-2xl border-2 border-yellow-500/40 hover:border-yellow-400 hover:bg-slate-800/80 transition-all group"
              style={{ gap: '2rem', padding: '2rem 3rem' }}
            >
              <div className="w-16 h-16 rounded-xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-left" style={{ marginRight: '1rem' }}>
                <p className="text-4xl font-bold text-white" style={{ marginBottom: '0.25rem' }}>{totalWinners}</p>
                <p className="text-base text-slate-400">Ganadores</p>
              </div>
              <ChevronRight className="w-6 h-6 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </motion.div>

          {/* Teams Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                  whileHover={{ scale: allDone ? 1 : 1.03, y: allDone ? 0 : -4 }}
                  whileTap={{ scale: allDone ? 1 : 0.98 }}
                  onClick={() => !allDone && onSelectTeam(team)}
                  disabled={allDone}
                  className={`
                    relative overflow-hidden rounded-2xl border-2 text-left
                    bg-slate-800/70 backdrop-blur-sm
                    ${colorConfig.border} ${colorConfig.glow}
                    ${allDone ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800/90 cursor-pointer'}
                    transition-all duration-300 group
                  `}
                  style={{ padding: '2rem' }}
                >
                  {/* Team emoji and name */}
                  <div className="flex items-center" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className={`w-20 h-20 rounded-xl ${colorConfig.bg} flex items-center justify-center border border-white/10`}>
                      <span className="text-5xl">{team.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white" style={{ marginBottom: '0.25rem' }}>{team.name}</h3>
                      <p className="text-slate-400 text-lg">{team.members.length} miembros</p>
                    </div>
                    {!allDone && (
                      <ChevronRight className="w-7 h-7 text-slate-400 group-hover:text-white transition-colors" />
                    )}
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div className="flex justify-between text-sm" style={{ marginBottom: '0.5rem' }}>
                      <span className="text-slate-400">Progress</span>
                      <span className="text-slate-300">{winnerCount}/{team.members.length}</span>
                    </div>
                    <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(winnerCount / team.members.length) * 100}%` }}
                        transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                        className={`h-full ${colorConfig.fill} rounded-full`}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <p className={`text-base ${allDone ? 'text-green-400' : 'text-slate-500'}`}>
                    {allDone ? '✓ ¡Todos han ganado!' : `${remaining.length} miembros esperando`}
                  </p>
                </motion.button>
              );
            })}
          </motion.div>

          {/* All done message */}
          {remainingPrizes === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
              style={{ marginTop: '4rem' }}
            >
              <Trophy className="w-20 h-20 mx-auto text-yellow-400 mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">¡Todos los Premios Entregados!</h2>
              <p className="text-slate-400 mb-6">El sorteo ha terminado. ¡Todos tienen un premio!</p>
              <button onClick={onViewWinners} className="btn-gold text-xl">
                Ver Muro de Ganadores
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
