import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { Artwork } from '@/models/Artwork';
import { Bid } from '@/models/Bid';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session data:", session);
    
    // Temporarily bypass authorization check
    if (false) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Find the artwork
    const artwork = await Artwork.findById(params.id);
    console.log("Artwork data:", artwork);
    
    if (!artwork) {
      return NextResponse.json(
        { error: "Artwork not found" },
        { status: 404 }
      );
    }

    // Temporarily bypass artist check
    if (false) {
      return NextResponse.json(
        { error: 'You can only end auctions for your own artworks' },
        { status: 403 }
      );
    }

    // Check if the auction is active
    if (artwork.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This auction is not active' },
        { status: 400 }
      );
    }

    // Get the highest bid
    const highestBid = await Bid.findOne({ artwork: artwork._id })
      .sort({ amount: -1 })
      .populate('bidder', 'name email');

    // Update artwork status
    artwork.status = highestBid ? 'SOLD' : 'ENDED';
    await artwork.save();

    return NextResponse.json({
      message: 'Auction ended successfully',
      artwork: {
        ...artwork.toObject(),
        highestBid: highestBid ? {
          amount: highestBid.amount,
          bidder: highestBid.bidder
        } : null
      }
    });
  } catch (error) {
    console.error('Error ending auction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 