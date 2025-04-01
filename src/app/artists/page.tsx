'use client';

import { Instagram, Twitter, Globe } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ArtistsPage() {
  // Mock data - will be replaced with real data from API
  const artists = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    name: `Artist Name ${i + 1}`,
    bio: 'Contemporary artist specializing in abstract expressionism and digital art.',
    avatar: `https://randomuser.me/api/portraits/${i % 2 ? 'women' : 'men'}/${i + 1}.jpg`,
    specialties: ['Digital Art', 'Oil Painting', 'Sculpture'][i % 3],
    artworksCount: Math.floor(Math.random() * 20) + 5,
    socialLinks: {
      website: 'https://example.com',
      instagram: 'artist_handle',
      twitter: 'artist_handle',
    },
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-[#b65425]">Our Artists</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover talented artists from Kenya. Each brings their unique perspective and expertise to our platform.
        </p>
      </div>

      {/* Artists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists.map((artist) => (
          <article key={artist.id} className="bg-white rounded-lg overflow-hidden shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-semibold text-lg text-[#b65425]">{artist.name}</h2>
                  <p className="text-sm text-gray-600">
                    {artist.specialties}
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">
                {artist.bio}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500">
                  {artist.artworksCount} Artworks
                </div>
                <div className="flex gap-3">
                  <a
                    href={artist.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#078250]"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                  <a
                    href={`https://instagram.com/${artist.socialLinks.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#078250]"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href={`https://twitter.com/${artist.socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#078250]"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                </div>
              </div>

              <Button
                asChild
                className="w-full bg-[#078250] hover:bg-[#078250]/90 text-white"
              >
                <Link href={`/artists/${artist.id}`}>
                  View Profile
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
} 