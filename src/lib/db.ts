import { ObjectId } from 'mongodb';
import clientPromise from './mongodb';
import {
  User,
  Artwork,
  Auction,
  Bid,
  Transaction,
  Notification,
  ArtistProfile,
  AuctionWithDetails,
} from './types';
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

// Augment the NodeJS global type
declare global {
  var mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

export async function getDb() {
  const client = await clientPromise;
  const db = client.db();
  return db;
}

// User Services
export async function getUserById(id: string) {
  const db = await getDb();
  return db.collection<User>('users').findOne({ _id: new ObjectId(id) });
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  return db.collection<User>('users').findOne({ email });
}

export async function createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  const now = new Date();
  const newUser = {
    ...userData,
    role: userData.role || 'user',
    createdAt: now,
    updatedAt: now,
  };
  
  const result = await db.collection<User>('users').insertOne(newUser as any);
  return { ...newUser, _id: result.insertedId };
}

export async function updateUser(id: string, userData: Partial<User>) {
  const db = await getDb();
  const updateData = {
    ...userData,
    updatedAt: new Date(),
  };
  
  await db.collection<User>('users').updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  
  return getUserById(id);
}

// Artwork Services
export async function getArtworkById(id: string) {
  const db = await getDb();
  return db.collection<Artwork>('artworks').findOne({ _id: new ObjectId(id) });
}

export async function getArtworksByArtist(artistId: string) {
  const db = await getDb();
  return db
    .collection<Artwork>('artworks')
    .find({ artistId: new ObjectId(artistId) })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function createArtwork(artworkData: Omit<Artwork, '_id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  const now = new Date();
  const newArtwork = {
    ...artworkData,
    status: artworkData.status || 'draft',
    createdAt: now,
    updatedAt: now,
  };
  
  const result = await db.collection<Artwork>('artworks').insertOne(newArtwork as any);
  return { ...newArtwork, _id: result.insertedId };
}

export async function updateArtwork(id: string, artworkData: Partial<Artwork>) {
  const db = await getDb();
  const updateData = {
    ...artworkData,
    updatedAt: new Date(),
  };
  
  await db.collection<Artwork>('artworks').updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  
  return getArtworkById(id);
}

// Auction Services
export async function getAuctionById(id: string) {
  const db = await getDb();
  return db.collection<Auction>('auctions').findOne({ _id: new ObjectId(id) });
}

export async function getAuctionsByStatus(status: Auction['status']) {
  const db = await getDb();
  return db
    .collection<Auction>('auctions')
    .find({ status })
    .sort({ startDate: 1 })
    .toArray();
}

export async function getAuctionWithDetails(id: string): Promise<AuctionWithDetails | null> {
  const db = await getDb();
  const auction = await getAuctionById(id);
  
  if (!auction) return null;
  
  const artwork = await getArtworkById(auction.artworkId.toString());
  if (!artwork) return null;
  
  const artist = await getUserById(artwork.artistId.toString()) as ArtistProfile;
  if (!artist) return null;
  
  const bidCount = auction.bids?.length || 0;
  
  let highestBidder = undefined;
  if (bidCount > 0) {
    const topBid = auction.bids.reduce((prev, current) => 
      (prev.amount > current.amount) ? prev : current
    );
    const bidder = await getUserById(topBid.userId.toString());
    if (bidder) {
      highestBidder = {
        _id: bidder._id,
        name: bidder.name,
      };
    }
  }
  
  return {
    ...auction,
    artwork,
    artist,
    bidCount,
    highestBidder,
  };
}

export async function createAuction(auctionData: Omit<Auction, '_id' | 'bids' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  const now = new Date();
  const newAuction = {
    ...auctionData,
    bids: [],
    status: auctionData.status || 'upcoming',
    featuredAuction: auctionData.featuredAuction || false,
    createdAt: now,
    updatedAt: now,
  };
  
  const result = await db.collection<Auction>('auctions').insertOne(newAuction as any);
  return { ...newAuction, _id: result.insertedId };
}

export async function updateAuction(id: string, auctionData: Partial<Auction>) {
  const db = await getDb();
  const updateData = {
    ...auctionData,
    updatedAt: new Date(),
  };
  
  await db.collection<Auction>('auctions').updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  
  return getAuctionById(id);
}

export async function placeBid(auctionId: string, userId: string, amount: number) {
  const db = await getDb();
  const auction = await getAuctionById(auctionId);
  
  if (!auction || auction.status !== 'active') {
    throw new Error('Auction is not active');
  }
  
  if (amount < auction.currentPrice + auction.minBidIncrement) {
    throw new Error(`Bid must be at least ${auction.currentPrice + auction.minBidIncrement}`);
  }
  
  const newBid: Bid = {
    _id: new ObjectId(),
    auctionId: new ObjectId(auctionId),
    userId: new ObjectId(userId),
    amount,
    timestamp: new Date(),
  };
  
  await db.collection<Auction>('auctions').updateOne(
    { _id: new ObjectId(auctionId) },
    { 
      $push: { bids: newBid },
      $set: { 
        currentPrice: amount,
        updatedAt: new Date(),
      }
    }
  );
  
  return newBid;
}

// Notification Services
export async function createNotification(notificationData: Omit<Notification, '_id' | 'read' | 'createdAt'>) {
  const db = await getDb();
  const newNotification = {
    ...notificationData,
    read: false,
    createdAt: new Date(),
  };
  
  const result = await db.collection<Notification>('notifications').insertOne(newNotification as any);
  return { ...newNotification, _id: result.insertedId };
}

export async function getUserNotifications(userId: string) {
  const db = await getDb();
  return db
    .collection<Notification>('notifications')
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function markNotificationAsRead(id: string) {
  const db = await getDb();
  await db.collection<Notification>('notifications').updateOne(
    { _id: new ObjectId(id) },
    { $set: { read: true } }
  );
}

// Transaction Services
export async function createTransaction(transactionData: Omit<Transaction, '_id' | 'status' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  const now = new Date();
  const newTransaction = {
    ...transactionData,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
  
  const result = await db.collection<Transaction>('transactions').insertOne(newTransaction as any);
  return { ...newTransaction, _id: result.insertedId };
}

export async function updateTransactionStatus(id: string, status: Transaction['status']) {
  const db = await getDb();
  await db.collection<Transaction>('transactions').updateOne(
    { _id: new ObjectId(id) },
    { 
      $set: { 
        status,
        updatedAt: new Date(),
      }
    }
  );
  
  const transaction = await db.collection<Transaction>('transactions').findOne({ _id: new ObjectId(id) });
  return transaction;
}

// Search and Filter Services
export async function searchArtworks(query: string, filters: any = {}) {
  const db = await getDb();
  
  // Build the search query
  const searchQuery: any = {};
  if (query) {
    searchQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } },
    ];
  }
  
  // Add filters
  if (filters.medium) {
    searchQuery.medium = { $regex: filters.medium, $options: 'i' };
  }
  
  if (filters.minYear || filters.maxYear) {
    searchQuery.year = {};
    if (filters.minYear) searchQuery.year.$gte = parseInt(filters.minYear);
    if (filters.maxYear) searchQuery.year.$lte = parseInt(filters.maxYear);
  }
  
  if (filters.tags && filters.tags.length > 0) {
    searchQuery.tags = { $in: filters.tags };
  }
  
  return db
    .collection<Artwork>('artworks')
    .find({ ...searchQuery, status: 'published' })
    .sort({ createdAt: -1 })
    .toArray();
}

