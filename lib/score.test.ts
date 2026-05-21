import { describe, it, expect } from 'vitest';
import { applyHit, countCrossedThresholds } from './score';

describe('applyHit', () => {
  it('adds 5 for coin', () => expect(applyHit(0, 'coin')).toBe(5));
  it('adds 15 for bill', () => expect(applyHit(0, 'bill')).toBe(15));
  it('adds 50 for gold', () => expect(applyHit(0, 'gold')).toBe(50));
  it('subtracts 5 for bubble-s', () => expect(applyHit(10, 'bubble-s')).toBe(5));
  it('subtracts 20 for bubble-l', () => expect(applyHit(10, 'bubble-l')).toBe(-10));
  it('can produce negative score', () => expect(applyHit(0, 'bubble-s')).toBe(-5));
});

describe('countCrossedThresholds', () => {
  it('returns 1 when score crosses 100 for the first time', () => {
    const r = countCrossedThresholds(95, 100, 0);
    expect(r.count).toBe(1);
    expect(r.newLastThreshold).toBe(100);
  });

  it('returns 1 when score overshoots 100 (e.g. 90→105)', () => {
    const r = countCrossedThresholds(90, 105, 0);
    expect(r.count).toBe(1);
    expect(r.newLastThreshold).toBe(100);
  });

  it('returns 1 when score overshoots 100 with gold (90→140)', () => {
    const r = countCrossedThresholds(90, 140, 0);
    expect(r.count).toBe(1);
    expect(r.newLastThreshold).toBe(100);
  });

  it('returns 2 when single increment crosses two thresholds (90→210)', () => {
    const r = countCrossedThresholds(90, 210, 0);
    expect(r.count).toBe(2);
    expect(r.newLastThreshold).toBe(200);
  });

  it('returns 0 when re-crossing already-passed threshold (bounce)', () => {
    // prevScore=60 (dropped from 110 to 60), nextScore=110, lastThreshold=100
    const r = countCrossedThresholds(60, 110, 100);
    expect(r.count).toBe(0);
    expect(r.newLastThreshold).toBe(100);
  });

  it('returns 0 when score decreases', () => {
    const r = countCrossedThresholds(110, 90, 100);
    expect(r.count).toBe(0);
  });

  it('returns 1 when score goes from negative to above 100', () => {
    const r = countCrossedThresholds(-10, 150, 0);
    expect(r.count).toBe(1);
    expect(r.newLastThreshold).toBe(100);
  });

  it('returns 0 when score stays below first threshold', () => {
    const r = countCrossedThresholds(-10, 50, 0);
    expect(r.count).toBe(0);
  });

  it('returns 1 when crossing 200 from 199→210 (SC5-b: second click)', () => {
    // First click got to 199 (no new threshold). Second click 199→210 → crosses 200
    const r = countCrossedThresholds(199, 210, 100); // lastThreshold is 100 from prev threshold
    expect(r.count).toBe(1);
    expect(r.newLastThreshold).toBe(200);
  });
});
