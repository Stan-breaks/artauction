'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatKES } from '@/lib/utils';

// This would come from your API in a real app
const artworks = [
  {
    id: '1',
    title: 'Maasai Market Day',
    artist: 'Sarah Wanjiku',
    price: 45000,
    image: '/images/artworks/maasai-market.jpg',
    description: 'A vibrant depiction of the bustling Maasai market.',
  },
  {
    id: '2',
    title: 'Sunset at Lake Nakuru',
    artist: 'James Kimani',
    price: 35000,
    image: '/images/artworks/nakuru.jpg',
    description: 'Capturing the magical sunset over Lake Nakuru.',
  },
  {
    id: '3',
    title: 'Urban Life in Nairobi',
    artist: 'Peter Ochieng',
    price: 55000,
    image: '/images/artworks/nairobi.jpg',
    description: 'A contemporary take on city life in Nairobi.',
  },
];

export default function ArtworksPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArtworks = artworks.filter(artwork =>
    artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artwork.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Available Artworks</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search artworks..."
            className="px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button asChild>
            <Link href="/artworks/upload">Upload Artwork</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtworks.map((artwork) => (
          <div key={artwork.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-64">
              <Image
                src={artwork.image}
                alt={artwork.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{artwork.title}</h2>
              <p className="text-gray-600 mb-2">by {artwork.artist}</p>
              <p className="text-sm text-gray-500 mb-4">{artwork.description}</p>
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-primary">
                  {formatKES(artwork.price)}
                </p>
                <Button asChild>
                  <Link href={`/artworks/${artwork.id}`}>Place Bid</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 