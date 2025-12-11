import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TeamSelectionScreen } from './components/TeamSelectionScreen';
import { MemberSelectionScreen } from './components/MemberSelectionScreen';
import { SlotMachine } from './components/SlotMachine';
import { WinnersWall } from './components/WinnersWall';
import type { AppScreen, Team, Member, PrizeType, Winner } from './types';

// Import data
import teamsData from './data/teams.json';
import prizesData from './data/prizes.json';

const STORAGE_KEY = 'prize-draw-state-v4';

interface SavedState {
  winners: Winner[];
}

function App() {
  const [screen, setScreen] = useState<AppScreen>('teams');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);

  const teams: Team[] = teamsData.teams as Team[];
  const prizeTypes: PrizeType[] = prizesData.prizeTypes as PrizeType[];

  // Get all member IDs that are linked to a given member (including the member itself)
  const getLinkedMemberIds = useCallback((memberId: number): number[] => {
    const allMembers = teams.flatMap(t => t.members);
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return [memberId];
    return [memberId, ...(member.linkedMemberIds || [])];
  }, [teams]);

  // Check if a member (or any of their linked members) has already won
  const hasMemberWon = useCallback((memberId: number): boolean => {
    const linkedIds = getLinkedMemberIds(memberId);
    return winners.some(w => linkedIds.includes(w.memberId));
  }, [winners, getLinkedMemberIds]);

  // Get the winner record for a member (or any of their linked members)
  const getMemberWinner = useCallback((memberId: number): Winner | undefined => {
    const linkedIds = getLinkedMemberIds(memberId);
    return winners.find(w => linkedIds.includes(w.memberId));
  }, [winners, getLinkedMemberIds]);

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state: SavedState = JSON.parse(saved);
        setWinners(state.winners || []);
      } catch {
        console.error('Failed to load saved state');
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    const state: SavedState = { winners };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [winners]);

  // Get available prize types for a member (based on eligibility only - no stock limits)
  const getAvailablePrizeTypes = useCallback((member: Member): PrizeType[] => {
    const eligibleTypeIds = member.eligiblePrizeTypeIds || [];
    return prizeTypes.filter(pt => eligibleTypeIds.includes(pt.id));
  }, [prizeTypes]);

  // Handle team selection
  const handleSelectTeam = useCallback((team: Team) => {
    setSelectedTeam(team);
    setScreen('members');
  }, []);

  // Handle member selection
  const handleSelectMember = useCallback((member: Member) => {
    setSelectedMember(member);
    setScreen('drawing');
  }, []);

  // Handle drawing completion
  const handleDrawingComplete = useCallback((prizeType: PrizeType) => {
    if (!selectedTeam || !selectedMember) return;

    const newWinner: Winner = {
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      teamId: selectedTeam.id,
      teamName: selectedTeam.name,
      prizeType: prizeType,
      timestamp: Date.now(),
    };

    setWinners(prev => [...prev, newWinner]);
    setSelectedMember(null);
    setScreen('members');
  }, [selectedTeam, selectedMember]);

  // Handle drawing cancellation
  const handleDrawingCancel = useCallback(() => {
    setSelectedMember(null);
    setScreen('members');
  }, []);

  // Handle back to teams
  const handleBackToTeams = useCallback(() => {
    setSelectedTeam(null);
    setSelectedMember(null);
    setScreen('teams');
  }, []);

  // Reset all data
  const handleReset = useCallback(() => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar todos los ganadores? Esto no se puede deshacer.')) {
      setWinners([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <AnimatePresence mode="wait">
        {screen === 'teams' && (
          <TeamSelectionScreen
            key="teams"
            teams={teams}
            hasMemberWon={hasMemberWon}
            onSelectTeam={handleSelectTeam}
            onViewWinners={() => setScreen('wall')}
          />
        )}

        {screen === 'members' && selectedTeam && (
          <MemberSelectionScreen
            key="members"
            team={selectedTeam}
            hasMemberWon={hasMemberWon}
            getMemberWinner={getMemberWinner}
            onSelectMember={handleSelectMember}
            onBack={handleBackToTeams}
          />
        )}

        {screen === 'drawing' && selectedTeam && selectedMember && (
          <SlotMachine
            key="drawing"
            member={selectedMember}
            team={selectedTeam}
            availablePrizeTypes={getAvailablePrizeTypes(selectedMember)}
            onComplete={handleDrawingComplete}
            onCancel={handleDrawingCancel}
          />
        )}

        {screen === 'wall' && (
          <WinnersWall
            key="wall"
            winners={winners}
            teams={teams}
            onBack={handleBackToTeams}
          />
        )}
      </AnimatePresence>

      {/* CAMERA-OPTIMIZED: Larger reset button */}
      {screen === 'teams' && winners.length > 0 && (
        <button
          onClick={handleReset}
          className="fixed bottom-6 right-6 bg-red-900 text-red-300 font-bold rounded-xl border-4 border-red-700 hover:bg-red-800 hover:border-red-500 transition-colors"
          style={{ padding: '1rem 2rem', fontSize: '1.25rem' }}
        >
          Reiniciar
        </button>
      )}
    </div>
  );
}

export default App;