// Analytics Services
export async function getAuctionAnalytics() {
  const db = await getDb();
  
  const totalAuctions = await db.collection<Auction>('auctions').countDocuments();
  const activeAuctions = await db.collection<Auction>('auctions').countDocuments({ status: 'active' });
  const completedAuctions = await db.collection<Auction>('auctions').countDocuments({ status: 'ended' });
  
  const result = await db.collection<Auction>('auctions').aggregate([
    { $match: { status: 'ended' } },
    { $group: {
        _id: null,
        totalSales: { $sum: '$currentPrice' },
        avgSalePrice: { $avg: '$currentPrice' },
        highestSale: { $max: '$currentPrice' },
      }
    }
  ]).toArray();
  
  const salesData = result[0] || { totalSales: 0, avgSalePrice: 0, highestSale: 0 };
  
  return {
    totalAuctions,
    activeAuctions,
    completedAuctions,
    ...salesData,
  };
}

export async function getUserAnalytics(userId: string) {
  const db = await getDb();
  
  const bidsPlaced = await db.collection<Auction>('auctions').aggregate([
    { $unwind: '$bids' },
    { $match: { 'bids.userId': new ObjectId(userId) } },
    { $count: 'total' }
  ]).toArray();
  
  const wonAuctions = await db.collection<Auction>('auctions').aggregate([
    { $match: { status: 'ended' } },
    { $addFields: {
        highestBid: { $max: '$bids.amount' },
        bidsArray: '$bids'
      }
    },
    { $unwind: '$bidsArray' },
    { $match: { 
        $expr: { 
          $and: [
            { $eq: ['$bidsArray.amount', '$highestBid'] },
            { $eq: ['$bidsArray.userId', new ObjectId(userId)] }
          ]
        }
      }
    },
    { $count: 'total' }
  ]).toArray();
  
  return {
    bidsPlaced: bidsPlaced[0]?.total || 0,
    wonAuctions: wonAuctions[0]?.total || 0,
  };
}

export async function getArtistAnalytics(artistId: string) {
  const db = await getDb();
  
  const artworks = await db.collection<Artwork>('artworks').countDocuments({ artistId: new ObjectId(artistId) });
  
  const artworkIds = await db.collection<Artwork>('artworks')
    .find({ artistId: new ObjectId(artistId) })
    .project({ _id: 1 })
    .map(doc => doc._id)
    .toArray();
  
  const auctionsData = await db.collection<Auction>('auctions').aggregate([
    { $match: { artworkId: { $in: artworkIds }, status: 'ended' } },
    { $group: {
        _id: null,
        totalSales: { $sum: '$currentPrice' },
        auctionsCompleted: { $sum: 1 },
        avgSalePrice: { $avg: '$currentPrice' },
      }
    }
  ]).toArray();
  
  const salesData = auctionsData[0] || { totalSales: 0, auctionsCompleted: 0, avgSalePrice: 0 };
  
  return {
    artworks,
    ...salesData,
  };
} 