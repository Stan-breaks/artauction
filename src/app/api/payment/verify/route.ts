import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Stripe from 'stripe';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the Stripe session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!stripeSession) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      );
    }

    // Check if the payment was successful
    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Retrieve the transaction from the database
    const client = await clientPromise;
    const db = client.db();

    const transaction = await db.collection('transactions').findOne({
      stripeSessionId: sessionId
    });

    if (!transaction) {
      // If transaction is not found, get the data from the Stripe session metadata
      // This might happen if the webhook hasn't processed the payment yet
      const { auctionId } = stripeSession.metadata || {};
      
      if (!auctionId) {
        return NextResponse.json(
          { error: 'Transaction not found' },
          { status: 404 }
        );
      }

      // Get auction and artwork details
      const auction = await db
        .collection('auctions')
        .aggregate([
          { $match: { _id: new ObjectId(auctionId) } },
          {
            $lookup: {
              from: 'artworks',
              localField: 'artworkId',
              foreignField: '_id',
              as: 'artwork',
            },
          },
          { $unwind: '$artwork' },
        ])
        .toArray();

      if (!auction[0]) {
        return NextResponse.json(
          { error: 'Auction not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        amount: (stripeSession.amount_total || 0) / 100,
        currency: stripeSession.currency?.toUpperCase() || 'KES',
        artworkTitle: auction[0].artwork.title,
        timestamp: new Date().toISOString(),
        status: 'PAID',
        id: sessionId
      });
    }

    // Return transaction details
    return NextResponse.json({
      success: true,
      amount: transaction.amount,
      currency: 'KES',
      timestamp: transaction.createdAt,
      status: transaction.status,
      id: transaction._id.toString()
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 