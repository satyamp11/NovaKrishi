import { useState, useEffect, useCallback } from 'react';
import { apiService, API_BASE_URL } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui';

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface UseRazorpayCheckoutOptions {
  onSuccess?: () => void;
  onPaymentHeld?: () => void;
}

export const useRazorpayCheckout = ({ onSuccess, onPaymentHeld }: UseRazorpayCheckoutOptions = {}) => {
  const { token, user } = useAuth();
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    loadRazorpayScript().then((loaded) => {
      setIsScriptLoaded(loaded as boolean);
    });
  }, []);

  const initiatePayment = useCallback(async (orderId: string) => {
    if (!token) {
      toast.error('Authentication Error', 'You must be logged in to make a payment.');
      return;
    }
    if (!isScriptLoaded) {
      toast.error('Connection Error', 'Failed to load Razorpay payment gateway. Please check your internet connection.');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Initiate order from backend
      const resInitiate = await fetch(`${API_BASE_URL}/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId }),
      });
      const res = await resInitiate.json();
      
      if (!res.success || !res.razorpayOrderId) {
        throw new Error(res.message || 'Failed to initiate payment.');
      }

      // 2. Configure Razorpay options
      const options = {
        key: res.keyId,
        amount: res.amountInPaise, // backend returns paise
        currency: 'INR',
        name: 'KrishiSetu',
        description: `Direct Trade Escrow Deposit (Order #${orderId.substring(0, 8)})`,
        image: '/favicon.ico', // fallback image
        order_id: res.razorpayOrderId,
        handler: async function (response: any) {
          // 3. Confirm payment verification on backend
          try {
            const verifyReq = await fetch(`${API_BASE_URL}/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyRes = await verifyReq.json();

            if (verifyRes.success) {
              toast.success('Payment Secured', 'Your funds are securely held in escrow.');
              if (onPaymentHeld) onPaymentHeld();
              if (onSuccess) onSuccess();
            } else {
              toast.error('Verification Failed', verifyRes.message || 'Payment signature could not be verified.');
            }
          } catch (err: any) {
            toast.error('Verification Error', err.message || 'An error occurred during verification.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.emailOrPhone?.includes('@') ? user.emailOrPhone : '',
          contact: user?.emailOrPhone || '',
        },
        notes: {
          novakrishi_order_id: orderId,
        },
        theme: {
          color: '#059669', // Tailwind emerald-600 to match primary brand
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.info('Payment Cancelled', 'You cancelled the payment. You can try again.');
          },
        },
      };

      // 4. Open Checkout
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        setIsProcessing(false);
        toast.error('Payment Failed', response.error.description || 'Your payment was declined.');
      });

      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      toast.error('Payment Error', err.message || 'Could not connect to payment gateway.');
    }
  }, [token, isScriptLoaded, user, toast, onSuccess, onPaymentHeld]);

  return { initiatePayment, isProcessing, isScriptLoaded };
};
