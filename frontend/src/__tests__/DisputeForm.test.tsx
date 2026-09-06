import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisputeForm } from '../components/DisputeForm';
import { apiService } from '../services/apiService';
import { useToast } from '../components/ui/Toast';

vi.mock('../services/apiService', () => ({
  apiService: {
    createDispute: vi.fn(),
  },
}));

vi.mock('../components/ui/Toast', () => ({
  useToast: vi.fn(),
}));

describe('DisputeForm', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockToast = { success: vi.fn(), error: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue(mockToast);
  });

  it('validates required fields before allowing submit', async () => {
    render(<DisputeForm isOpen={true} onClose={mockOnClose} orderId="ord1" counterpartyId="far1" />);
    
    const submitBtn = screen.getByText('Submit Dispute Claim');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Validation Error', 'Please select an issue type and provide a description.');
      expect(apiService.createDispute).not.toHaveBeenCalled();
    });
  });

  it('calls createDispute with correct payload', async () => {
    (apiService.createDispute as any).mockResolvedValue({ success: true });

    render(<DisputeForm isOpen={true} onClose={mockOnClose} orderId="ord1" counterpartyId="far1" onSuccess={mockOnSuccess} />);

    // Select type
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'quality_issue' } });
    
    // Type description
    await userEvent.type(screen.getByPlaceholderText(/Provide detailed information/i), 'The quality was very poor.');
    
    // Submit
    fireEvent.click(screen.getByText('Submit Dispute Claim'));

    await waitFor(() => {
      expect(apiService.createDispute).toHaveBeenCalledWith(
        expect.any(String), // token
        'ord1',
        'far1',
        'quality_issue',
        'The quality was very poor.',
        []
      );
      expect(mockToast.success).toHaveBeenCalledWith('Dispute Filed', expect.any(String));
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
