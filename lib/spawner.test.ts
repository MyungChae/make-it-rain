import { describe, it, expect } from 'vitest';
import { pickKind, createDrop, spawnIntervalAt, fallSpeedAt } from './spawner';
import { BASE_SPAWN_INTERVAL_MS, MAX_SPEED_MULTIPLIER, ROUND_SEC, BASE_FALL_PX_PER_SEC } from '@/config/game';

describe('pickKind', () => {
  it('returns a valid DropKind in normal mode', () => {
    const validKinds = ['coin', 'bill', 'gold', 'bubble-s', 'bubble-l'];
    for (let i = 0; i < 50; i++) {
      expect(validKinds).toContain(pickKind(Math.random));
    }
  });

  it('never returns bubble-s or bubble-l in booster mode', () => {
    for (let i = 0; i < 100; i++) {
      const kind = pickKind(Math.random, 'booster');
      expect(kind).not.toBe('bubble-s');
      expect(kind).not.toBe('bubble-l');
    }
  });

  it('only returns money kinds in booster mode', () => {
    const validBoosterKinds = ['coin', 'bill', 'gold'];
    for (let i = 0; i < 50; i++) {
      expect(validBoosterKinds).toContain(pickKind(Math.random, 'booster'));
    }
  });

  it('returns first kind when rng is near 0', () => {
    const kind = pickKind(() => 0.0001, 'normal');
    expect(kind).toBe('coin');
  });

  it('normal mode distributes across all 5 kinds', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 500; i++) {
      seen.add(pickKind(Math.random, 'normal'));
    }
    expect(seen.size).toBe(5);
  });
});

describe('createDrop', () => {
  it('sets the given kind', () => {
    const drop = createDrop(1000, 'coin');
    expect(drop.kind).toBe('coin');
  });

  it('starts at yPx=0', () => {
    const drop = createDrop(1000, 'bill');
    expect(drop.yPx).toBe(0);
  });

  it('sets spawnedAt to now', () => {
    const drop = createDrop(1234, 'gold');
    expect(drop.spawnedAt).toBe(1234);
  });

  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 20 }, () => createDrop(0, 'coin').id));
    expect(ids.size).toBe(20);
  });

  it('xPct is in [0, 90)', () => {
    for (let i = 0; i < 30; i++) {
      const d = createDrop(0, 'coin');
      expect(d.xPct).toBeGreaterThanOrEqual(0);
      expect(d.xPct).toBeLessThan(90);
    }
  });

  it('uses provided xPct when given', () => {
    const drop = createDrop(0, 'coin', 42);
    expect(drop.xPct).toBe(42);
  });
});

describe('spawnIntervalAt — Scenario 6: linear acceleration', () => {
  it('returns BASE_SPAWN_INTERVAL_MS at elapsed=0', () => {
    expect(spawnIntervalAt(0, BASE_SPAWN_INTERVAL_MS, MAX_SPEED_MULTIPLIER, ROUND_SEC)).toBeCloseTo(
      BASE_SPAWN_INTERVAL_MS,
    );
  });

  it('returns BASE/MAX at elapsed=ROUND_SEC (max speed)', () => {
    expect(spawnIntervalAt(ROUND_SEC, BASE_SPAWN_INTERVAL_MS, MAX_SPEED_MULTIPLIER, ROUND_SEC)).toBeCloseTo(
      BASE_SPAWN_INTERVAL_MS / MAX_SPEED_MULTIPLIER,
    );
  });

  it('is monotonically decreasing (Scenario 6 SC3: no sudden jumps)', () => {
    let prev = Infinity;
    for (let s = 0; s <= ROUND_SEC; s += 5) {
      const interval = spawnIntervalAt(s, BASE_SPAWN_INTERVAL_MS, MAX_SPEED_MULTIPLIER, ROUND_SEC);
      expect(interval).toBeLessThanOrEqual(prev);
      prev = interval;
    }
  });
});

describe('fallSpeedAt — Scenario 6: linear acceleration', () => {
  it('returns BASE_FALL_PX_PER_SEC at elapsed=0', () => {
    expect(fallSpeedAt(0, BASE_FALL_PX_PER_SEC, MAX_SPEED_MULTIPLIER, ROUND_SEC)).toBeCloseTo(
      BASE_FALL_PX_PER_SEC,
    );
  });

  it('speed at 60s > speed at 0s (Scenario 6 SC2)', () => {
    const speedAt0 = fallSpeedAt(0, BASE_FALL_PX_PER_SEC, MAX_SPEED_MULTIPLIER, ROUND_SEC);
    const speedAt60 = fallSpeedAt(60, BASE_FALL_PX_PER_SEC, MAX_SPEED_MULTIPLIER, ROUND_SEC);
    expect(speedAt60).toBeGreaterThan(speedAt0);
  });

  it('is monotonically increasing', () => {
    let prev = 0;
    for (let s = 0; s <= ROUND_SEC; s += 5) {
      const speed = fallSpeedAt(s, BASE_FALL_PX_PER_SEC, MAX_SPEED_MULTIPLIER, ROUND_SEC);
      expect(speed).toBeGreaterThanOrEqual(prev);
      prev = speed;
    }
  });
});

