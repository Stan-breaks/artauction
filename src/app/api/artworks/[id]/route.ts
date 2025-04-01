import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Artwork } from '@/models/Artwork';
import mongoose from 'mongoose';

// GET /api/artworks/[id] - Get artwork by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const artwork = await Artwork.findById(params.id).populate('artist', 'name');
    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      artwork: {
        id: artwork._id,
        title: artwork.title,
        description: artwork.description,
        startingPrice: artwork.startingPrice,
        currentPrice: artwork.currentPrice,
        endDate: artwork.endDate,
        imageUrl: artwork.imageUrl,
        artist: artwork.artist,
        status: artwork.status,
        createdAt: artwork.createdAt,
        updatedAt: artwork.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching artwork:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/artworks/[id] - Update artwork
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the token from cookies
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = verifyToken(token);
    if (decoded.role !== 'ARTIST') {
      return NextResponse.json(
        { error: 'Only artists can update artworks' },
        { status: 403 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find the artwork
    const artwork = await Artwork.findById(params.id);
    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }

    // Check if the user is the artist
    if (artwork.artist.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'You can only update your own artworks' },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { title, description, startingPrice, endDate, imageUrl } = body;

    // Update artwork
    artwork.title = title;
    artwork.description = description;
    artwork.startingPrice = startingPrice;
    artwork.currentPrice = startingPrice;
    artwork.endDate = endDate;
    artwork.imageUrl = imageUrl;

    await artwork.save();

    return NextResponse.json({
      artwork: {
        id: artwork._id,
        title: artwork.title,
        description: artwork.description,
        startingPrice: artwork.startingPrice,
        currentPrice: artwork.currentPrice,
        endDate: artwork.endDate,
        imageUrl: artwork.imageUrl,
        artist: artwork.artist,
        status: artwork.status,
        createdAt: artwork.createdAt,
        updatedAt: artwork.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating artwork:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    // Get the token from cookies
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = verifyToken(token);
    if (decoded.role !== 'ARTIST') {
      return NextResponse.json(
        { error: 'Only artists can delete artworks' },
        { status: 403 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find the artwork
    const artwork = await Artwork.findById(params.id);
    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }

    // Check if the user is the artist
    if (artwork.artist.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'You can only delete your own artworks' },
        { status: 403 }
      );
    }

    // Delete artwork
    await artwork.deleteOne();

    return NextResponse.json({ message: 'Artwork deleted successfully' });
  } catch (error) {
    console.error('Error deleting artwork:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 