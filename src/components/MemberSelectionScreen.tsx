import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Gift, User } from 'lucide-react';
import type { Team, Member } from '../types';
import type { Winner } from '../types';
import { ParticlesBackground } from './Particles';

interface MemberSelectionScreenProps {
  team: Team;
  hasMemberWon: (memberId: number) => boolean;
  getMemberWinner: (memberId: number) => Winner | undefined;
  onSelectMember: (member: Member) => void;
  onBack: () => void;
}

const teamColorConfig: Record<string, { bg: string; border: string; accent: string }> = {
  blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', accent: 'text-blue-400' },
  red: { bg: 'bg-red-500/20', border: 'border-red-500/50', accent: 'text-red-400' },
  pink: { bg: 'bg-pink-500/20', border: 'border-pink-500/50', accent: 'text-pink-400' },
  purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/50', accent: 'text-purple-400' },
  green: { bg: 'bg-green-500/20', border: 'border-green-500/50', accent: 'text-green-400' },
  amber: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', accent: 'text-amber-400' },
  emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', accent: 'text-emerald-400' },
  orange: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', accent: 'text-orange-400' },
  cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', accent: 'text-cyan-400' },
  sky: { bg: 'bg-sky-500/20', border: 'border-sky-500/50', accent: 'text-sky-400' },
  teal: { bg: 'bg-teal-500/20', border: 'border-teal-500/50', accent: 'text-teal-400' },
  fuchsia: { bg: 'bg-fuchsia-500/20', border: 'border-fuchsia-500/50', accent: 'text-fuchsia-400' },
  yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', accent: 'text-yellow-400' },
  lime: { bg: 'bg-lime-500/20', border: 'border-lime-500/50', accent: 'text-lime-400' },
};

export function MemberSelectionScreen({
  team,
  hasMemberWon,
  getMemberWinner,
  onSelectMember,
  onBack,
}: MemberSelectionScreenProps) {
  const colorConfig = teamColorConfig[team.color] || teamColorConfig.blue;

  // Sort members: non-winners first, then winners (using linked member check)
  const sortedMembers = [...team.members].sort((a, b) => {
    const aWon = hasMemberWon(a.id);
    const bWon = hasMemberWon(b.id);
    if (aWon && !bWon) return 1;
    if (!aWon && bWon) return -1;
    return 0;
  });

  const remainingMembers = team.members.filter(m => !hasMemberWon(m.id));
  const teamWinnerCount = team.members.length - remainingMembers.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <ParticlesBackground variant="ambient" />

      <div className="relative z-10 min-h-screen w-full flex justify-center">
        <div className="w-full max-w-5xl px-6 sm:px-10 lg:px-12" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>

          {/* Header with back button */}
          <motion.header
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center relative"
            style={{ marginBottom: '3rem' }}
          >
            <button
              onClick={onBack}
              className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
              <span className="hidden sm:inline">Volver a Equipos</span>
            </button>

            <div className="flex items-center justify-center gap-4 mb-3">
              <span className="text-5xl">{team.emoji}</span>
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-white">
                {team.name}
              </h1>
            </div>
            <p className="text-xl text-slate-400">Selecciona un miembro para sortear su premio</p>
          </motion.header>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-8"
            style={{ marginBottom: '4rem' }}
          >
            <div className={`flex items-center ${colorConfig.bg} rounded-2xl border ${colorConfig.border}`} style={{ gap: '2rem', padding: '2rem 3rem' }}>
              <div className={`w-16 h-16 rounded-xl ${colorConfig.bg} flex items-center justify-center border border-white/10`}>
                <User className={`w-8 h-8 ${colorConfig.accent}`} />
              </div>
              <div style={{ marginRight: '1rem' }}>
                <p className="text-4xl font-bold text-white" style={{ marginBottom: '0.25rem' }}>{remainingMembers.length}</p>
                <p className="text-base text-slate-400">Esperando</p>
              </div>
            </div>

            <div className="flex items-center bg-yellow-500/20 rounded-2xl border border-yellow-500/50" style={{ gap: '2rem', padding: '2rem 3rem' }}>
              <div className="w-16 h-16 rounded-xl bg-yellow-500/30 flex items-center justify-center border border-yellow-500/30">
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
              <div style={{ marginRight: '1rem' }}>
                <p className="text-4xl font-bold text-white" style={{ marginBottom: '0.25rem' }}>{teamWinnerCount}</p>
                <p className="text-base text-slate-400">Ganaron</p>
              </div>
            </div>
          </motion.div>

          {/* Members Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {sortedMembers.map((member, index) => {
              const hasWon = hasMemberWon(member.id);
              const winner = getMemberWinner(member.id);
              const prize = winner?.prizeType || null;

              return (
                <motion.button
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * index }}
                  whileHover={{ scale: hasWon ? 1 : 1.02 }}
                  whileTap={{ scale: hasWon ? 1 : 0.98 }}
                  onClick={() => !hasWon && onSelectMember(member)}
                  disabled={hasWon}
                  className={`
                    relative p-5 rounded-xl border-2 text-left transition-all duration-200
                    ${hasWon
                      ? 'bg-slate-800/30 border-slate-700/30 opacity-60 cursor-default'
                      : `bg-slate-800/70 ${colorConfig.border} hover:bg-slate-800/90 cursor-pointer hover:shadow-lg`
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar placeholder */}
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold
                      ${hasWon ? 'bg-slate-700/50 text-slate-500' : `${colorConfig.bg} ${colorConfig.accent}`}
                    `}>
                      {member.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold truncate ${hasWon ? 'text-slate-500' : 'text-white'}`}>
                        {member.name}
                      </h3>

                      {/* Show won prize or ready status */}
                      {hasWon && prize ? (
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <span>{prize.emoji}</span>
                          <span className="text-yellow-500/70 truncate">{prize.name}</span>
                        </div>
                      ) : (
                        <p className="text-sm truncate text-slate-400">
                          Listo para sortear
                        </p>
                      )}
                    </div>

                    {/* Status indicator */}
                    {hasWon ? (
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-green-500" />
                      </div>
                    ) : (
                      <div className={`w-8 h-8 rounded-full ${colorConfig.bg} flex items-center justify-center`}>
                        <Gift className={`w-4 h-4 ${colorConfig.accent}`} />
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* All done message */}
          {remainingMembers.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
              style={{ marginTop: '3rem' }}
            >
              <div className={`inline-flex items-center gap-3 px-6 py-3 ${colorConfig.bg} rounded-full border ${colorConfig.border}`}>
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-medium">¡Todos los miembros del equipo han ganado sus premios!</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
