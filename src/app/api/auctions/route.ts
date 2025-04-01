import { NextRequest, NextResponse } from 'next/server';
import { getAuctionsByStatus, getAuctionWithDetails } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const id = url.searchParams.get('id');
    
    // If an ID is provided, fetch a single auction with details
    if (id) {
      const auction = await getAuctionWithDetails(id);
      
      if (!auction) {
        return NextResponse.json(
          { error: 'Auction not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(auction);
    }
    
    // Otherwise, fetch auctions based on status (or all if no status provided)
    let auctions;
    if (status && ['upcoming', 'active', 'ended', 'cancelled'].includes(status)) {
      auctions = await getAuctionsByStatus(status as any);
    } else {
      // If no status is provided or invalid status, default to active
      auctions = await getAuctionsByStatus('active');
    }
    
    return NextResponse.json(auctions);
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auctions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Implementation for creating a new auction
  // This would include authentication and validation in a real app
  try {
    const data = await req.json();
    
    // Validate required fields
    const requiredFields = ['artworkId', 'startingPrice', 'minBidIncrement', 'startDate', 'endDate'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Here you would create the auction in the database
    // For now, we'll just return a mock response
    return NextResponse.json(
      { 
        success: true,
        message: 'Auction created successfully',
        id: 'mock-auction-id'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating auction:', error);
    return NextResponse.json(
      { error: 'Failed to create auction' },
      { status: 500 }
    );
  }
} 