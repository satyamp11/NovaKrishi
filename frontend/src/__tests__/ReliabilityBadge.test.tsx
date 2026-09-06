import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ReliabilityBadge } from '../components/ui/ReliabilityBadge';

describe('ReliabilityBadge', () => {
  it('renders trusted badge with correct score and label', () => {
    render(<ReliabilityBadge reliability={{ score: 95, badge: 'trusted' }} />);
    expect(screen.getByText('95/100')).toBeInTheDocument();
    expect(screen.getByText('Trusted')).toBeInTheDocument();
    // Verify it renders the star icon (implied by text or check classes)
    const badgeElement = screen.getByText('Trusted').closest('div');
    expect(badgeElement).toHaveClass('bg-emerald-100');
  });

  it('renders good badge correctly', () => {
    render(<ReliabilityBadge reliability={{ score: 75, badge: 'good' }} />);
    expect(screen.getByText('75/100')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    const badgeElement = screen.getByText('Good').closest('div');
    expect(badgeElement).toHaveClass('bg-blue-100');
  });

  it('renders new badge correctly', () => {
    render(<ReliabilityBadge reliability={{ score: 70, badge: 'new' }} />);
    expect(screen.getByText('70/100')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    const badgeElement = screen.getByText('New').closest('div');
    expect(badgeElement).toHaveClass('bg-slate-100');
  });

  it('renders flagged badge correctly', () => {
    render(<ReliabilityBadge reliability={{ score: 35, badge: 'flagged' }} />);
    expect(screen.getByText('35/100')).toBeInTheDocument();
    expect(screen.getByText('Flagged')).toBeInTheDocument();
    const badgeElement = screen.getByText('Flagged').closest('div');
    expect(badgeElement).toHaveClass('bg-red-100');
  });
});
