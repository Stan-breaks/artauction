import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Artwork } from '@/models/Artwork';

// GET /api/artworks - Get all artworks or filter by query
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const artworks = await Artwork.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('artist', 'name');

    const total = await Artwork.countDocuments({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    });

    return NextResponse.json({
      artworks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/artworks - Create a new artwork
export async function POST(request: Request) {
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
        { error: 'Only artists can upload artworks' },
        { status: 403 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get request body
    const body = await request.json();
    const { title, description, startingPrice, endDate, imageUrl } = body;

    // Validate required fields
    if (!title || !description || !startingPrice || !endDate || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate price
    if (startingPrice <= 0) {
      return NextResponse.json(
        { error: 'Starting price must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate end date
    const endDateTime = new Date(endDate);
    if (endDateTime <= new Date()) {
      return NextResponse.json(
        { error: 'End date must be in the future' },
        { status: 400 }
      );
    }

    // Create artwork
    const artwork = await Artwork.create({
      title,
      description,
      startingPrice,
      endDate: endDateTime,
      imageUrl,
      artist: decoded.userId,
      currentPrice: startingPrice,
      status: 'ACTIVE',
    });

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
      },
    });
  } catch (error) {
    console.error('Error creating artwork:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 