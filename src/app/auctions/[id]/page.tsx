'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BiddingInterface from '@/components/auctions/BiddingInterface';
import { formatKES } from '@/lib/utils';

interface Auction {
  id: string;
  artwork: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    artist: {
      id: string;
      name: string;
    };
  };
  currentPrice: number;
  minBidIncrement: number;
  endDate: string;
  bids: Array<{
    id: string;
    amount: number;
    user: {
      id: string;
      name: string;
    };
    createdAt: string;
  }>;
}

export default function AuctionPage() {
  const params = useParams();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const isAuthenticated = typeof document !== 'undefined' && document.cookie.includes('token');

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await fetch(`/api/auctions/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch auction');
        }
        const data = await response.json();
        setAuction(data);
      } catch (error) {
        setError('Failed to load auction');
        console.error('Error fetching auction:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuction();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Auction not found'}
          </h2>
          <a
            href="/auctions"
            className="text-primary hover:underline"
          >
            Back to Auctions
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={auction.artwork.imageUrl}
            alt={auction.artwork.title}
            className="w-full h-auto rounded-lg shadow-lg"
          />
          <h1 className="text-3xl font-bold mt-4 text-gray-900 dark:text-white">
            {auction.artwork.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            by {auction.artwork.artist.name}
          </p>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            {auction.artwork.description}
          </p>
        </div>
        <div>
          <BiddingInterface
            auctionId={auction.id}
            currentPrice={auction.currentPrice}
            minBidIncrement={auction.minBidIncrement}
            endDate={new Date(auction.endDate)}
          />
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Bid History</h3>
            <div className="space-y-4">
              {auction.bids.map((bid) => (
                <div
                  key={bid.id}
                  className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {bid.user.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(bid.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    {formatKES(bid.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 