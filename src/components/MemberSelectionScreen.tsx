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

// CAMERA-OPTIMIZED: High contrast solid colors
const teamColorConfig: Record<string, { bg: string; border: string; accent: string }> = {
  blue: { bg: 'bg-blue-600', border: 'border-blue-400', accent: 'text-blue-300' },
  red: { bg: 'bg-red-600', border: 'border-red-400', accent: 'text-red-300' },
  pink: { bg: 'bg-pink-600', border: 'border-pink-400', accent: 'text-pink-300' },
  purple: { bg: 'bg-purple-600', border: 'border-purple-400', accent: 'text-purple-300' },
  green: { bg: 'bg-green-600', border: 'border-green-400', accent: 'text-green-300' },
  amber: { bg: 'bg-amber-600', border: 'border-amber-400', accent: 'text-amber-300' },
  emerald: { bg: 'bg-emerald-600', border: 'border-emerald-400', accent: 'text-emerald-300' },
  orange: { bg: 'bg-orange-600', border: 'border-orange-400', accent: 'text-orange-300' },
  cyan: { bg: 'bg-cyan-600', border: 'border-cyan-400', accent: 'text-cyan-300' },
  sky: { bg: 'bg-sky-600', border: 'border-sky-400', accent: 'text-sky-300' },
  teal: { bg: 'bg-teal-600', border: 'border-teal-400', accent: 'text-teal-300' },
  fuchsia: { bg: 'bg-fuchsia-600', border: 'border-fuchsia-400', accent: 'text-fuchsia-300' },
  yellow: { bg: 'bg-yellow-600', border: 'border-yellow-400', accent: 'text-yellow-300' },
  lime: { bg: 'bg-lime-600', border: 'border-lime-400', accent: 'text-lime-300' },
};

export function MemberSelectionScreen({
  team,
  hasMemberWon,
  getMemberWinner,
  onSelectMember,
  onBack,
}: MemberSelectionScreenProps) {
  const colorConfig = teamColorConfig[team.color] || teamColorConfig.blue;

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
    // CAMERA-OPTIMIZED: Solid black background
    <div className="min-h-screen bg-black relative overflow-hidden">
      <ParticlesBackground variant="ambient" />

      <div className="relative z-10 min-h-screen w-full flex justify-center">
        <div className="w-full max-w-6xl px-8" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>

          {/* CAMERA-OPTIMIZED: Large header with back button */}
          <motion.header
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center relative"
            style={{ marginBottom: '2.5rem' }}
          >
            <button
              onClick={onBack}
              className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-3 text-white hover:text-amber-400 transition-colors bg-gray-800 rounded-xl border-2 border-gray-600 hover:border-amber-400"
              style={{ padding: '1rem 1.5rem', fontSize: '1.25rem' }}
            >
              <ArrowLeft size={32} />
              <span className="font-bold">Volver</span>
            </button>

            <div className="flex items-center justify-center gap-5 mb-3">
              <span style={{ fontSize: '5rem' }}>{team.emoji}</span>
              <h1 className="font-display font-black text-white" style={{ fontSize: '4rem' }}>
                {team.name}
              </h1>
            </div>
            <p className="text-white font-bold" style={{ fontSize: '1.75rem' }}>Selecciona un miembro para sortear su premio</p>
          </motion.header>

          {/* CAMERA-OPTIMIZED: Large stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-8"
            style={{ marginBottom: '2.5rem' }}
          >
            {/* Waiting stat */}
            <div
              className={`flex items-center ${colorConfig.bg.replace('600', '900')} rounded-2xl border-4 ${colorConfig.border}`}
              style={{ gap: '1.5rem', padding: '1.5rem 2.5rem' }}
            >
              <div className={`w-20 h-20 rounded-xl ${colorConfig.bg} flex items-center justify-center border-2 border-white/30`}>
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <p className="font-black text-white" style={{ fontSize: '3.5rem', lineHeight: 1 }}>{remainingMembers.length}</p>
                <p className={`font-bold ${colorConfig.accent}`} style={{ fontSize: '1.5rem' }}>Esperando</p>
              </div>
            </div>

            {/* Winners stat */}
            <div
              className="flex items-center bg-amber-900 rounded-2xl border-4 border-amber-400"
              style={{ gap: '1.5rem', padding: '1.5rem 2.5rem' }}
            >
              <div className="w-20 h-20 rounded-xl bg-amber-600 flex items-center justify-center border-2 border-amber-400">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <div>
                <p className="font-black text-white" style={{ fontSize: '3.5rem', lineHeight: 1 }}>{teamWinnerCount}</p>
                <p className="font-bold text-amber-200" style={{ fontSize: '1.5rem' }}>Ganaron</p>
              </div>
            </div>
          </motion.div>

          {/* CAMERA-OPTIMIZED: Large members grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
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
                    relative rounded-2xl border-4 text-left transition-all duration-200
                    ${hasWon
                      ? 'bg-gray-900 border-gray-700 opacity-50 cursor-default'
                      : `bg-gray-900 ${colorConfig.border} hover:bg-gray-800 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)]`
                    }
                  `}
                  style={{ padding: '1.5rem' }}
                >
                  <div className="flex items-center gap-5">
                    {/* Avatar */}
                    <div className={`
                      w-20 h-20 rounded-full flex items-center justify-center font-black
                      ${hasWon ? 'bg-gray-700 text-gray-500' : `${colorConfig.bg} text-white`}
                    `}
                    style={{ fontSize: '2.5rem' }}
                    >
                      {member.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className={`font-black truncate ${hasWon ? 'text-gray-500' : 'text-white'}`} style={{ fontSize: '1.75rem' }}>
                        {member.name}
                      </h3>

                      {hasWon && prize ? (
                        <div className="mt-2 flex items-center gap-3">
                          <span style={{ fontSize: '2rem' }}>{prize.emoji}</span>
                          <span className="text-amber-400 font-bold truncate" style={{ fontSize: '1.25rem' }}>{prize.name}</span>
                        </div>
                      ) : (
                        <p className="font-bold text-gray-400 mt-1" style={{ fontSize: '1.25rem' }}>
                          Listo para sortear
                        </p>
                      )}
                    </div>

                    {/* Status indicator - CAMERA-OPTIMIZED: Larger */}
                    {hasWon ? (
                      <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center border-2 border-green-400">
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                    ) : (
                      <div className={`w-16 h-16 rounded-full ${colorConfig.bg} flex items-center justify-center border-2 border-white/30`}>
                        <Gift className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* All done message - CAMERA-OPTIMIZED */}
          {remainingMembers.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
              style={{ marginTop: '3rem' }}
            >
              <div className={`inline-flex items-center gap-4 ${colorConfig.bg.replace('600', '900')} rounded-2xl border-4 ${colorConfig.border}`} style={{ padding: '1.5rem 2.5rem' }}>
                <Trophy className="w-10 h-10 text-amber-400" />
                <span className="text-white font-bold" style={{ fontSize: '1.5rem' }}>¡Todos los miembros del equipo han ganado sus premios!</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
