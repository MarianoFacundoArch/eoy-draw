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
  quantity: number; // How many of this prize are available
  value: string;
  tier: 'grand' | 'gold' | 'silver' | 'bronze';
  emoji: string;
  isExtraStock?: boolean; // If true, this prize has unlimited extra stock for members with no other options
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

// Prize type IDs:
// 1 = Cesta de Navidad (10)
// 2 = Masaje para dos (2)
// 3 = Cena para dos (2)
// 4 = Parque de atracciones (2)
// 5 = Cata de vino (2)
// 6 = Fin de semana sorpresa (1)
// 7 = Tarjeta Amazon 75$ (25)
// 8 = Tarjeta Amazon 100$ (25)
// 9 = Viaje sorpresa para dos (1)
