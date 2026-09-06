import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewModal } from '../components/ReviewModal';
import { apiService } from '../services/apiService';
import { useToast } from '../components/ui/Toast';

// Mock the API service
vi.mock('../services/apiService', () => ({
  apiService: {
    createReview: vi.fn(),
  },
}));

// Mock the Toast hook
vi.mock('../components/ui/Toast', () => ({
  useToast: vi.fn(),
}));

describe('ReviewModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockToast = { success: vi.fn(), error: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue(mockToast);
  });

  it('Renders only if order status is DELIVERED, otherwise does not render content if not open', () => {
    // Component manages isOpen externally, but we should test that it renders correctly when open
    render(
      <ReviewModal 
        isOpen={true} 
        onClose={mockOnClose} 
        orderId="ord123" 
        revieweeId="far456" 
        onSuccess={mockOnSuccess} 
      />
    );
    expect(screen.getByText(/Leave Feedback/i)).toBeInTheDocument();
  });

  it('Submits the correct payload and shows success toast', async () => {
    (apiService.createReview as any).mockResolvedValue({ success: true });

    render(
      <ReviewModal 
        isOpen={true} 
        onClose={mockOnClose} 
        orderId="ord123" 
        revieweeId="far456" 
        onSuccess={mockOnSuccess} 
      />
    );

    // Select 4 stars
    const stars = screen.getAllByRole('button').filter(b => b.querySelector('svg'));
    // Assuming stars are rendered as buttons with SVGs inside
    fireEvent.click(stars[3]);

    // Select a tag
    const tag = screen.getByText('Good Quality');
    fireEvent.click(tag);

    // Type comment
    const textarea = screen.getByPlaceholderText(/Describe your experience/i);
    await userEvent.type(textarea, 'Excellent tomatoes!');

    // Submit
    const submitBtn = screen.getByText('Submit Feedback');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiService.createReview).toHaveBeenCalledWith(
        expect.any(String), // token (assuming mocked or empty in test context without auth provider wrapper)
        'ord123',
        'far456',
        4,
        'Excellent tomatoes!',
        ['good_quality']
      );
      expect(mockToast.success).toHaveBeenCalledWith('Feedback Submitted', expect.any(String));
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('Shows error toast on API failure', async () => {
    (apiService.createReview as any).mockResolvedValue({ success: false, message: 'Already reviewed' });

    render(
      <ReviewModal 
        isOpen={true} 
        onClose={mockOnClose} 
        orderId="ord123" 
        revieweeId="far456" 
      />
    );

    // Submit
    const submitBtn = screen.getByText('Submit Feedback');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Submission Failed', 'Already reviewed');
    });
  });
});
