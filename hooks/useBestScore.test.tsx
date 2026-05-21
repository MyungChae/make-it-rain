import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useBestScore } from './useBestScore';

describe('useBestScore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no best score stored', () => {
    const { result } = renderHook(() => useBestScore());
    expect(result.current.bestScore).toBeNull();
  });

  it('reads stored best score on mount', () => {
    localStorage.setItem('make-it-rain:best', '1240');
    const { result } = renderHook(() => useBestScore());
    expect(result.current.bestScore).toBe(1240);
  });

  it('recordIfBest updates state and storage when new score is higher', () => {
    localStorage.setItem('make-it-rain:best', '100');
    const { result } = renderHook(() => useBestScore());

    let res!: { isNewBest: boolean; updatedBest: number };
    act(() => { res = result.current.recordIfBest(120); });

    expect(res.isNewBest).toBe(true);
    expect(res.updatedBest).toBe(120);
    expect(result.current.bestScore).toBe(120);
  });

  it('recordIfBest does not update when score is lower', () => {
    localStorage.setItem('make-it-rain:best', '100');
    const { result } = renderHook(() => useBestScore());

    let res!: { isNewBest: boolean; updatedBest: number };
    act(() => { res = result.current.recordIfBest(80); });

    expect(res.isNewBest).toBe(false);
    expect(result.current.bestScore).toBe(100);
  });

  it('recordIfBest does not record negative score', () => {
    const { result } = renderHook(() => useBestScore());

    let res!: { isNewBest: boolean; updatedBest: number };
    act(() => { res = result.current.recordIfBest(-5); });

    expect(res.isNewBest).toBe(false);
    expect(result.current.bestScore).toBeNull();
    expect(localStorage.getItem('make-it-rain:best')).toBeNull();
  });

  it('recordIfBest records first positive score with no previous best', () => {
    const { result } = renderHook(() => useBestScore());

    let res!: { isNewBest: boolean; updatedBest: number };
    act(() => { res = result.current.recordIfBest(150); });

    expect(res.isNewBest).toBe(true);
    expect(result.current.bestScore).toBe(150);
  });
});
