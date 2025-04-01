import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';

// GET /api/artworks - Get all artworks or filter by query
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get('artistId');
    const query = searchParams.get('query');
    const medium = searchParams.get('medium');
    const status = searchParams.get('status');

    const client = await clientPromise;
    const db = client.db();

    let filter: any = {};
    if (artistId) filter.artistId = new ObjectId(artistId);
    if (medium) filter.medium = medium;
    if (status) filter.status = status;
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    const artworks = await db
      .collection('artworks')
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'artistId',
            foreignField: '_id',
            as: 'artist',
          },
        },
        { $unwind: '$artist' },
        {
          $project: {
            'artist.password': 0,
          },
        },
      ])
      .toArray();

    return NextResponse.json(artworks);
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/artworks - Create a new artwork
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({
      email: session.user.email,
    });

    if (!user || user.role !== 'ARTIST') {
      return NextResponse.json(
        { error: 'Only artists can create artworks' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const artwork = {
      ...data,
      artistId: new ObjectId(user._id),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'DRAFT',
    };

    const result = await db.collection('artworks').insertOne(artwork);
    const createdArtwork = await db
      .collection('artworks')
      .findOne({ _id: result.insertedId });

    return NextResponse.json(createdArtwork);
  } catch (error) {
    console.error('Error creating artwork:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 