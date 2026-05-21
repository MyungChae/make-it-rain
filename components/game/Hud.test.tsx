import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { Hud } from './Hud';

describe('Hud', () => {
  it('renders score and timeLeftSec', () => {
    render(<Hud score={150} timeLeftSec={45} />);
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('shows "× 0" with button disabled when boosters=0 (default)', () => {
    render(<Hud score={0} timeLeftSec={60} />);
    expect(screen.getByText('× 0')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows booster count and enables button when boosters>0', () => {
    const onBooster = vi.fn();
    render(<Hud score={0} timeLeftSec={60} boosters={2} onBooster={onBooster} />);
    expect(screen.getByText('× 2')).toBeInTheDocument();
    const btn = screen.getByRole('button');
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(onBooster).toHaveBeenCalledOnce();
  });

  it('shows "⚡ 활성중!" and disables button when boosterActive', () => {
    render(<Hud score={0} timeLeftSec={60} boosters={1} boosterActive={true} />);
    expect(screen.getByText('⚡ 활성중!')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables button when boosterActive even with boosters>0', () => {
    render(<Hud score={0} timeLeftSec={60} boosters={3} boosterActive={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
