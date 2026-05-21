export type DropKind = 'coin' | 'bill' | 'gold' | 'bubble-s' | 'bubble-l';
export type Phase = 'menu' | 'countdown' | 'playing' | 'result';

export interface Drop {
  id: string;
  kind: DropKind;
  xPct: number;
  yPx: number;
  spawnedAt: number;
  dying?: boolean;
}

export interface GameStats {
  coin: number;
  bill: number;
  gold: number;
  'bubble-s': number;
  'bubble-l': number;
}

export interface RoundState {
  score: number;
  timeLeftSec: number;
  startedAt: number;
  drops: Drop[];
  stats: GameStats;
  boosters: number;
  lastBoosterThreshold: number;
  boosterEndsAt: number | null;
}
