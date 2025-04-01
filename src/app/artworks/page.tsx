'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatKES } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface Artwork {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startingPrice: number;
  currentPrice: number;
  endDate: string;
  status: string;
  artist: {
    id: string;
    name: string;
  };
}

export default function ArtworksPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch(`/api/artworks${searchTerm ? `?q=${searchTerm}` : ''}`);
        if (!response.ok) {
          throw new Error('Failed to fetch artworks');
        }
        const data = await response.json();
        setArtworks(data.artworks);
      } catch (error) {
        console.error('Error fetching artworks:', error);
        setError('Failed to load artworks');
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading artworks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Available Artworks</h1>
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Search artworks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          {user?.role === 'ARTIST' && (
            <Button asChild>
              <Link href="/artworks/upload">Upload Artwork</Link>
            </Button>
          )}
        </div>
      </div>

      {artworks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No artworks found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((artwork) => (
            <Card key={artwork.id} className="overflow-hidden">
              <div className="relative h-64">
                <Image
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{artwork.title}</CardTitle>
                <p className="text-sm text-gray-500">by {artwork.artist.name}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {artwork.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Current Price:</span>
                    <span className="font-semibold">{formatKES(artwork.currentPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Ends:</span>
                    <span className="text-sm">
                      {new Date(artwork.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/artworks/${artwork.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 