import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MenuScreen } from './MenuScreen';

describe('MenuScreen', () => {
  it('renders start button', () => {
    render(<MenuScreen bestScore={null} onStart={() => {}} />);
    expect(screen.getByRole('button', { name: /시작/i })).toBeInTheDocument();
  });

  it('shows "최고 점수 -" when no best score', () => {
    render(<MenuScreen bestScore={null} onStart={() => {}} />);
    expect(screen.getByText(/최고 점수 -/)).toBeInTheDocument();
  });

  it('shows best score value when provided', () => {
    render(<MenuScreen bestScore={1240} onStart={() => {}} />);
    expect(screen.getByText('1,240')).toBeInTheDocument();
  });

  it('does not show raw "최고 점수 -" when score is set', () => {
    render(<MenuScreen bestScore={1240} onStart={() => {}} />);
    expect(screen.queryByText(/최고 점수 -/)).not.toBeInTheDocument();
  });

  it('calls onStart when start button is clicked', () => {
    const onStart = vi.fn();
    render(<MenuScreen bestScore={null} onStart={onStart} />);
    fireEvent.click(screen.getByRole('button', { name: /시작/i }));
    expect(onStart).toHaveBeenCalledOnce();
  });
});
