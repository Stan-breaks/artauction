'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { formatKES } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

interface Bid {
  _id: string;
  amount: number;
  bidder: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface Artwork {
  _id: string;
  title: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  endDate: string;
  imageUrl: string;
  artist: {
    _id: string;
    name: string;
  };
  status: 'DRAFT' | 'ACTIVE' | 'ENDED' | 'SOLD';
}

export default function ArtworkPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await fetch(`/api/artworks/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch artwork');
        }
        const data = await response.json();
        setArtwork(data.artwork);
        setBids(data.bids);
      } catch (err) {
        setError('Failed to load artwork details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtwork();
  }, [params.id]);

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast.error('Please sign in to place a bid');
      return;
    }

    setIsBidding(true);
    try {
      const response = await fetch(`/api/artworks/${params.id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(bidAmount)
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to place bid');
      }

      const newBid = await response.json();
      setBids([newBid, ...bids]);
      setArtwork(prev => prev ? { ...prev, currentPrice: Number(bidAmount) } : null);
      setBidAmount('');
      toast.success('Bid placed successfully!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsBidding(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (error || !artwork) {
    return <div className="container mx-auto px-4 py-8">{error || 'Artwork not found'}</div>;
  }

  const minBidAmount = artwork.currentPrice + 1000; // Minimum bid increment of 1000 KES

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Artwork Image */}
        <div className="relative h-[500px] rounded-lg overflow-hidden">
          <Image
            src={artwork.imageUrl}
            alt={artwork.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Artwork Details */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{artwork.title}</h1>
          <p className="text-xl text-gray-600">by {artwork.artist.name}</p>
          <p className="text-gray-700">{artwork.description}</p>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Current Bid</h2>
            <p className="text-2xl font-bold text-primary">
              {formatKES(artwork.currentPrice)}
            </p>
            <p className="text-sm text-gray-500">
              Auction ends on {new Date(artwork.endDate).toLocaleDateString()}
            </p>
          </div>

          {/* Bidding Form */}
          {artwork.status === 'ACTIVE' && (
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
                  min={minBidAmount}
                  step="1000"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum bid: {formatKES(minBidAmount)}
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isBidding || !session?.user}
              >
                {isBidding ? 'Placing Bid...' : session?.user ? 'Place Bid' : 'Sign in to Bid'}
              </Button>
            </form>
          )}

          {artwork.status !== 'ACTIVE' && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800">
                This auction is {artwork.status.toLowerCase()}
              </p>
            </div>
          )}

          {/* Bid History */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Bid History</h2>
            <div className="space-y-2">
              {bids.map((bid) => (
                <div key={bid._id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">{bid.bidder?.name || 'Unknown Bidder'}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(bid.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="font-semibold">{formatKES(bid.amount)}</p>
                </div>
              ))}
              {bids.length === 0 && (
                <p className="text-gray-500">No bids yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 