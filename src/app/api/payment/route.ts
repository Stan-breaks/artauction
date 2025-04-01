import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Stripe from 'stripe';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { auctionId } = await request.json();
    
    const client = await clientPromise;
    const db = client.db();

    // Get auction details
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

    const { artwork, currentPrice } = auction[0];

    // Create Stripe payment session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'kes',
            product_data: {
              name: artwork.title,
              description: artwork.description,
              images: [artwork.imageUrl],
            },
            unit_amount: currentPrice * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/auctions/${auctionId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/auctions/${auctionId}`,
      metadata: {
        auctionId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ sessionId: stripeSession.id });
  } catch (error) {
    console.error('Error creating payment session:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 