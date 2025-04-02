import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToDatabase } from '@/lib/db'
import { Artwork } from '@/models/Artwork'
import { Bid } from '@/models/Bid'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ARTIST') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    // Get total artworks
    const totalArtworks = await Artwork.countDocuments({
      artist: session.user.id
    })

    // Get active auctions
    const activeAuctions = await Artwork.countDocuments({
      artist: session.user.id,
      status: 'ACTIVE'
    })

    // Get completed auctions
    const completedAuctions = await Artwork.countDocuments({
      artist: session.user.id,
      status: { $in: ['SOLD', 'ENDED'] }
    })

    // Get total bids on artist's artworks
    const artworkIds = await Artwork.find({
      artist: session.user.id
    }).select('_id')
    
    const totalBids = await Bid.countDocuments({
      artwork: { $in: artworkIds.map(a => a._id) }
    })

    // Get total sales and average sale price
    const soldArtworks = await Artwork.find({
      artist: session.user.id,
      status: 'SOLD'
    })

    const totalSales = soldArtworks.reduce((sum, artwork) => sum + artwork.currentPrice, 0)
    const averageSalePrice = soldArtworks.length > 0 ? totalSales / soldArtworks.length : 0

    // Get draft artworks count
    const draftArtworks = await Artwork.countDocuments({
      artist: session.user.id,
      status: 'DRAFT'
    })

    // Get most popular artwork (most bids)
    const popularArtworks = await Artwork.aggregate([
      { $match: { artist: session.user.id } },
      {
        $lookup: {
          from: 'bids',
          localField: '_id',
          foreignField: 'artwork',
          as: 'bids'
        }
      },
      { $addFields: { bidCount: { $size: '$bids' } } },
      { $sort: { bidCount: -1 } },
      { $limit: 1 },
      { $project: { title: 1, bidCount: 1, currentPrice: 1 } }
    ])

    return NextResponse.json({
      totalArtworks,
      activeAuctions,
      completedAuctions,
      totalBids,
      totalSales,
      averageSalePrice,
      draftArtworks,
      mostPopularArtwork: popularArtworks[0] || null
    })
  } catch (error) {
    console.error('Error fetching artist stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 