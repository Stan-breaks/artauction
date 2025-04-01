'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { formatKES } from '@/lib/utils';

// This would come from your API in a real app
const artwork = {
  id: '1',
  title: 'Maasai Market Day',
  artist: 'Sarah Wanjiku',
  price: 45000,
  currentBid: 45000,
  image: '/images/artworks/maasai-market.jpg',
  description: 'A vibrant depiction of the bustling Maasai market.',
  bids: [
    { amount: 45000, user: 'John Doe', timestamp: '2024-03-30T10:00:00Z' },
  ],
};

export default function ArtworkPage({ params }: { params: { id: string } }) {
  const [bidAmount, setBidAmount] = useState('');
  const [isBidding, setIsBidding] = useState(false);

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBidding(true);
    // Here you would typically submit the bid to your API
    console.log('Bid submitted:', bidAmount);
    setIsBidding(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Artwork Image */}
        <div className="relative h-[500px] rounded-lg overflow-hidden">
          <Image
            src={artwork.image}
            alt={artwork.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Artwork Details */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{artwork.title}</h1>
          <p className="text-xl text-gray-600">by {artwork.artist}</p>
          <p className="text-gray-700">{artwork.description}</p>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Current Bid</h2>
            <p className="text-2xl font-bold text-primary">
              {formatKES(artwork.currentBid)}
            </p>
          </div>

          {/* Bidding Form */}
          <form onSubmit={handleBid} className="space-y-4">
            <div>
              <label htmlFor="bidAmount" className="block text-sm font-medium mb-2">
                Your Bid (KES)
              </label>
              <input
                type="number"
                id="bidAmount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                min={artwork.currentBid + 1000}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isBidding}
            >
              {isBidding ? 'Placing Bid...' : 'Place Bid'}
            </Button>
          </form>

          {/* Bid History */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Bid History</h2>
            <div className="space-y-2">
              {artwork.bids.map((bid, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">{bid.user}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(bid.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <p className="font-semibold">{formatKES(bid.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 