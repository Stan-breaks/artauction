'use client';

import { Instagram, Twitter, Globe, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatKES } from '@/lib/utils';
import { createObjectId } from '@/lib/createObjectId';

interface ArtistPageProps {
  params: {
    id: string;
  };
}

export default function ArtistPage({ params }: ArtistPageProps) {
  // Collection of Kenyan counties
  const kenyanCounties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'
  ];

  // Kenyan-themed art specialties
  const kenyanSpecialties = [
    'Maasai Art', 'Wildlife Portraits', 'East African Landscapes', 
    'Kikuyu Traditions', 'Coastal Scenes', 'Nairobi Urban Life'
  ];

  // Kenyan-themed exhibitions
  const kenyanExhibitions = [
    'Nairobi National Museum', 'Nairobi Gallery', 'Kuona Trust Art Centre',
    'Alliance Française, Nairobi', 'Circle Art Gallery', 'RaMoMA Museum'
  ];

  // Mock data - will be replaced with API call
  const artistId = parseInt(params.id);
  const artist = {
    id: params.id,
    name: `Artist Name ${params.id}`,
    bio: 'Contemporary artist specializing in abstract expressionism and digital art. With over a decade of experience, their work has been featured in galleries across Nairobi and other cities in Kenya.',
    avatar: `https://randomuser.me/api/portraits/${artistId % 2 ? 'women' : 'men'}/${artistId}.jpg`,
    coverImage: `https://picsum.photos/seed/${params.id}/1200/400`,
    location: `${kenyanCounties[artistId % kenyanCounties.length]}, Kenya`,
    email: `artist${artistId}@example.co.ke`,
    specialties: [
      kenyanSpecialties[artistId % kenyanSpecialties.length],
      kenyanSpecialties[(artistId + 2) % kenyanSpecialties.length],
      kenyanSpecialties[(artistId + 4) % kenyanSpecialties.length]
    ],
    exhibitions: [
      `${kenyanExhibitions[artistId % kenyanExhibitions.length]} - 2023`,
      `${kenyanExhibitions[(artistId + 2) % kenyanExhibitions.length]} - 2022`,
      `${kenyanExhibitions[(artistId + 4) % kenyanExhibitions.length]} - 2021`,
    ],
    socialLinks: {
      website: 'https://example.co.ke',
      instagram: 'artist_handle',
      twitter: 'artist_handle',
    },
  };

  // Mock artworks data with Kenyan themes
  const artworks = Array.from({ length: 6 }, (_, i) => {
    const artTypes = ['Maasai Sunset', 'Wildlife Portrait', 'Savannah Landscape', 'Village Scene', 'Urban Nairobi', 'Coastal View'];
    return {
      id: i + 1,
      title: `${artTypes[i % artTypes.length]} ${i + 1}`,
      image: `https://picsum.photos/seed/${i + artistId}/400/300`,
      price: Math.floor(Math.random() * 50000) + 10000,
      status: ['Available', 'Sold', 'In Auction'][i % 3],
    };
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Cover Image */}
      <div className="h-64 md:h-96 relative -mx-4">
        <img
          src={artist.coverImage}
          alt="Artist Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Artist Info */}
      <div className="relative px-4 -mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <img
              src={artist.avatar}
              alt={artist.name}
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 text-[#b65425]">{artist.name}</h1>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {artist.location}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {artist.email}
                </span>
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
          </div>
        </div>
      </div>

      {/* Artist Details */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#b65425]">About</h2>
            <p className="text-gray-600">{artist.bio}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#b65425]">Artworks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {artworks.map((artwork) => (
                <article key={artwork.id} className="bg-white rounded-lg overflow-hidden shadow-lg group">
                  <div className="aspect-w-4 aspect-h-3 relative">
                    <img
                      src={artwork.image}
                      alt={artwork.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        asChild
                        className="bg-[#078250] hover:bg-[#078250]/90 text-white"
                      >
                        <Link href={`/auctions/${artwork.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#b65425]">{artwork.title}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[#078250] font-bold">
                        {formatKES(artwork.price)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {artwork.status}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-lg overflow-hidden shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-[#b65425]">Specialties</h2>
            <div className="space-y-2">
              {artist.specialties.map((specialty, i) => (
                <div
                  key={i}
                  className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                >
                  {specialty}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-lg overflow-hidden shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-[#b65425]">Notable Exhibitions</h2>
            <ul className="space-y-2">
              {artist.exhibitions.map((exhibition, i) => (
                <li key={i} className="text-gray-600">
                  {exhibition}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
} 