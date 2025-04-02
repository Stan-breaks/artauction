import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Artwork } from '@/models/Artwork';
import { Bid } from '@/models/Bid';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';

// GET /api/artworks/[id] - Get artwork by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const artwork = await Artwork.findById(params.id).populate('artist');
    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }

    const bids = await Bid.find({ artwork: params.id })
      .populate('bidder', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      artwork,
      bids
    });
  } catch (error: any) {
    console.error('Error fetching artwork:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/artworks/[id] - Update artwork
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the token from cookies
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = verifyToken(token);
    if (decoded.role !== 'ARTIST') {
      return NextResponse.json(
        { error: 'Only artists can update artworks' },
        { status: 403 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find the artwork
    const artwork = await Artwork.findById(params.id);
    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }

    // Check if the user is the artist
    if (artwork.artist.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'You can only update your own artworks' },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { title, description, startingPrice, endDate, imageUrl } = body;

    // Update artwork
    artwork.title = title;
    artwork.description = description;
    artwork.startingPrice = startingPrice;
    artwork.currentPrice = startingPrice;
    artwork.endDate = endDate;
    artwork.imageUrl = imageUrl;

    await artwork.save();

    return NextResponse.json({
      artwork: {
        id: artwork._id,
        title: artwork.title,
        description: artwork.description,
        startingPrice: artwork.startingPrice,
        currentPrice: artwork.currentPrice,
        endDate: artwork.endDate,
        imageUrl: artwork.imageUrl,
        artist: artwork.artist,
        status: artwork.status,
        createdAt: artwork.createdAt,
        updatedAt: artwork.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating artwork:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/artworks/[id] - Delete artwork
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the token from cookies
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = verifyToken(token);
    if (decoded.role !== 'ARTIST') {
      return NextResponse.json(
        { error: 'Only artists can delete artworks' },
        { status: 403 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find the artwork
    const artwork = await Artwork.findById(params.id);
    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }

    // Check if the user is the artist
    if (artwork.artist.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'You can only delete your own artworks' },
        { status: 403 }
      );
    }

    // Delete artwork
    await artwork.deleteOne();

    return NextResponse.json({ message: 'Artwork deleted successfully' });
  } catch (error) {
    console.error('Error deleting artwork:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    // Get user from session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to place a bid' },
        { status: 401 }
      );
    }

    const artwork = await Artwork.findById(params.id);
    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }

    if (artwork.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This auction is not active' },
        { status: 400 }
      );
    }

    const { amount } = await request.json();

    // Validate bid amount
    if (!amount) {
      return NextResponse.json(
        { error: 'Bid amount is required' },
        { status: 400 }
      );
    }

    if (amount <= artwork.currentPrice) {
      return NextResponse.json(
        { error: 'Bid amount must be higher than current price' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create new bid
    const bid = await Bid.create({
      artwork: artwork._id,
      bidder: user._id,
      amount,
    });

    // Update artwork current price
    artwork.currentPrice = amount;
    await artwork.save();

    // Populate bidder information
    const populatedBid = await Bid.findById(bid._id)
      .populate('bidder', 'name')
      .lean();

    return NextResponse.json(populatedBid);
  } catch (error) {
    console.error('Error placing bid:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 