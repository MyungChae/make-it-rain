import { SPAWN_WEIGHTS_NORMAL, SPAWN_WEIGHTS_BOOSTER, BASE_FALL_PX_PER_SEC } from '@/config/game';
import type { Drop, DropKind } from '@/types/game';

type SpawnMode = 'normal' | 'booster';

export function pickKind(rng: () => number, mode: SpawnMode = 'normal'): DropKind {
  const weights = mode === 'booster' ? SPAWN_WEIGHTS_BOOSTER : SPAWN_WEIGHTS_NORMAL;
  const entries = Object.entries(weights) as [DropKind, number][];
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = rng() * total;
  for (const [kind, weight] of entries) {
    r -= weight;
    if (r < 0) return kind;
  }
  return entries[entries.length - 1][0];
}

export function createDrop(now: number, kind: DropKind, xPct?: number): Drop {
  return {
    id: crypto.randomUUID(),
    kind,
    xPct: xPct ?? Math.random() * 90,
    yPx: 0,
    vyPxPerSec: BASE_FALL_PX_PER_SEC,
    spawnedAt: now,
  };
}

/** Linear acceleration: multiplier grows from 1× to MAX at round end. */
export function spawnIntervalAt(elapsedSec: number, baseMs: number, maxMul: number, roundSec: number): number {
  const mul = 1 + (maxMul - 1) * (elapsedSec / roundSec);
  return baseMs / mul;
}

export function fallSpeedAt(elapsedSec: number, basePx: number, maxMul: number, roundSec: number): number {
  const mul = 1 + (maxMul - 1) * (elapsedSec / roundSec);
  return basePx * mul;
}
