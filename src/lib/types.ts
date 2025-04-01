import { ObjectId } from 'mongodb';
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
  }
}

export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  role: 'user' | 'artist' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Artwork {
  _id: ObjectId;
  title: string;
  description: string;
  artistId: ObjectId;
  images: string[];
  medium: string;
  dimensions: {
    width: number;
    height: number;
    unit: 'in' | 'cm';
  };
  year: number;
  tags: string[];
  provenance?: string;
  status: 'draft' | 'published' | 'sold' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Auction {
  _id: ObjectId;
  artworkId: ObjectId;
  startingPrice: number;
  currentPrice: number;
  minBidIncrement: number;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'ended' | 'cancelled';
  featuredAuction: boolean;
  bids: Bid[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Bid {
  _id: ObjectId;
  auctionId: ObjectId;
  userId: ObjectId;
  amount: number;
  timestamp: Date;
}

export interface Transaction {
  _id: ObjectId;
  auctionId: ObjectId;
  artworkId: ObjectId;
  buyerId: ObjectId;
  sellerId: ObjectId;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentIntentId?: string;
  shippingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  message: string;
  type: 'bid' | 'outbid' | 'auction_end' | 'payment' | 'system';
  read: boolean;
  relatedId?: ObjectId; // Can be auctionId, artworkId, etc.
  createdAt: Date;
}

export interface ArtistProfile extends User {
  portfolio?: string;
  specialties?: string[];
  socialLinks?: {
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface AuctionWithDetails extends Auction {
  artwork: Artwork;
  artist: ArtistProfile;
  bidCount: number;
  highestBidder?: {
    _id: ObjectId;
    name: string;
  };
} 