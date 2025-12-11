import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Download } from 'lucide-react';
import type { Winner, Team } from '../types';
import { ParticlesBackground } from './Particles';

interface WinnersWallProps {
  winners: Winner[];
  teams: Team[];
  onBack: () => void;
}

// CAMERA-OPTIMIZED: High contrast solid tier colors
const tierColors = {
  grand: 'from-purple-500 to-purple-400',
  gold: 'from-amber-400 to-amber-300',
  silver: 'from-gray-300 to-gray-200',
  bronze: 'from-amber-600 to-amber-500',
};

const tierBorders = {
  grand: 'border-purple-400',
  gold: 'border-amber-400',
  silver: 'border-gray-300',
  bronze: 'border-amber-600',
};

const tierBg = {
  grand: 'bg-purple-900',
  gold: 'bg-amber-900',
  silver: 'bg-gray-800',
  bronze: 'bg-amber-950',
};

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

export function WinnersWall({ winners, teams, onBack }: WinnersWallProps) {
  const winnersByTeam = teams.map(team => ({
    team,
    winners: winners.filter(w => w.teamId === team.id),
  })).filter(group => group.winners.length > 0);

  const downloadWinnersReport = () => {
    const date = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let report = `SORTEO DE PREMIOS FIN DE AÑO\n`;
    report += `${'='.repeat(50)}\n`;
    report += `Fecha: ${date}\n`;
    report += `Total de ganadores: ${winners.length}\n`;
    report += `${'='.repeat(50)}\n\n`;

    winnersByTeam.forEach(({ team, winners: teamWinners }) => {
      report += `\n${team.emoji} ${team.name.toUpperCase()}\n`;
      report += `${'-'.repeat(40)}\n`;
      teamWinners.forEach(winner => {
        report += `  ${winner.memberName}\n`;
        report += `    Premio: ${winner.prizeType.emoji} ${winner.prizeType.name}\n`;
        report += `    Valor: ${winner.prizeType.value}\n`;
      });
    });

    report += `\n\n${'='.repeat(50)}\n`;
    report += `RESUMEN POR TIPO DE PREMIO\n`;
    report += `${'='.repeat(50)}\n`;

    const prizeTypeCounts: Record<string, { name: string; emoji: string; count: number; winners: string[] }> = {};
    winners.forEach(w => {
      const key = w.prizeType.name;
      if (!prizeTypeCounts[key]) {
        prizeTypeCounts[key] = { name: w.prizeType.name, emoji: w.prizeType.emoji, count: 0, winners: [] };
      }
      prizeTypeCounts[key].count++;
      prizeTypeCounts[key].winners.push(`${w.memberName} (${w.teamName})`);
    });

    Object.values(prizeTypeCounts).forEach(({ name, emoji, count, winners: prizeWinners }) => {
      report += `\n${emoji} ${name}: ${count} entregado${count !== 1 ? 's' : ''}\n`;
      prizeWinners.forEach(w => {
        report += `   - ${w}\n`;
      });
    });

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sorteo-premios-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // CAMERA-OPTIMIZED: Large winner card
  const WinnerCard = ({ winner, index }: { winner: Winner; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl border-4 ${tierBorders[winner.prizeType.tier]} ${tierBg[winner.prizeType.tier]}`}
      style={{ padding: '1.5rem' }}
    >
      <div className="flex items-center gap-5">
        <span style={{ fontSize: '4rem' }}>{winner.prizeType.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-white truncate" style={{ fontSize: '1.75rem' }}>{winner.memberName}</h3>
          <p className={`font-black bg-gradient-to-r ${tierColors[winner.prizeType.tier]} bg-clip-text text-transparent truncate`} style={{ fontSize: '1.5rem' }}>
            {winner.prizeType.name}
          </p>
          <p className="font-bold text-green-400" style={{ fontSize: '1.25rem' }}>
            {winner.prizeType.value}
          </p>
        </div>
      </div>
    </motion.div>
  );

  const TeamSection = ({ team, teamWinners, index }: {
    team: Team;
    teamWinners: Winner[];
    index: number;
  }) => {
    const colorConfig = teamColorConfig[team.color] || teamColorConfig.blue;

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 * index }}
        style={{ marginBottom: '3rem' }}
      >
        {/* Team header - CAMERA-OPTIMIZED */}
        <div
          className={`flex items-center rounded-2xl ${colorConfig.bg.replace('600', '900')} border-4 ${colorConfig.border}`}
          style={{ gap: '1.5rem', padding: '1.5rem 2rem', marginBottom: '1.5rem' }}
        >
          <div className={`w-20 h-20 rounded-xl ${colorConfig.bg} flex items-center justify-center border-2 border-white/30`}>
            <span style={{ fontSize: '3.5rem' }}>{team.emoji}</span>
          </div>
          <div className="flex-1">
            <h2 className={`font-black ${colorConfig.accent}`} style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>{team.name}</h2>
            <p className="text-gray-300 font-bold" style={{ fontSize: '1.5rem' }}>{teamWinners.length} ganador{teamWinners.length !== 1 ? 'es' : ''}</p>
          </div>
        </div>

        {/* Winners grid - CAMERA-OPTIMIZED */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {teamWinners.map((winner, i) => (
            <WinnerCard key={winner.memberId} winner={winner} index={i} />
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    // CAMERA-OPTIMIZED: Solid black background
    <div className="min-h-screen bg-black relative overflow-hidden">
      <ParticlesBackground variant="ambient" />

      <div className="relative z-10 w-full flex justify-center">
        <div className="w-full max-w-7xl px-8" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
          {/* Header - CAMERA-OPTIMIZED */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center relative"
            style={{ marginBottom: '3rem' }}
          >
            <button
              onClick={onBack}
              className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-3 text-white hover:text-amber-400 transition-colors bg-gray-800 rounded-xl border-2 border-gray-600 hover:border-amber-400"
              style={{ padding: '1rem 1.5rem', fontSize: '1.25rem' }}
            >
              <ArrowLeft size={32} />
              <span className="font-bold">Volver</span>
            </button>

            <div className="flex items-center justify-center gap-5 mb-4">
              <Trophy className="w-16 h-16 text-amber-400" />
              <h1 className="font-display font-black text-gold-gradient text-glow" style={{ fontSize: '4.5rem' }}>
                Muro de Ganadores
              </h1>
              <Trophy className="w-16 h-16 text-amber-400" />
            </div>
            <p className="text-white font-bold" style={{ fontSize: '1.75rem' }}>
              {winners.length} ganador{winners.length !== 1 ? 'es' : ''} hasta ahora
            </p>

            {winners.length > 0 && (
              <button
                onClick={downloadWinnersReport}
                className="mt-6 inline-flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border-4 border-gray-600 hover:border-amber-400 rounded-xl text-white hover:text-amber-400 transition-colors font-bold"
                style={{ padding: '1rem 2rem', fontSize: '1.25rem' }}
              >
                <Download size={28} />
                <span>Descargar Informe</span>
              </button>
            )}
          </motion.div>

          {/* Winners by team */}
          {winners.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Trophy className="w-32 h-32 mx-auto text-gray-700 mb-6" />
              <p className="font-black text-gray-500" style={{ fontSize: '2.5rem' }}>Aún no hay ganadores</p>
              <p className="text-gray-600 font-bold mt-3" style={{ fontSize: '1.5rem' }}>¡Comienza el sorteo para ver a los ganadores aquí!</p>
            </motion.div>
          ) : (
            <>
              {winnersByTeam.map((group, index) => (
                <TeamSection
                  key={group.team.id}
                  team={group.team}
                  teamWinners={group.winners}
                  index={index}
                />
              ))}

              {/* Prize tier summary - CAMERA-OPTIMIZED */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-6"
                style={{ marginTop: '3rem' }}
              >
                {(['grand', 'gold', 'silver', 'bronze'] as const).map(tier => {
                  const count = winners.filter(w => w.prizeType.tier === tier).length;
                  if (count === 0) return null;
                  return (
                    <div
                      key={tier}
                      className={`rounded-full border-4 ${tierBorders[tier]} ${tierBg[tier]}`}
                      style={{ padding: '1rem 2rem' }}
                    >
                      <span className={`font-black bg-gradient-to-r ${tierColors[tier]} bg-clip-text text-transparent uppercase`} style={{ fontSize: '1.5rem' }}>
                        {tier}
                      </span>
                      <span className="text-white font-bold ml-3" style={{ fontSize: '1.5rem' }}>× {count}</span>
                    </div>
                  );
                })}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
