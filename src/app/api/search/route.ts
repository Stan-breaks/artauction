import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db();

    let results: any = {};
    const searchRegex = query ? new RegExp(query, 'i') : null;

    if (type === 'all' || type === 'artworks') {
      const artworksFilter: any = {};
      if (searchRegex) {
        artworksFilter.$or = [
          { title: searchRegex },
          { description: searchRegex },
          { medium: searchRegex },
        ];
      }

      const artworks = await db
        .collection('artworks')
        .aggregate([
          { $match: artworksFilter },
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
          { $skip: skip },
          { $limit: limit },
        ])
        .toArray();

      const totalArtworks = await db
        .collection('artworks')
        .countDocuments(artworksFilter);

      results.artworks = {
        items: artworks,
        total: totalArtworks,
        pages: Math.ceil(totalArtworks / limit),
      };
    }

    if (type === 'all' || type === 'artists') {
      const artistsFilter: any = { role: 'ARTIST' };
      if (searchRegex) {
        artistsFilter.$or = [
          { name: searchRegex },
          { bio: searchRegex },
        ];
      }

      const artists = await db
        .collection('users')
        .find(artistsFilter, { projection: { password: 0 } })
        .skip(skip)
        .limit(limit)
        .toArray();

      const totalArtists = await db
        .collection('users')
        .countDocuments(artistsFilter);

      results.artists = {
        items: artists,
        total: totalArtists,
        pages: Math.ceil(totalArtists / limit),
      };
    }

    if (type === 'all' || type === 'auctions') {
      const auctionsFilter: any = {};
      if (searchRegex) {
        auctionsFilter.$or = [
          { status: searchRegex },
          { 'artwork.title': searchRegex },
          { 'artist.name': searchRegex },
        ];
      }

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
            $lookup: {
              from: 'users',
              localField: 'artwork.artistId',
              foreignField: '_id',
              as: 'artist',
            },
          },
          { $unwind: '$artist' },
          { $match: auctionsFilter },
          {
            $project: {
              'artist.password': 0,
            },
          },
          { $skip: skip },
          { $limit: limit },
        ])
        .toArray();

      const totalAuctions = await db
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
            $lookup: {
              from: 'users',
              localField: 'artwork.artistId',
              foreignField: '_id',
              as: 'artist',
            },
          },
          { $unwind: '$artist' },
          { $match: auctionsFilter },
          { $count: 'total' },
        ])
        .toArray();

      results.auctions = {
        items: auctions,
        total: totalAuctions[0]?.total || 0,
        pages: Math.ceil((totalAuctions[0]?.total || 0) / limit),
      };
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 