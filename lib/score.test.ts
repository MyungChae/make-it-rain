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
  it('returns 1 when score crosses 150 for the first time', () => {
    const r = countCrossedThresholds(145, 150, 0);
    expect(r.count).toBe(1);
    expect(r.newLastThreshold).toBe(150);
  });

  it('returns 1 when score overshoots 150 (e.g. 140→155)', () => {
    const r = countCrossedThresholds(140, 155, 0);
    expect(r.count).toBe(1);
    expect(r.newLastThreshold).toBe(150);
  });

  it('returns 1 when score overshoots 150 with gold (140→190)', () => {
    const r = countCrossedThresholds(140, 190, 0);
    expect(r.count).toBe(1);
    expect(r.newLastThreshold).toBe(150);
  });

  it('returns 2 when single increment crosses two thresholds (140→310)', () => {
    const r = countCrossedThresholds(140, 310, 0);
    expect(r.count).toBe(2);
    expect(r.newLastThreshold).toBe(300);
  });

  it('returns 0 when re-crossing already-passed threshold (bounce)', () => {
    // prevScore=60 (dropped from 160 to 60), nextScore=160, lastThreshold=150
    const r = countCrossedThresholds(60, 160, 150);
    expect(r.count).toBe(0);
    expect(r.newLastThreshold).toBe(150);
  });

  it('returns 0 when score decreases', () => {
    const r = countCrossedThresholds(160, 140, 150);
    expect(r.count).toBe(0);
  });

  it('returns 1 when score goes from negative to above 150', () => {
    const r = countCrossedThresholds(-10, 200, 0);
    expect(r.count).toBe(1);
    expect(r.newLastThreshold).toBe(150);
  });

  it('returns 0 when score stays below first threshold', () => {
    const r = countCrossedThresholds(-10, 50, 0);
    expect(r.count).toBe(0);
  });

  it('returns 1 when crossing 300 from 299→310 (SC5-b: second click)', () => {
    // lastThreshold is 150 from previous threshold crossing
    const r = countCrossedThresholds(299, 310, 150);
    expect(r.count).toBe(1);
    expect(r.newLastThreshold).toBe(300);
  });
});
