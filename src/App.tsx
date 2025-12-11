import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TeamSelectionScreen } from './components/TeamSelectionScreen';
import { MemberSelectionScreen } from './components/MemberSelectionScreen';
import { SlotMachine } from './components/SlotMachine';
import { WinnersWall } from './components/WinnersWall';
import type { AppScreen, Team, Member, PrizeType, Winner } from './types';

// Import data
import teamsData from './data/teams.json';
import prizesData from './data/prizes.json';

const STORAGE_KEY = 'prize-draw-state-v3';

interface SavedState {
  winners: Winner[];
  awardedPrizeTypeCounts: Record<number, number>; // prizeTypeId -> count awarded
}

function App() {
  const [screen, setScreen] = useState<AppScreen>('teams');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [awardedPrizeTypeCounts, setAwardedPrizeTypeCounts] = useState<Record<number, number>>({});

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

  // Calculate remaining quantity for each prize type
  const getRemainingQuantity = useCallback((prizeTypeId: number): number => {
    const prizeType = prizeTypes.find(p => p.id === prizeTypeId);
    if (!prizeType) return 0;
    const awarded = awardedPrizeTypeCounts[prizeTypeId] || 0;
    return prizeType.quantity - awarded;
  }, [prizeTypes, awardedPrizeTypeCounts]);

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state: SavedState = JSON.parse(saved);
        setWinners(state.winners || []);
        setAwardedPrizeTypeCounts(state.awardedPrizeTypeCounts || {});
      } catch {
        console.error('Failed to load saved state');
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    const state: SavedState = { winners, awardedPrizeTypeCounts };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [winners, awardedPrizeTypeCounts]);

  // Get available prize types for a member (eligible + has remaining quantity)
  // If no regular prizes available, fall back to extra stock prizes (unlimited Amazon cards)
  const getAvailablePrizeTypes = useCallback((member: Member): PrizeType[] => {
    const eligibleTypeIds = member.eligiblePrizeTypeIds || [];

    // First, try to get regular available prizes
    const regularPrizes = prizeTypes.filter(
      pt => eligibleTypeIds.includes(pt.id) && getRemainingQuantity(pt.id) > 0
    );

    // If member has regular prizes available, return those
    if (regularPrizes.length > 0) {
      return regularPrizes;
    }

    // Otherwise, fall back to extra stock prizes (they have unlimited quantity)
    const extraStockPrizes = prizeTypes.filter(pt => pt.isExtraStock);
    return extraStockPrizes;
  }, [prizeTypes, getRemainingQuantity]);

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
    setAwardedPrizeTypeCounts(prev => ({
      ...prev,
      [prizeType.id]: (prev[prizeType.id] || 0) + 1
    }));
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
      setAwardedPrizeTypeCounts({});
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Calculate total available prizes count (sum of remaining quantities)
  const availablePrizesCount = useMemo(() => {
    return prizeTypes.reduce((sum, pt) => sum + getRemainingQuantity(pt.id), 0);
  }, [prizeTypes, getRemainingQuantity]);

  return (
    <div className="min-h-screen">
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
            availablePrizesCount={availablePrizesCount}
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

      {/* Reset button - hidden in corner */}
      {screen === 'teams' && winners.length > 0 && (
        <button
          onClick={handleReset}
          className="fixed bottom-4 right-4 px-4 py-2 bg-red-900/50 text-red-400 text-sm rounded-lg border border-red-800 hover:bg-red-900 transition-colors"
        >
          Reiniciar
        </button>
      )}
    </div>
  );
}

export default App;
