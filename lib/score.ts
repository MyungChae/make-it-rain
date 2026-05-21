import { SCORES, BOOSTER_THRESHOLD } from '@/config/game';
import type { DropKind } from '@/types/game';

export function applyHit(score: number, kind: DropKind): number {
  return score + SCORES[kind];
}

/**
 * Counts how many multiples of `step` lie in the interval (lastThreshold, nextScore],
 * but only when the score increases (positive direction).
 * Returns { count, newLastThreshold } where newLastThreshold is the highest crossed multiple.
 */
export function countCrossedThresholds(
  prevScore: number,
  nextScore: number,
  lastThreshold: number,
  step = BOOSTER_THRESHOLD,
): { count: number; newLastThreshold: number } {
  if (nextScore <= prevScore || nextScore <= 0) {
    return { count: 0, newLastThreshold: lastThreshold };
  }

  // Find the highest multiple of step that has been crossed
  const newHighest = Math.floor(nextScore / step) * step;
  if (newHighest <= lastThreshold || newHighest < step) {
    return { count: 0, newLastThreshold: lastThreshold };
  }

  const count = Math.floor(newHighest / step) - Math.floor(lastThreshold / step);
  return { count: Math.max(0, count), newLastThreshold: newHighest };
}
