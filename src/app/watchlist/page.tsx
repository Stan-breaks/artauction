'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

interface WatchedArtwork {
  id: string
  title: string
  imageUrl: string
  currentPrice: number
  endDate: string
  artist: {
    name: string
  }
}

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<WatchedArtwork[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await fetch('/api/user/watchlist')
        if (response.ok) {
          const data = await response.json()
          setWatchlist(data.watchlist)
        }
      } catch (error) {
        console.error('Error fetching watchlist:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWatchlist()
  }, [])

  const removeFromWatchlist = async (artworkId: string) => {
    try {
      const response = await fetch(`/api/user/watchlist/${artworkId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setWatchlist(current => current.filter(item => item.id !== artworkId))
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <ProtectedRoute roles={['USER']}>
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlist.map((artwork) => (
            <Card key={artwork.id} className="overflow-hidden">
              <Link href={`/artworks/${artwork.id}`}>
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="p-6">
                <Link 
                  href={`/artworks/${artwork.id}`}
                  className="text-xl font-semibold hover:text-primary"
                >
                  {artwork.title}
                </Link>
                <p className="text-gray-600 mt-1">by {artwork.artist.name}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Price:</span>
                    <span className="font-semibold">
                      ${artwork.currentPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ends:</span>
                    <span className="font-semibold">
                      {new Date(artwork.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => removeFromWatchlist(artwork.id)}
                    >
                      Remove from Watchlist
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {watchlist.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600">Your watchlist is empty.</p>
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