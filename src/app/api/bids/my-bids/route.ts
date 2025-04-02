import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { Bid } from '@/models/Bid';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'USER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get all bids by the user with populated artwork information
    const bids = await Bid.find({ bidder: session.user.id })
      .populate('artwork', 'title description imageUrl currentPrice endDate status')
      .sort({ createdAt: -1 });

    return NextResponse.json({ bids });
  } catch (error) {
    console.error('Error fetching user bids:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 