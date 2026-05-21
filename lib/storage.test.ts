import { describe, it, expect, beforeEach } from 'vitest';
import { getBestScore, setBestScore } from './storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getBestScore returns null when no entry', () => {
    expect(getBestScore()).toBeNull();
  });

  it('getBestScore returns stored positive value', () => {
    localStorage.setItem('make-it-rain:best', '1240');
    expect(getBestScore()).toBe(1240);
  });

  it('setBestScore stores positive score', () => {
    setBestScore(100);
    expect(localStorage.getItem('make-it-rain:best')).toBe('100');
  });

  it('setBestScore ignores negative score and preserves existing', () => {
    setBestScore(100);
    setBestScore(-5);
    expect(localStorage.getItem('make-it-rain:best')).toBe('100');
  });

  it('setBestScore ignores zero', () => {
    setBestScore(100);
    setBestScore(0);
    expect(localStorage.getItem('make-it-rain:best')).toBe('100');
  });

  it('uses only make-it-rain:best key', () => {
    setBestScore(100);
    expect(Object.keys(localStorage)).toEqual(['make-it-rain:best']);
  });
});
