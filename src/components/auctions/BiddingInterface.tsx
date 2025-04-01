'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatKES } from '@/lib/utils';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface BiddingInterfaceProps {
  auctionId: string;
  currentPrice: number;
  minBidIncrement: number;
  endDate: Date;
}

export default function BiddingInterface({
  auctionId,
  currentPrice,
  minBidIncrement,
  endDate,
}: BiddingInterfaceProps) {
  const { data: session } = useSession();
  const [bidAmount, setBidAmount] = useState(currentPrice + minBidIncrement);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io();

    // Join auction room
    socketRef.current.emit('join-auction', auctionId);

    // Listen for bid updates
    socketRef.current.on('bid-update', (data) => {
      setBidAmount(data.currentPrice + minBidIncrement);
      toast.info(`New bid: ${formatKES(data.currentPrice)} by ${data.bid.user.name}`);
    });

    // Listen for bid errors
    socketRef.current.on('bid-error', (data) => {
      toast.error(data.message);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-auction', auctionId);
        socketRef.current.disconnect();
      }
    };
  }, [auctionId, minBidIncrement]);

  useEffect(() => {
    // Update time left
    const updateTimeLeft = () => {
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Auction ended');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m left`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [endDate]);

  const handlePlaceBid = async () => {
    if (!session) {
      toast.error('Please sign in to place a bid');
      return;
    }

    if (bidAmount < currentPrice + minBidIncrement) {
      toast.error(`Bid must be at least ${formatKES(currentPrice + minBidIncrement)}`);
      return;
    }

    setIsLoading(true);
    try {
      socketRef.current?.emit('new-bid', {
        auctionId,
        amount: bidAmount,
      });
    } catch (error) {
      toast.error('Failed to place bid');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Place Your Bid</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Current Price
          </label>
          <p className="text-2xl font-bold text-primary">{formatKES(currentPrice)}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Minimum Bid Increment
          </label>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatKES(minBidIncrement)}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Your Bid Amount
          </label>
          <Input
            type="number"
            min={currentPrice + minBidIncrement}
            value={bidAmount}
            onChange={(e) => setBidAmount(Number(e.target.value))}
            className="mt-1"
          />
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Time left: {timeLeft}
        </div>
        <Button
          onClick={handlePlaceBid}
          disabled={isLoading || !session}
          className="w-full"
        >
          {isLoading ? 'Placing Bid...' : 'Place Bid'}
        </Button>
        {!session && (
          <p className="text-sm text-gray-600 mt-2">
            Please <Link href="/auth/signin" className="text-primary hover:underline">sign in</Link> to place a bid
          </p>
        )}
      </div>
    </div>
  );
} 