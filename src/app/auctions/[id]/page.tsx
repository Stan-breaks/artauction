'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { 
  Calendar, Tag, Ruler, Clock, AlertCircle, 
  ChevronLeft, Share2, Heart, Eye, User, Info, Globe, Instagram, Twitter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import BiddingInterface from '@/components/auctions/BiddingInterface';
import { Auction, Artwork, ArtistProfile } from '@/lib/types';
import { formatKES } from '@/lib/utils';
import { createObjectId } from '@/lib/createObjectId';
import AuthModal from '@/components/auth/AuthModal';

type AuctionDetails = {
  auction: Auction;
  artwork: Artwork;
  artist: ArtistProfile;
};

export default function AuctionDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const { id } = params;
  
  const [auctionDetails, setAuctionDetails] = useState<AuctionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  useEffect(() => {
    const fetchAuctionDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, fetch from API
        // const response = await fetch(`/api/auctions/${id}`);
        // const data = await response.json();
        
        // Generate proper ObjectIds for the mock data
        const auctionId = createObjectId(id as string);
        const artworkId = createObjectId('artwork-1');
        const artistId = createObjectId('artist-1');
        
        // Mock data for demonstration
        const mockAuction: AuctionDetails = {
          auction: {
            _id: auctionId,
            artworkId: artworkId,
            startingPrice: 15000,
            currentPrice: 25000,
            minBidIncrement: 1000,
            startDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
            endDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
            status: 'active',
            featuredAuction: true,
            bids: Array(5).fill(null).map((_, index) => ({
              _id: createObjectId(`bid-${index}`),
              auctionId: auctionId,
              userId: createObjectId(`user-${index}`),
              amount: 15000 + index * 2000,
              timestamp: new Date(Date.now() - 3600000 * index),
            })),
            createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
            updatedAt: new Date(),
          },
          artwork: {
            _id: artworkId,
            title: 'Maasai Mara Sunset',
            description: `This stunning landscape captures the serene beauty of the Maasai Mara at sunset. The artist has masterfully used a palette of warm oranges, purples, and deep blues to create a sense of peace and tranquility. The rolling savannah and distant acacia trees provide depth, while the silhouettes of wildlife add an authentic Kenyan character.\n\nCreated during the artist's retreat in the Mara, this piece reflects both technical skill and emotional connection to Kenya's natural beauty. The brushwork is confident yet delicate, showing the artist's unique approach to capturing light and atmosphere.`,
            artistId: artistId,
            images: [
              'https://picsum.photos/seed/art1/800/600',
              'https://picsum.photos/seed/art2/800/600',
              'https://picsum.photos/seed/art3/800/600',
            ],
            medium: 'Oil on Canvas',
            dimensions: { width: 76, height: 60, unit: 'cm' },
            year: 2023,
            tags: ['Landscape', 'Sunset', 'Wildlife', 'Kenyan Art'],
            provenance: 'Directly from the artist\'s studio in Nairobi',
            status: 'published',
            createdAt: new Date(Date.now() - 86400000 * 30), // 30 days ago
            updatedAt: new Date(),
          },
          artist: {
            _id: artistId,
            name: 'Wangari Mwangi',
            email: 'wangari@example.co.ke',
            image: 'https://randomuser.me/api/portraits/women/42.jpg',
            bio: `Wangari Mwangi is a contemporary landscape artist known for her vibrant use of color and emotional depth. Born in Nairobi in 1985, she studied at the prestigious Kenyatta University and has since exhibited her work across East Africa and internationally.\n\nHer approach combines traditional Kenyan techniques with modern sensibilities, creating pieces that feel both timeless and contemporary. Mwangi draws inspiration from her travels across Kenya and her deep connection to the country's diverse landscapes, from the coast to the highlands.`,
            role: 'artist',
            portfolio: 'https://artist-portfolio.example.co.ke',
            specialties: ['Landscape', 'Oil Painting', 'Contemporary Kenyan Art'],
            socialLinks: {
              website: 'https://wangari-art.example.co.ke',
              instagram: '@wangari_art',
              twitter: '@mwangi_art',
            },
            createdAt: new Date(Date.now() - 86400000 * 365), // 1 year ago
            updatedAt: new Date(),
          },
        };
        
        setAuctionDetails(mockAuction);
      } catch (err) {
        console.error('Error fetching auction details:', err);
        setError('Failed to load auction details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchAuctionDetails();
    }
  }, [id]);
  
  // Use the actual user from session, or a guest user if not signed in
  const currentUser = session?.user ? 
    { id: session.user.id, name: session.user.name || 'User' } : 
    { id: 'guest', name: 'Guest' };
  
  const [activeImage, setActiveImage] = useState(0);
  
  const handlePlaceBid = (amount: number) => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }
    
    // In a real app, this would call an API endpoint
    console.log(`Placing bid of ${amount}`);
    
    // For demo purposes, add the bid locally
    if (auctionDetails) {
      const newBid = {
        _id: createObjectId(),
        auctionId: auctionDetails.auction._id,
        userId: createObjectId(currentUser.id),
        amount,
        timestamp: new Date(),
      };
      
      setAuctionDetails({
        ...auctionDetails,
        auction: {
          ...auctionDetails.auction,
          currentPrice: amount,
          bids: [newBid, ...(auctionDetails.auction.bids || [])],
        },
      });
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#078250]"></div>
      </div>
    );
  }
  
  if (error || !auctionDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5" />
            <div>
              <h3 className="font-semibold">Error</h3>
              <p>{error || 'Failed to load auction details'}</p>
            </div>
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          className="flex items-center"
        >
          <Link href="/auctions">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Auctions
          </Link>
        </Button>
      </div>
    );
  }
  
  const { auction, artwork, artist } = auctionDetails;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <nav className="flex text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
          <span className="mx-2 text-gray-500">/</span>
          <Link href="/auctions" className="text-gray-500 hover:text-gray-700">Auctions</Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-[#b65425]">{artwork.title}</span>
        </nav>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Artwork Gallery - 3 columns */}
        <div className="lg:col-span-3">
          <div className="mb-4 bg-gray-100 rounded-md overflow-hidden">
            <img 
              src={artwork.images[activeImage]} 
              alt={artwork.title}
              className="w-full h-auto object-contain"
              style={{ maxHeight: '500px' }}
            />
          </div>
          
          {/* Thumbnail Gallery */}
          {artwork.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {artwork.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden ${
                    activeImage === index 
                      ? 'ring-2 ring-[#078250] ring-offset-2' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${artwork.title} - image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          
          {/* Artwork Information */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6 text-[#b65425]">Artwork Details</h2>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line mb-6">
                {artwork.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-[#b65425]">Specifications</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-700">
                      <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                      <span>Year: {artwork.year}</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <Ruler className="w-5 h-5 mr-2 text-gray-500" />
                      <span>Dimensions: {artwork.dimensions.width} × {artwork.dimensions.height} {artwork.dimensions.unit}</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <Info className="w-5 h-5 mr-2 text-gray-500" />
                      <span>Medium: {artwork.medium}</span>
                    </li>
                    {artwork.provenance && (
                      <li className="flex items-start text-gray-700">
                        <Info className="w-5 h-5 mr-2 text-gray-500 mt-1" />
                        <span>Provenance: {artwork.provenance}</span>
                      </li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-[#b65425]">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {artwork.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Artist Information */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold mb-6 text-[#b65425]">About the Artist</h2>
            
            <div className="flex items-start gap-4 mb-6">
              <img 
                src={artist.image} 
                alt={artist.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold">{artist.name}</h3>
                <div className="flex gap-3 mt-2">
                  {artist.socialLinks?.website && (
                    <a
                      href={artist.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-[#078250]"
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                  {artist.socialLinks?.instagram && (
                    <a
                      href={`https://instagram.com/${artist.socialLinks.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-[#078250]"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {artist.socialLinks?.twitter && (
                    <a
                      href={`https://twitter.com/${artist.socialLinks.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-[#078250]"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 whitespace-pre-line mb-6">
              {artist.bio}
            </p>
            
            {artist.specialties && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2 text-[#b65425]">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {artist.specialties.map((specialty, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <Button
              asChild
              className="bg-[#078250] hover:bg-[#078250]/90 text-white"
            >
              <Link href={`/artists/${artist._id.toString()}`}>
                View Artist Profile
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Bidding Interface - 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
            <h1 className="text-2xl font-bold mb-2 text-[#b65425]">{artwork.title}</h1>
            <Link href={`/artists/${artist._id.toString()}`} className="text-gray-700 hover:text-[#078250] mb-6 inline-flex items-center">
              <User className="h-4 w-4 mr-1" />
              {artist.name}
            </Link>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Current Bid:</span>
                <span className="text-[#078250] font-bold text-xl">
                  {formatKES(auction.currentPrice)}
                </span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Starting Bid:</span>
                <span className="text-gray-700">
                  {formatKES(auction.startingPrice)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-100 rounded-md mb-6">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-[#078250]" />
                  <div>
                    <div className="text-sm text-gray-600">Auction ends in:</div>
                    <div className="font-semibold">
                      {Math.ceil((auction.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Bids:</div>
                  <div className="font-semibold text-center">{auction.bids.length}</div>
                </div>
              </div>
              
              <BiddingInterface 
                auction={auction}
                currentUser={currentUser}
                onPlaceBid={handlePlaceBid}
              />
            </div>
            
            <div className="flex gap-2 mb-6">
              <Button
                variant="outline"
                className="flex-1 flex items-center justify-center"
              >
                <Heart className="w-4 h-4 mr-2" />
                Favorite
              </Button>
              <Button
                variant="outline"
                className="flex-1 flex items-center justify-center"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
            
            <div className="text-sm text-gray-600">
              <p className="flex items-center mb-2">
                <Eye className="w-4 h-4 mr-2" />
                <span>25 people viewing this auction</span>
              </p>
              <p className="mb-4">
                This auction uses secure M-Pesa payments. All bids are binding agreements to purchase if you win.
              </p>
              <p>
                <Link href="/help/bidding" className="text-[#078250] hover:underline">
                  Learn more about bidding
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        message="You need to sign in to place bids on auctions"
      />
    </div>
  );
} 