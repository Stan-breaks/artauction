import { NextRequest, NextResponse } from 'next/server';
import { getAuctionById, placeBid, createNotification } from '@/lib/db';
import { Server } from 'socket.io';
import { ObjectId } from 'mongodb';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const { userId, amount } = await req.json();
    
    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid bid amount is required' },
        { status: 400 }
      );
    }
    
    // Fetch the auction to check if it's active
    const auction = await getAuctionById(id);
    
    if (!auction) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      );
    }
    
    if (auction.status !== 'active') {
      return NextResponse.json(
        { error: 'Auction is not active' },
        { status: 400 }
      );
    }
    
    // Check if the bid amount is sufficient
    if (amount < auction.currentPrice + auction.minBidIncrement) {
      return NextResponse.json(
        { 
          error: `Bid must be at least ${auction.currentPrice + auction.minBidIncrement}` 
        },
        { status: 400 }
      );
    }
    
    try {
      // Place the bid
      const newBid = await placeBid(id, userId, amount);
      
      // Create a notification for the current highest bidder (if there is one)
      if (auction.bids && auction.bids.length > 0) {
        const highestBid = auction.bids.reduce((prev, current) => 
          prev.amount > current.amount ? prev : current
        );
        
        // Don't notify if the same user is placing a higher bid
        if (highestBid.userId.toString() !== userId) {
          await createNotification({
            userId: highestBid.userId.toString(),
            title: 'You have been outbid',
            message: `Someone placed a higher bid of $${amount.toLocaleString()} on an auction you were winning.`,
            type: 'outbid',
            relatedId: auction._id,
          });
        }
      }
      
      // Create a notification for the artist/seller
      // In a real app, you would get the artist ID from the associated artwork
      await createNotification({
        userId: 'admin', // Fallback to admin since we don't have direct artist reference
        title: 'New bid on your artwork',
        message: `A new bid of $${amount.toLocaleString()} was placed on an auction.`,
        type: 'bid',
        relatedId: auction._id,
      });
      
      // In a real app, you would emit a Socket.IO event here
      // For now, we'll just log it
      console.log('Emitting Socket.IO event for new bid');
      
      return NextResponse.json(newBid);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to place bid' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing bid:', error);
    return NextResponse.json(
      { error: 'Failed to process bid' },
      { status: 500 }
    );
  }
} 