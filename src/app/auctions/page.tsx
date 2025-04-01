'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight, DollarSign, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchFilter from '@/components/search/SearchFilter';
import { Auction, Artwork, ArtistProfile } from '@/lib/types';
import { formatKES } from '@/lib/utils';
import { createObjectId } from '@/lib/createObjectId';

// Mock data - in a real app, this would come from your API
const mockTags = [
  'Abstract', 'Portrait', 'Landscape', 'Still Life', 'Sculpture', 
  'Photography', 'Digital Art', 'Mixed Media', 'Oil Painting', 'Watercolor'
];

const mockMediums = [
  'Oil', 'Acrylic', 'Watercolor', 'Charcoal', 'Pencil', 
  'Digital', 'Mixed Media', 'Photography', 'Sculpture', 'Installation'
];

type AuctionItemWithDetails = {
  auction: Auction;
  artwork: Artwork;
  artist: ArtistProfile;
};

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<AuctionItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('active');
  
  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch(`/api/auctions?status=${activeFilter}`);
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockAuctions: AuctionItemWithDetails[] = Array(6).fill(null).map((_, index) => {
          // Create proper ObjectId instances for development
          const auctionId = createObjectId(`auction-${index}`);
          const artworkId = createObjectId(`artwork-${index}`);
          const artistId = createObjectId(`artist-${index}`);
          
          // Determine auction status based on index
          let status: 'upcoming' | 'active' | 'ended' | 'cancelled' = 'active';
          if (index === 0) status = 'upcoming';
          else if (index >= 5) status = 'ended';
          
          return {
            auction: {
              _id: auctionId,
              artworkId: artworkId,
              startingPrice: 500 + index * 100,
              currentPrice: 750 + index * 150,
              minBidIncrement: 50,
              startDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
              endDate: new Date(Date.now() + 86400000 * (index + 1)), // 1-6 days from now
              status: status,
              featuredAuction: index === 1,
              bids: Array(index + 1).fill(null).map((_, bidIndex) => ({
                _id: createObjectId(`bid-${index}-${bidIndex}`),
                auctionId: auctionId,
                userId: createObjectId(`user-${bidIndex}`),
                amount: 500 + index * 100 + bidIndex * 50,
                timestamp: new Date(Date.now() - 3600000 * bidIndex),
              })),
              createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
              updatedAt: new Date(),
            },
            artwork: {
              _id: artworkId,
              title: `Artwork Title ${index + 1}`,
              description: `This is a beautiful artwork created with passion and skill. It represents the artist's unique vision and creativity.`,
              artistId: artistId,
              images: [`https://picsum.photos/seed/art${index}/800/600`],
              medium: mockMediums[index % mockMediums.length],
              dimensions: { width: 60, height: 40, unit: 'cm' },
              year: 2023,
              tags: [
                mockTags[index % mockTags.length],
                mockTags[(index + 3) % mockTags.length],
              ],
              status: 'published',
              createdAt: new Date(Date.now() - 86400000 * 30), // 30 days ago
              updatedAt: new Date(),
            },
            artist: {
              _id: artistId,
              name: `Artist Name ${index + 1}`,
              email: `artist${index + 1}@example.com`,
              bio: `An accomplished artist with a unique perspective and distinctive style.`,
              role: 'artist',
              portfolio: `https://artist${index + 1}.example.com`,
              createdAt: new Date(Date.now() - 86400000 * 365), // 1 year ago
              updatedAt: new Date(),
            },
          };
        });
        
        // Filter based on active filter
        const filteredAuctions = activeFilter === 'all' 
          ? mockAuctions 
          : mockAuctions.filter(a => a.auction.status === activeFilter);
        
        setAuctions(filteredAuctions);
      } catch (err) {
        console.error('Error fetching auctions:', err);
        setError('Failed to load auctions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuctions();
  }, [activeFilter]);
  
  const handleSearch = (query: string, filters: any) => {
    // In a real app, you would make an API call with the search parameters
    console.log('Search query:', query);
    console.log('Filters:', filters);
    
    // For now, we'll just log the search parameters
    alert('Search functionality would filter the auctions based on the query and filters.');
  };
  
  // Calculate time left for an auction
  const getTimeLeft = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h left`;
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m left`;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-[#b65425]">Art Auctions</h1>
        <p className="text-gray-600 max-w-3xl">
          Discover and bid on unique artworks from Kenya&apos;s most talented artists. 
          Each piece has been carefully curated for our art-loving community.
        </p>
      </div>
      
      {/* Search and Filter Section */}
      <SearchFilter 
        onSearch={handleSearch}
        availableTags={mockTags}
        availableMediums={mockMediums}
      />
      
      {/* Status Filter Tabs */}
      <div className="mb-8 border-b border-[#b65425]/20">
        <div className="flex flex-wrap -mb-px">
          <button
            onClick={() => setActiveFilter('all')}
            className={`inline-block py-4 px-4 text-sm font-medium ${
              activeFilter === 'all'
                ? 'text-[#078250] border-b-2 border-[#078250]'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
            }`}
          >
            All Auctions
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`inline-block py-4 px-4 text-sm font-medium ${
              activeFilter === 'active'
                ? 'text-[#078250] border-b-2 border-[#078250]'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`inline-block py-4 px-4 text-sm font-medium ${
              activeFilter === 'upcoming'
                ? 'text-[#078250] border-b-2 border-[#078250]'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveFilter('ended')}
            className={`inline-block py-4 px-4 text-sm font-medium ${
              activeFilter === 'ended'
                ? 'text-[#078250] border-b-2 border-[#078250]'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
            }`}
          >
            Ended
          </button>
        </div>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#078250]"></div>
        </div>
      )}
      
      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Empty State */}
      {!loading && !error && auctions.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <p className="text-gray-600 mb-4">No auctions found for this filter.</p>
          <Button
            onClick={() => setActiveFilter('all')}
            className="bg-[#078250] hover:bg-[#078250]/90 text-white"
          >
            View all auctions
          </Button>
        </div>
      )}
      
      {/* Auctions Grid */}
      {!loading && !error && auctions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map((item) => (
            <div 
              key={item.auction._id.toString()} 
              className={`bg-white rounded-lg overflow-hidden shadow-lg group ${
                item.auction.featuredAuction ? 'ring-2 ring-[#b65425] ring-offset-2' : ''
              }`}
            >
              {item.auction.featuredAuction && (
                <div className="absolute top-2 right-2 z-10 bg-[#b65425] text-white text-xs font-bold py-1 px-2 rounded">
                  Featured
                </div>
              )}
              <div className="relative aspect-[4/3] overflow-hidden">
                <div className="bg-gray-200 w-full h-full">
                  <img 
                    src={item.artwork.images[0]} 
                    alt={item.artwork.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="flex items-center text-white gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {getTimeLeft(item.auction.endDate)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h2 className="text-xl font-semibold text-[#b65425] mb-1">
                  {item.artwork.title}
                </h2>
                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <User className="h-4 w-4 mr-1" />
                  <span>{item.artist.name}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.artwork.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-sm text-gray-500">Current bid</p>
                    <p className="text-lg font-bold text-[#078250]">
                      {formatKES(item.auction.currentPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Starting price</p>
                    <p className="text-sm text-gray-600">
                      {formatKES(item.auction.startingPrice)}
                    </p>
                  </div>
                </div>
                
                <Button
                  asChild
                  className="w-full bg-[#078250] hover:bg-[#078250]/90 text-white"
                >
                  <Link href={`/auctions/${item.auction._id.toString()}`}>
                    View Auction
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 