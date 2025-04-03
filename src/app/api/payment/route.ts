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

    const { auctionId, artworkId } = await request.json();
    
    const client = await clientPromise;
    const db = client.db();

    let auction;

    // If auctionId is provided, use it directly
    if (auctionId) {
      auction = await db
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
    }
    // If artworkId is provided, find the associated auction
    else if (artworkId) {
      // Find the artwork first
      const artwork = await db.collection('artworks').findOne({
        _id: new ObjectId(artworkId)
      });
      
      if (!artwork) {
        return NextResponse.json(
          { error: 'Artwork not found' },
          { status: 404 }
        );
      }
      
      // Find the auction for this artwork
      auction = await db
        .collection('auctions')
        .aggregate([
          { $match: { artworkId: artwork._id } },
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
    }
    else {
      return NextResponse.json(
        { error: 'Either auctionId or artworkId is required' },
        { status: 400 }
      );
    }

    if (!auction || auction.length === 0) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      );
    }

    const auctionData = auction[0];
    const { artwork, currentPrice } = auctionData;
    const actualAuctionId = auctionData._id.toString();

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
      success_url: `${process.env.NEXTAUTH_URL}/auctions/${actualAuctionId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/auctions/${actualAuctionId}`,
      metadata: {
        auctionId: actualAuctionId,
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