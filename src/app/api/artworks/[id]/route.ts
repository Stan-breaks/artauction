import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';

// GET /api/artworks/[id] - Get artwork by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const artwork = await db
      .collection('artworks')
      .aggregate([
        { $match: { _id: new ObjectId(params.id) } },
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
          $lookup: {
            from: 'auctions',
            localField: '_id',
            foreignField: 'artworkId',
            as: 'auctions',
          },
        },
        {
          $project: {
            'artist.password': 0,
          },
        },
      ])
      .toArray();

    if (!artwork[0]) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(artwork[0]);
  } catch (error) {
    console.error('Error fetching artwork:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/artworks/[id] - Update artwork
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const artwork = await db.collection('artworks').findOne({
      _id: new ObjectId(params.id),
    });

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }

    if (
      user.role !== 'ADMIN' &&
      artwork.artistId.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const result = await db.collection('artworks').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'No changes made' },
        { status: 400 }
      );
    }

    const updatedArtwork = await db
      .collection('artworks')
      .findOne({ _id: new ObjectId(params.id) });

    return NextResponse.json(updatedArtwork);
  } catch (error) {
    console.error('Error updating artwork:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/artworks/[id] - Delete artwork
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const artwork = await db.collection('artworks').findOne({
      _id: new ObjectId(params.id),
    });

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }

    if (
      user.role !== 'ADMIN' &&
      artwork.artistId.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check if artwork is in any active auctions
    const activeAuction = await db.collection('auctions').findOne({
      artworkId: new ObjectId(params.id),
      status: 'ACTIVE',
    });

    if (activeAuction) {
      return NextResponse.json(
        { error: 'Cannot delete artwork with active auction' },
        { status: 400 }
      );
    }

    await db.collection('artworks').deleteOne({
      _id: new ObjectId(params.id),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting artwork:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 