import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { hash } from 'bcryptjs';

// GET /api/users/[id] - Get user profile
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const user = await db
      .collection('users')
      .findOne(
        { _id: new ObjectId(params.id) },
        { projection: { password: 0 } }
      );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If user is an artist, get their artworks
    if (user.role === 'ARTIST') {
      const artworks = await db
        .collection('artworks')
        .find({ artistId: user._id })
        .toArray();

      const auctions = await db
        .collection('auctions')
        .aggregate([
          {
            $lookup: {
              from: 'artworks',
              localField: 'artworkId',
              foreignField: '_id',
              as: 'artwork',
            },
          },
          { $unwind: '$artwork' },
          {
            $match: {
              'artwork.artistId': user._id,
            },
          },
        ])
        .toArray();

      return NextResponse.json({
        ...user,
        artworks,
        auctions,
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update user profile
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

    const currentUser = await db.collection('users').findOne({
      email: session.user.email,
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Only allow users to update their own profile or admin to update any profile
    if (
      currentUser._id.toString() !== params.id &&
      currentUser.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    // If password is being updated, hash it
    if (data.password) {
      updateData.password = await hash(data.password, 10);
    }

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.email;
    delete updateData.role;

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'No changes made' },
        { status: 400 }
      );
    }

    const updatedUser = await db
      .collection('users')
      .findOne(
        { _id: new ObjectId(params.id) },
        { projection: { password: 0 } }
      );

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 