import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Artwork } from '@/models/Artwork';
import { Bid } from '@/models/Bid';

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