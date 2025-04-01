import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { auctionId, userId } = session.metadata!;

      const client = await clientPromise;
      const db = client.db();

      // Update auction status
      await db.collection('auctions').updateOne(
        { _id: new ObjectId(auctionId) },
        {
          $set: {
            status: 'SOLD',
            soldAt: new Date(),
            buyerId: new ObjectId(userId),
          },
        }
      );

      // Create transaction record
      await db.collection('transactions').insertOne({
        auctionId: new ObjectId(auctionId),
        userId: new ObjectId(userId),
        amount: session.amount_total! / 100, // Convert from cents
        stripeSessionId: session.id,
        status: 'COMPLETED',
        createdAt: new Date(),
      });

      // Create notification for the artist
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

      if (auction[0]) {
        await db.collection('notifications').insertOne({
          userId: auction[0].artwork.artistId,
          type: 'ARTWORK_SOLD',
          title: 'Artwork Sold',
          message: `Your artwork "${auction[0].artwork.title}" has been sold for KES ${session.amount_total! / 100}`,
          read: false,
          createdAt: new Date(),
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 