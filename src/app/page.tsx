'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
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
    </div>
  );
}