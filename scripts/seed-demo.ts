import { MongoClient, ObjectId } from 'mongodb';
import { hash } from 'bcryptjs';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// MongoDB connection string from environment variable
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/artauction';

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Clear existing collections for a fresh start
    await db.collection('users').deleteMany({});
    await db.collection('artworks').deleteMany({});
    await db.collection('auctions').deleteMany({});
    console.log('Cleared existing collections');
    
    // Create demo users
    const password = await hash('password123', 10);
    
    const users = [
      {
        name: 'John Kimani',
        email: 'collector@example.com',
        password,
        role: 'user',
        image: '/images/artists/soi.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Wangari Mwangi',
        email: 'artist@example.com',
        password,
        role: 'artist',
        image: '/images/artists/wangechi.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password,
        role: 'admin',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    
    const insertedUsers = await db.collection('users').insertMany(users);
    console.log(`${insertedUsers.insertedCount} users seeded successfully`);
    
    // Get the inserted user IDs
    const artistId = insertedUsers.insertedIds[1];
    const collectorId = insertedUsers.insertedIds[0];
    
    // Create demo artworks
    const artworks = [
      {
        title: 'Serengeti Sunset',
        description: 'A vibrant depiction of a Kenyan sunset over the Serengeti plains, featuring acacia trees and wildlife silhouettes.',
        artistId: artistId,
        medium: 'Oil on Canvas',
        dimensions: { width: 80, height: 60, unit: 'cm' },
        year: 2023,
        images: ['/images/artworks/maasai-market.jpg'],
        tags: ['landscape', 'wildlife', 'sunset'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Nairobi Cityscape',
        description: 'A modern interpretation of Nairobi\'s evolving skyline, blending traditional and contemporary architectural elements.',
        artistId: artistId,
        medium: 'Acrylic',
        dimensions: { width: 100, height: 70, unit: 'cm' },
        year: 2023,
        images: ['/images/artworks/nairobi.jpg'],
        tags: ['cityscape', 'modern', 'architecture'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Maasai Rhythm',
        description: 'Abstract expressionist piece inspired by traditional Maasai dance movements and ceremonial colors.',
        artistId: artistId,
        medium: 'Mixed Media',
        dimensions: { width: 90, height: 90, unit: 'cm' },
        year: 2022,
        images: ['/images/artworks/nakuru.jpg'],
        tags: ['abstract', 'cultural', 'traditional'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    
    const insertedArtworks = await db.collection('artworks').insertMany(artworks);
    console.log(`${insertedArtworks.insertedCount} artworks seeded successfully`);
    
    // Create demo auctions
    // Current date for reference
    const now = new Date();
    
    // Create an active auction ending soon (1 day from now)
    const endingSoonDate = new Date();
    endingSoonDate.setDate(now.getDate() + 1);
    
    // Create an active auction with more time (7 days from now)
    const endingLaterDate = new Date();
    endingLaterDate.setDate(now.getDate() + 7);
    
    // Create a future auction (starts in 2 days)
    const startingLaterDate = new Date();
    startingLaterDate.setDate(now.getDate() + 2);
    
    const auctions = [
      {
        artworkId: insertedArtworks.insertedIds[0],
        startingPrice: 20000, // KES
        currentPrice: 25000,  // KES
        startTime: new Date(now.getTime() - 86400000), // Started 1 day ago
        endTime: endingSoonDate,
        status: 'active',
        featured: true,
        bids: [
          {
            userId: collectorId,
            amount: 25000,
            timestamp: new Date(now.getTime() - 43200000) // 12 hours ago
          },
          {
            userId: new ObjectId(),
            amount: 22000,
            timestamp: new Date(now.getTime() - 64800000) // 18 hours ago
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        artworkId: insertedArtworks.insertedIds[1],
        startingPrice: 15000, // KES
        currentPrice: 15000,  // KES (no bids yet)
        startTime: now, // Just started
        endTime: endingLaterDate,
        status: 'active',
        featured: false,
        bids: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        artworkId: insertedArtworks.insertedIds[2],
        startingPrice: 30000, // KES
        currentPrice: 30000,  // KES
        startTime: startingLaterDate, // Starts in 2 days
        endTime: new Date(startingLaterDate.getTime() + 7 * 86400000), // 7 days after start
        status: 'upcoming',
        featured: true,
        bids: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    
    const insertedAuctions = await db.collection('auctions').insertMany(auctions);
    console.log(`${insertedAuctions.insertedCount} auctions seeded successfully`);
    
    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('artworks').createIndex({ artistId: 1 });
    await db.collection('auctions').createIndex({ artworkId: 1 }, { unique: true });
    await db.collection('auctions').createIndex({ status: 1 });
    await db.collection('auctions').createIndex({ featured: 1 });
    console.log('Indexes created successfully');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  }); 