import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Download } from 'lucide-react';
import type { Winner, Team } from '../types';
import { ParticlesBackground } from './Particles';

interface WinnersWallProps {
  winners: Winner[];
  teams: Team[];
  onBack: () => void;
}

const tierColors = {
  grand: 'from-purple-500 to-pink-500',
  gold: 'from-yellow-400 to-amber-500',
  silver: 'from-gray-300 to-gray-400',
  bronze: 'from-amber-600 to-amber-700',
};

const tierBorders = {
  grand: 'border-purple-400',
  gold: 'border-yellow-400',
  silver: 'border-gray-300',
  bronze: 'border-amber-600',
};

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

export function WinnersWall({ winners, teams, onBack }: WinnersWallProps) {
  // Group winners by team
  const winnersByTeam = teams.map(team => ({
    team,
    winners: winners.filter(w => w.teamId === team.id),
  })).filter(group => group.winners.length > 0);

  // Generate and download winners report
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

    // Group by team for the report
    winnersByTeam.forEach(({ team, winners: teamWinners }) => {
      report += `\n${team.emoji} ${team.name.toUpperCase()}\n`;
      report += `${'-'.repeat(40)}\n`;
      teamWinners.forEach(winner => {
        report += `  ${winner.memberName}\n`;
        report += `    Premio: ${winner.prizeType.emoji} ${winner.prizeType.name}\n`;
        report += `    Valor: ${winner.prizeType.value}\n`;
      });
    });

    // Summary by prize type
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

    // Create and download file
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

  const WinnerCard = ({ winner, index }: { winner: Winner; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`prize-card border-2 ${tierBorders[winner.prizeType.tier]}`}
    >
      <div className="flex items-center gap-4">
        <span className="text-4xl">{winner.prizeType.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white truncate">{winner.memberName}</h3>
          <p className={`text-sm font-bold bg-gradient-to-r ${tierColors[winner.prizeType.tier]} bg-clip-text text-transparent truncate`}>
            {winner.prizeType.name}
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
        {/* Team header */}
        <div className={`flex items-center rounded-2xl ${colorConfig.bg} border ${colorConfig.border}`} style={{ gap: '1.5rem', padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
          <div className={`w-16 h-16 rounded-xl ${colorConfig.bg} flex items-center justify-center border border-white/10`}>
            <span className="text-4xl">{team.emoji}</span>
          </div>
          <div className="flex-1">
            <h2 className={`text-2xl font-bold ${colorConfig.accent}`} style={{ marginBottom: '0.25rem' }}>{team.name}</h2>
            <p className="text-slate-400 text-base">{teamWinners.length} ganador{teamWinners.length !== 1 ? 'es' : ''}</p>
          </div>
        </div>

        {/* Winners grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamWinners.map((winner, i) => (
            <WinnerCard key={winner.memberId} winner={winner} index={i} />
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      <ParticlesBackground variant="ambient" />

      <div className="relative z-10 w-full flex justify-center">
        <div className="w-full max-w-6xl px-6 sm:px-10 lg:px-12" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          {/* Header */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center relative"
            style={{ marginBottom: '4rem' }}
          >
            <button
              onClick={onBack}
              className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
              <span className="hidden sm:inline">Volver a Equipos</span>
            </button>

            <div className="flex items-center justify-center gap-4 mb-4">
              <Trophy className="w-12 h-12 text-yellow-400" />
              <h1 className="text-5xl font-display font-bold text-gold-gradient">
                Muro de Ganadores
              </h1>
              <Trophy className="w-12 h-12 text-yellow-400" />
            </div>
            <p className="text-gray-400 text-lg">
              {winners.length} ganador{winners.length !== 1 ? 'es' : ''} hasta ahora
            </p>

            {winners.length > 0 && (
              <button
                onClick={downloadWinnersReport}
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors"
              >
                <Download size={18} />
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
              <Trophy className="w-24 h-24 mx-auto text-gray-700 mb-6" />
              <p className="text-2xl text-gray-500">Aún no hay ganadores</p>
              <p className="text-gray-600 mt-2">¡Comienza el sorteo para ver a los ganadores aquí!</p>
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

              {/* Prize tier summary */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-4"
                style={{ marginTop: '3rem' }}
              >
                {(['grand', 'gold', 'silver', 'bronze'] as const).map(tier => {
                  const count = winners.filter(w => w.prizeType.tier === tier).length;
                  if (count === 0) return null;
                  return (
                    <div
                      key={tier}
                      className={`px-6 py-3 rounded-full border ${tierBorders[tier]} bg-slate-800/50`}
                    >
                      <span className={`font-bold bg-gradient-to-r ${tierColors[tier]} bg-clip-text text-transparent uppercase`}>
                        {tier}
                      </span>
                      <span className="text-slate-400 ml-2">× {count}</span>
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
