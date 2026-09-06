import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminDashboardView } from '../pages/dashboards/AdminDashboardView';
import { apiService } from '../services/apiService';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../services/apiService', () => ({
  apiService: {
    getAdminMetrics: vi.fn().mockResolvedValue({ success: true, metrics: {} }),
    getAdminFarmers: vi.fn().mockResolvedValue({ success: true, farmers: [] }),
    getDisputes: vi.fn(),
    updateDisputeStatus: vi.fn(),
  },
}));

const mockUser = {
  id: 'admin1',
  name: 'Admin',
  emailOrPhone: 'admin@test.com',
  role: 'admin',
  verificationStatus: 'VERIFIED',
  state: 'MH',
  district: 'Pune'
} as any;

describe('AdminDisputesTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithAuth = (ui: React.ReactElement) => {
    // A simplified auth provider setup for testing
    return render(ui);
  };

  it('renders a list from mocked getDisputes response', async () => {
    const mockedDisputes = [
      { _id: 'disp1', type: 'quality_issue', description: 'Bad apples', status: 'open', orderId: 'ord1', createdAt: '2023-01-01' }
    ];
    (apiService.getDisputes as any).mockResolvedValue(mockedDisputes);

    renderWithAuth(<AdminDashboardView user={mockUser} />);

    // Click on Disputes tab
    const disputesTab = await screen.findByText(/10\. Disputes/i);
    fireEvent.click(disputesTab);

    await waitFor(() => {
      expect(screen.getByText('Bad apples')).toBeInTheDocument();
      expect(screen.getByText('QUALITY ISSUE')).toBeInTheDocument();
    });
  });

  it('clicking resolve calls updateDisputeStatus with correct id and status', async () => {
    const mockedDisputes = [
      { _id: 'disp1', type: 'quality_issue', description: 'Bad apples', status: 'open', orderId: 'ord1', createdAt: '2023-01-01' }
    ];
    (apiService.getDisputes as any).mockResolvedValue(mockedDisputes);
    (apiService.updateDisputeStatus as any).mockResolvedValue({ success: true });

    renderWithAuth(<AdminDashboardView user={mockUser} />);

    const disputesTab = await screen.findByText(/10\. Disputes/i);
    fireEvent.click(disputesTab);

    const resolveBtn = await screen.findByText('Resolve & Refund');
    fireEvent.click(resolveBtn);

    await waitFor(() => {
      expect(apiService.updateDisputeStatus).toHaveBeenCalledWith('disp1', 'resolved', 'Admin resolved the dispute');
    });
  });
});
