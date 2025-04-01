import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { Artwork } from '@/models/Artwork'
import { Bid } from '@/models/Bid'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const bids = await Bid.find({ artwork: params.id })
      .sort({ amount: -1 })
      .populate('bidder', 'name')
      .limit(10)

    return NextResponse.json({ bids })
  } catch (error) {
    console.error('Error fetching bids:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the token from cookies
    const token = cookies().get('token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify the token
    const decoded = verifyToken(token)
    if (decoded.role !== 'USER') {
      return NextResponse.json(
        { error: 'Only users can place bids' },
        { status: 403 }
      )
    }

    // Connect to database
    await connectToDatabase()

    // Find the artwork
    const artwork = await Artwork.findById(params.id)
    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }

    // Check if the artwork is active
    if (artwork.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This artwork is not available for bidding' },
        { status: 400 }
      )
    }

    // Check if the auction has ended
    if (new Date(artwork.endDate) < new Date()) {
      return NextResponse.json(
        { error: 'The auction has ended' },
        { status: 400 }
      )
    }

    // Get request body
    const body = await request.json()
    const { amount } = body

    // Validate bid amount
    if (amount <= artwork.currentPrice) {
      return NextResponse.json(
        { error: 'Bid amount must be higher than the current price' },
        { status: 400 }
      )
    }

    // Create bid
    const bid = await Bid.create({
      artwork: artwork._id,
      bidder: decoded.userId,
      amount,
    })

    // Update artwork current price
    artwork.currentPrice = amount
    await artwork.save()

    return NextResponse.json({
      bid: {
        id: bid._id,
        amount: bid.amount,
        bidder: bid.bidder,
        createdAt: bid.createdAt,
      },
    })
  } catch (error) {
    console.error('Error placing bid:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 