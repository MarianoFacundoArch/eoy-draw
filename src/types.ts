export interface Member {
  id: number;
  name: string;
  eligiblePrizeTypeIds: number[]; // Prize type IDs this member can win
  linkedMemberIds?: number[]; // IDs of the same person in other teams
}

export interface Team {
  id: number;
  name: string;
  emoji: string;
  color: string; // Tailwind color class
  members: Member[];
}

export interface PrizeType {
  id: number;
  name: string;
  description: string;
  value: string;
  tier: 'grand' | 'gold' | 'silver' | 'bronze';
  emoji: string;
  probability: number; // Fixed probability for this prize (0-1, must sum to 1 across all prizes)
}

export interface Winner {
  memberId: number;
  memberName: string;
  teamId: number;
  teamName: string;
  prizeType: PrizeType;
  timestamp: number;
}

export type AppScreen = 'teams' | 'members' | 'drawing' | 'wall';

export type DrawingPhase = 'idle' | 'building' | 'spinning' | 'slowing' | 'reveal' | 'celebrating';

// Prize type IDs and probabilities:
// 1 = Cesta de Navidad (18%)
// 2 = Masaje para dos (9.5%)
// 3 = Cena para dos (9.5%)
// 4 = Parque de atracciones (9.5%)
// 5 = Cata de vino (9.5%)
// 6 = Fin de semana sorpresa (5%)
// 7 = Tarjeta Amazon 75$ (14%)
// 8 = Tarjeta Amazon 100$ (15%)
// 9 = Viaje sorpresa para dos (5%)
// 10 = Tu eliges, nosotros pagamos (5%)
// TOTAL = 100%
