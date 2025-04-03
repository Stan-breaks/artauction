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
    console.log('Payment request received with:', { auctionId, artworkId });
    
    const client = await clientPromise;
    const db = client.db();

    let auction;

    // If auctionId is provided, use it directly
    if (auctionId) {
      console.log('Searching for auction by auctionId:', auctionId);
      try {
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
        console.log('Found auction by ID:', auction);
      } catch (error) {
        console.error('Error finding auction by ID:', error);
        return NextResponse.json(
          { error: 'Error finding auction by ID' },
          { status: 500 }
        );
      }
    }
    // If artworkId is provided, find the associated auction
    else if (artworkId) {
      console.log('Searching for artwork by artworkId:', artworkId);
      try {
        // Find the artwork first
        const artwork = await db.collection('artworks').findOne({
          _id: new ObjectId(artworkId)
        });
        
        console.log('Found artwork:', artwork);
        
        if (!artwork) {
          return NextResponse.json(
            { error: 'Artwork not found' },
            { status: 404 }
          );
        }
        
        // Get all auctions to debug
        console.log('Searching for auction with artworkId:', artwork._id);
        const allAuctions = await db.collection('auctions').find({}).toArray();
        console.log('All auctions in DB:', allAuctions.map(a => ({ 
          _id: a._id, 
          artworkId: a.artworkId,
          status: a.status 
        })));
        
        // Find the auction for this artwork - use string comparison for safety
        auction = await db
          .collection('auctions')
          .find({})
          .toArray();
          
        // Filter the auctions manually to see if any match this artwork
        auction = auction.filter(a => {
          const auctionArtworkId = a.artworkId ? a.artworkId.toString() : null;
          const targetArtworkId = artwork._id ? artwork._id.toString() : null;
          console.log('Comparing:', { auctionArtworkId, targetArtworkId });
          return auctionArtworkId === targetArtworkId;
        });
        
        console.log('Matched auctions:', auction);
      } catch (error) {
        console.error('Error finding auction by artwork ID:', error);
        return NextResponse.json(
          { error: 'Error finding auction by artwork ID' },
          { status: 500 }
        );
      }
    }
    else {
      return NextResponse.json(
        { error: 'Either auctionId or artworkId is required' },
        { status: 400 }
      );
    }

    if (!auction || auction.length === 0) {
      console.log('No auction found for the provided IDs');
      return NextResponse.json(
        { error: 'No auction found for this artwork' },
        { status: 404 }
      );
    }

    const auctionData = auction[0];
    console.log('Using auction:', auctionData);
    
    // If the auction doesn't have the artwork data directly, populate it
    let artworkData;
    if (auctionData.artwork) {
      artworkData = auctionData.artwork;
    } else {
      // Lookup the artwork
      artworkData = await db.collection('artworks').findOne({
        _id: auctionData.artworkId
      });
      
      if (!artworkData) {
        return NextResponse.json(
          { error: 'Artwork data not found' },
          { status: 404 }
        );
      }
    }
    
    console.log('Using artwork data:', artworkData);
    
    // Get the price from the auction
    const currentPrice = auctionData.currentPrice || artworkData.currentPrice;
    const actualAuctionId = auctionData._id.toString();

    // Create Stripe payment session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'kes',
            product_data: {
              name: artworkData.title,
              description: artworkData.description || 'Artwork from auction',
              images: [artworkData.imageUrl],
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

    console.log('Stripe session created:', stripeSession.id);
    return NextResponse.json({ sessionId: stripeSession.id });
  } catch (error) {
    console.error('Error creating payment session:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 