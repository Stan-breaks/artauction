'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found. Payment verification failed.');
      setIsLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        // In a real implementation, you'd verify the payment with your backend
        // For this example, we'll just simulate a successful verification
        const response = await fetch(`/api/payment/verify?session_id=${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Payment verification failed');
        }
        
        const data = await response.json();
        setTransactionDetails(data);
        setIsVerified(true);
      } catch (error) {
        console.error('Error verifying payment:', error);
        setError('Failed to verify payment. Please contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    // Simulate API call with timeout
    setTimeout(() => {
      setIsVerified(true);
      setTransactionDetails({
        amount: '$XXX.XX',
        artworkTitle: 'Artwork Title',
        timestamp: new Date().toLocaleString()
      });
      setIsLoading(false);
    }, 2000);

    // Uncomment this when you have the actual API endpoint
    // verifyPayment();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Spinner size="lg" />
        <p className="mt-4 text-lg">Verifying your payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Payment Verification Failed</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <Link href={`/auctions/${params.id}`}>
            <Button variant="outline">Return to Auction</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-green-700 mb-4">Payment Successful!</h1>
        <p className="text-green-700 mb-6">Your purchase has been completed successfully.</p>
        
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Transaction Details</h2>
          <div className="space-y-2 text-left">
            <p><span className="font-medium">Transaction ID:</span> {sessionId?.substring(0, 10)}...</p>
            <p><span className="font-medium">Amount Paid:</span> {transactionDetails?.amount || 'KES XXXX.XX'}</p>
            <p><span className="font-medium">Date:</span> {transactionDetails?.timestamp || new Date().toLocaleString()}</p>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">
          A confirmation email has been sent to your registered email address.
          You can view your purchase in your profile account.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/profile/purchases">
            <Button className="w-full sm:w-auto">
              View My Purchases
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
          <Link href="/auctions">
            <Button variant="outline" className="w-full sm:w-auto">
              Explore More Artworks
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 