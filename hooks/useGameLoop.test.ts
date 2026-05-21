import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useGameLoop } from './useGameLoop';

describe('useGameLoop — Task 2: countdown + HUD skeleton', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('starts in menu phase with null countdown', () => {
    const { result } = renderHook(() => useGameLoop());
    expect(result.current.phase).toBe('menu');
    expect(result.current.countdown).toBeNull();
  });

  it('transitions to countdown=3 after start()', () => {
    const { result } = renderHook(() => useGameLoop());
    act(() => { result.current.start(); });
    expect(result.current.phase).toBe('countdown');
    expect(result.current.countdown).toBe(3);
  });

  it('SC1: menu disappears, countdown "3" shown after start()', () => {
    const { result } = renderHook(() => useGameLoop());
    act(() => { result.current.start(); });
    expect(result.current.phase).toBe('countdown');
    expect(result.current.countdown).toBe(3);
  });

  it('SC2: counts 3 → 2 → 1 at 1s intervals', () => {
    const { result } = renderHook(() => useGameLoop());
    act(() => { result.current.start(); });

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.countdown).toBe(2);

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.countdown).toBe(1);
  });

  it('SC3/SC4: transitions to playing with countdown=null at 3s', () => {
    const { result } = renderHook(() => useGameLoop());
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(1000); }); // 3→2
    act(() => { vi.advanceTimersByTime(1000); }); // 2→1
    act(() => { vi.advanceTimersByTime(1000); }); // 1→playing
    expect(result.current.phase).toBe('playing');
    expect(result.current.countdown).toBeNull();
  });

  it('SC3: shows score=0 and timeLeftSec=60 after countdown', () => {
    const { result } = renderHook(() => useGameLoop());
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.score).toBe(0);
    expect(result.current.timeLeftSec).toBe(60);
  });
});
