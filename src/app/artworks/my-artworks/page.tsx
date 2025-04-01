'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

interface Artwork {
  id: string
  title: string
  description: string
  imageUrl: string
  startingPrice: number
  currentPrice: number
  endDate: string
  status: 'DRAFT' | 'ACTIVE' | 'ENDED' | 'SOLD'
  totalBids: number
}

export default function MyArtworks() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch('/api/artist/artworks')
        if (response.ok) {
          const data = await response.json()
          setArtworks(data.artworks)
        }
      } catch (error) {
        console.error('Error fetching artworks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArtworks()
  }, [])

  const getStatusColor = (status: Artwork['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600'
      case 'ENDED':
        return 'text-red-600'
      case 'SOLD':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <ProtectedRoute roles={['ARTIST']}>
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Artworks</h1>
          <Link href="/artworks/upload">
            <Button>Upload New Artwork</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((artwork) => (
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
                <p className="text-gray-600 mt-2 line-clamp-2">{artwork.description}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting Price:</span>
                    <span className="font-semibold">
                      ${artwork.startingPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Price:</span>
                    <span className="font-semibold">
                      ${artwork.currentPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Bids:</span>
                    <span className="font-semibold">{artwork.totalBids}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-semibold">
                      {new Date(artwork.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold ${getStatusColor(artwork.status)}`}>
                      {artwork.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-x-2 flex">
                  <Link href={`/artworks/${artwork.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/artworks/${artwork.id}/bids`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Bids
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}

          {artworks.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600">You haven't uploaded any artworks yet.</p>
              <Link 
                href="/artworks/upload" 
                className="text-primary hover:text-primary/80 mt-2 inline-block"
              >
                Upload Your First Artwork
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
} 