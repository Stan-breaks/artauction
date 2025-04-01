'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

interface Bid {
  id: string
  artwork: {
    id: string
    title: string
    imageUrl: string
    currentPrice: number
    endDate: string
  }
  amount: number
  createdAt: string
  status: 'WINNING' | 'OUTBID' | 'WON' | 'LOST'
}

export default function MyBids() {
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await fetch('/api/user/bids')
        if (response.ok) {
          const data = await response.json()
          setBids(data.bids)
        }
      } catch (error) {
        console.error('Error fetching bids:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBids()
  }, [])

  const getBidStatusColor = (status: Bid['status']) => {
    switch (status) {
      case 'WINNING':
        return 'text-green-600'
      case 'OUTBID':
        return 'text-red-600'
      case 'WON':
        return 'text-green-800'
      case 'LOST':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <ProtectedRoute roles={['USER']}>
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">My Bids</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bids.map((bid) => (
            <Card key={bid.id} className="overflow-hidden">
              <Link href={`/artworks/${bid.artwork.id}`}>
                <img
                  src={bid.artwork.imageUrl}
                  alt={bid.artwork.title}
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="p-6">
                <Link 
                  href={`/artworks/${bid.artwork.id}`}
                  className="text-xl font-semibold hover:text-primary"
                >
                  {bid.artwork.title}
                </Link>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Bid:</span>
                    <span className="font-semibold">
                      ${bid.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Price:</span>
                    <span className="font-semibold">
                      ${bid.artwork.currentPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-semibold">
                      {new Date(bid.artwork.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold ${getBidStatusColor(bid.status)}`}>
                      {bid.status}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {bids.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600">You haven't placed any bids yet.</p>
              <Link 
                href="/artworks" 
                className="text-primary hover:text-primary/80 mt-2 inline-block"
              >
                Browse Artworks
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
} 