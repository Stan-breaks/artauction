'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { formatKES } from '@/lib/utils';

const featuredArtworks = [
  {
    title: 'Maasai Market Day',
    artist: 'Sarah Wanjiku',
    price: 45000,
    image: '/images/artworks/maasai-market.jpg',
  },
  {
    title: 'Sunset at Lake Nakuru',
    artist: 'James Kimani',
    price: 35000,
    image: '/images/artworks/nakuru.jpg',
  },
  {
    title: 'Urban Life in Nairobi',
    artist: 'Peter Ochieng',
    price: 55000,
    image: '/images/artworks/nairobi.jpg',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 z-10" />
        <Image
          src="/images/artworks/maasai-market.jpg"
          alt="Kenyan Art"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 text-center text-white max-w-4xl px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            ArtAuction Kenya
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Discover and bid on authentic Kenyan art
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              asChild
              className="btn-primary px-8 py-6 text-lg"
            >
              <Link href="/artworks">View Artworks</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary px-8 py-6 text-lg"
            >
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Artworks */}
      <section className="py-16 px-4 bg-[#f8f5f2]">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Featured Artworks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredArtworks.map((artwork) => (
              <div key={artwork.title} className="card group hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-w-4 aspect-h-3 relative">
                  <Image
                    src={artwork.image}
                    alt={artwork.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-secondary">{artwork.title}</h3>
                  <p className="text-gray-600">by {artwork.artist}</p>
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-lg font-semibold text-primary">
                      {formatKES(artwork.price)}
                    </p>
                    <Button
                      asChild
                      className="btn-accent text-sm"
                      size="sm"
                    >
                      <Link href={`/artworks/${artwork.title.toLowerCase().replace(/\s+/g, '-')}`}>Place Bid</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button
              asChild
              className="btn-primary"
            >
              <Link href="/artworks">View All Artworks</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}