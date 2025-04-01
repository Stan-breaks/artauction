'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatKES } from '@/lib/utils';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

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
    if (!session?.user) {
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
        userId: session.user.id,
      });
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error('Failed to place bid');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Current Bid:</span>
          <span className="text-[#078250] font-bold text-xl">
            {formatKES(currentPrice)}
          </span>
        </div>
        <div className="flex justify-between mb-4">
          <span className="text-gray-600">Minimum Bid:</span>
          <span className="text-gray-700">
            {formatKES(currentPrice + minBidIncrement)}
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-100 rounded-md mb-6">
          <div className="flex items-center">
            <div className="w-5 h-5 mr-2 text-[#078250]">⏰</div>
            <div>
              <div className="text-sm text-gray-600">Auction ends in:</div>
              <div className="font-semibold">{timeLeft}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Your Bid Amount (KES)
          </label>
          <Input
            id="bidAmount"
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(Number(e.target.value))}
            min={currentPrice + minBidIncrement}
            step={minBidIncrement}
            className="w-full"
          />
        </div>

        <Button
          onClick={handlePlaceBid}
          disabled={isLoading || new Date() > endDate}
          className="w-full bg-[#078250] hover:bg-[#078250]/90"
        >
          {isLoading ? 'Placing Bid...' : 'Place Bid'}
        </Button>

        {new Date() > endDate && (
          <p className="text-red-500 text-sm text-center">
            This auction has ended
          </p>
        )}
      </div>
    </div>
  );
} 