import clientPromise from '../src/lib/mongodb';
import { hash } from 'bcryptjs';

async function initDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Create collections if they don't exist
    await db.createCollection('users');
    await db.createCollection('artworks');
    await db.createCollection('auctions');
    await db.createCollection('bids');
    await db.createCollection('notifications');

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('artworks').createIndex({ artistId: 1 });
    await db.collection('auctions').createIndex({ artworkId: 1 });
    await db.collection('auctions').createIndex({ status: 1 });
    await db.collection('bids').createIndex({ auctionId: 1 });
    await db.collection('bids').createIndex({ userId: 1 });
    await db.collection('notifications').createIndex({ userId: 1 });
    await db.collection('notifications').createIndex({ read: 1 });

    // Create sample admin user
    const adminPassword = await hash('admin123', 10);
    await db.collection('users').insertOne({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase(); 