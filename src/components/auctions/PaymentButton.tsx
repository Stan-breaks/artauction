'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe outside of component render to avoid recreating Stripe object on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentButtonProps {
  auctionId: string;
  isWinner: boolean;
  disabled?: boolean;
  className?: string;
}

export default function PaymentButton({ 
  auctionId, 
  isWinner, 
  disabled = false,
  className = ''
}: PaymentButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!session?.user) {
      toast.error('Please sign in to complete your purchase');
      router.push('/auth/signin');
      return;
    }

    if (!isWinner) {
      toast.error('Only the auction winner can complete the purchase');
      return;
    }

    setIsLoading(true);

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auctionId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to process payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading || !isWinner}
      className={`w-full ${className}`}
      variant="default"
    >
      {isLoading ? 'Processing...' : 'Complete Purchase'}
    </Button>
  );
} 