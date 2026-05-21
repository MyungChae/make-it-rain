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
  it('returns 1 when score crosses 200 for the first time', () => {
    const r = countCrossedThresholds(195, 200, 0);
    expect(r.count).toBe(1);
    expect(r.newLastThreshold).toBe(200);
  });

  it('returns 1 when score overshoots 200 (e.g. 190→205)', () => {
    const r = countCrossedThresholds(190, 205, 0);
    expect(r.count).toBe(1);
    expect(r.newLastThreshold).toBe(200);
  });

  it('returns 1 when score overshoots 200 with gold (190→240)', () => {
    const r = countCrossedThresholds(190, 240, 0);
    expect(r.count).toBe(1);
    expect(r.newLastThreshold).toBe(200);
  });

  it('returns 2 when single increment crosses two thresholds (190→410)', () => {
    const r = countCrossedThresholds(190, 410, 0);
    expect(r.count).toBe(2);
    expect(r.newLastThreshold).toBe(400);
  });

  it('returns 0 when re-crossing already-passed threshold (210→210 after bounce)', () => {
    // prevScore=60 (dropped from 210 to 60), nextScore=210, lastThreshold=200
    const r = countCrossedThresholds(60, 210, 200);
    expect(r.count).toBe(0);
    expect(r.newLastThreshold).toBe(200);
  });

  it('returns 0 when score decreases', () => {
    const r = countCrossedThresholds(210, 190, 200);
    expect(r.count).toBe(0);
  });

  it('returns 0 when score goes from negative to 0-199 range', () => {
    const r = countCrossedThresholds(-10, 150, 0);
    expect(r.count).toBe(0);
  });

  it('returns 1 when crossing 400 from 380→410 (SC5-b: second click)', () => {
    // First click: 380→399 (no threshold). Second click: 399→410 → crosses 400
    const r = countCrossedThresholds(399, 410, 200); // lastThreshold is 200 from prev threshold
    expect(r.count).toBe(1);
    expect(r.newLastThreshold).toBe(400);
  });
});
