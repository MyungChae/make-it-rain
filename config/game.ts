import type { DropKind } from '@/types/game';

export const ROUND_SEC = 60;
export const BOARD_HEIGHT = 480;
export const COUNTDOWN_SEC = 3;
export const BOOSTER_THRESHOLD = 100;
export const BOOSTER_DURATION_MS = 3000;
export const BASE_SPAWN_INTERVAL_MS = 700;
export const MAX_SPEED_MULTIPLIER = 2.5;
export const BASE_FALL_PX_PER_SEC = 100;
export const BEST_SCORE_KEY = 'make-it-rain:best';

export const SCORES: Record<DropKind, number> = {
  coin: 5,
  bill: 15,
  gold: 50,
  'bubble-s': -5,
  'bubble-l': -20,
};

export const SPAWN_WEIGHTS_NORMAL: Record<DropKind, number> = {
  coin: 6,
  bill: 3,
  gold: 1,
  'bubble-s': 3,
  'bubble-l': 1,
};

export const SPAWN_WEIGHTS_BOOSTER: Record<DropKind, number> = {
  coin: 5,
  bill: 3,
  gold: 1,
  'bubble-s': 0,
  'bubble-l': 0,
};
