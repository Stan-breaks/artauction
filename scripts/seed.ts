import { MongoClient, ObjectId } from 'mongodb';
import { faker } from '@faker-js/faker';
import { hash } from 'bcryptjs';
import dotenv from 'dotenv';
import clientPromise from '../src/lib/mongodb';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// MongoDB connection string from environment variable
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/artauction';

// Types
interface User {
  _id: ObjectId;
  name: string;
  email: string;
  role: 'USER' | 'ARTIST' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

interface Artist {
  _id: ObjectId;
  userId: ObjectId;
  bio: string;
  specialties: string[];
  socialLinks: {
    website?: string;
    instagram?: string;
    twitter?: string;
  };
}

interface Artwork {
  _id: ObjectId;
  title: string;
  description: string;
  artistId: ObjectId;
  medium: string;
  dimensions: {
    width: number;
    height: number;
    unit: 'cm' | 'inches';
  };
  year: number;
  images: string[];
  tags: string[];
}

interface Auction {
  _id: ObjectId;
  artworkId: ObjectId;
  startingPrice: number;
  currentPrice: number;
  startTime: Date;
  endTime: Date;
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED';
  featured: boolean;
  bids: {
    userId: ObjectId;
    amount: number;
    timestamp: Date;
  }[];
}

async function seedDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Create sample artists
    const artist1Password = await hash('artist123', 10);
    const artist2Password = await hash('artist456', 10);
    
    const artist1 = await db.collection('users').insertOne({
      name: 'John Doe',
      email: 'john@example.com',
      password: artist1Password,
      role: 'ARTIST',
      bio: 'Contemporary artist specializing in digital art',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const artist2 = await db.collection('users').insertOne({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: artist2Password,
      role: 'ARTIST',
      bio: 'Abstract artist exploring digital mediums',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create sample artworks
    const artwork1 = await db.collection('artworks').insertOne({
      title: 'Digital Dreams',
      description: 'A vibrant digital artwork exploring the intersection of technology and nature',
      artistId: artist1.insertedId,
      imageUrl: '/images/artworks/artwork1.jpg',
      medium: 'Digital',
      dimensions: '1920x1080',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const artwork2 = await db.collection('artworks').insertOne({
      title: 'Abstract Harmony',
      description: 'An abstract digital composition exploring color and form',
      artistId: artist2.insertedId,
      imageUrl: '/images/artworks/artwork2.jpg',
      medium: 'Digital',
      dimensions: '1920x1080',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create sample auctions
    const auction1 = await db.collection('auctions').insertOne({
      artworkId: artwork1.insertedId,
      startingPrice: 1000,
      currentPrice: 1000,
      minimumBidIncrement: 100,
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const auction2 = await db.collection('auctions').insertOne({
      artworkId: artwork2.insertedId,
      startingPrice: 1500,
      currentPrice: 1500,
      minimumBidIncrement: 150,
      startTime: new Date(),
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create sample collector
    const collectorPassword = await hash('collector789', 10);
    const collector = await db.collection('users').insertOne({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: collectorPassword,
      role: 'COLLECTOR',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create sample bids
    await db.collection('bids').insertOne({
      auctionId: auction1.insertedId,
      userId: collector.insertedId,
      amount: 1100,
      createdAt: new Date(),
    });

    await db.collection('bids').insertOne({
      auctionId: auction2.insertedId,
      userId: collector.insertedId,
      amount: 1650,
      createdAt: new Date(),
    });

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 