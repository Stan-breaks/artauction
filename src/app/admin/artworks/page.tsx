'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Link from 'next/link'

interface Artwork {
  id: string
  title: string
  imageUrl: string
  artist: {
    id: string
    name: string
  }
  startingPrice: number
  currentPrice: number
  endDate: string
  status: 'DRAFT' | 'ACTIVE' | 'ENDED' | 'SOLD'
  totalBids: number
  featured: boolean
}

export default function ManageArtworks() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [showArtworkDialog, setShowArtworkDialog] = useState(false)

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch('/api/admin/artworks')
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

  const updateArtworkStatus = async (artworkId: string, newStatus: Artwork['status']) => {
    try {
      const response = await fetch(`/api/admin/artworks/${artworkId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setArtworks(current =>
          current.map(artwork =>
            artwork.id === artworkId ? { ...artwork, status: newStatus } : artwork
          )
        )
      }
    } catch (error) {
      console.error('Error updating artwork status:', error)
    }
  }

  const toggleFeatured = async (artworkId: string) => {
    try {
      const artwork = artworks.find(a => a.id === artworkId)
      if (!artwork) return

      const response = await fetch(`/api/admin/artworks/${artworkId}/featured`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !artwork.featured }),
      })

      if (response.ok) {
        setArtworks(current =>
          current.map(a =>
            a.id === artworkId ? { ...a, featured: !a.featured } : a
          )
        )
      }
    } catch (error) {
      console.error('Error toggling featured status:', error)
    }
  }

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
    <ProtectedRoute roles={['ADMIN']}>
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Manage Artworks</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artwork
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bids
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {artworks.map((artwork) => (
                  <tr key={artwork.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={artwork.imageUrl}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">
                            {artwork.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/users/${artwork.artist.id}`}
                        className="text-primary hover:text-primary/80"
                      >
                        {artwork.artist.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${artwork.currentPrice.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Start: ${artwork.startingPrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${getStatusColor(artwork.status)}`}>
                        {artwork.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {artwork.totalBids}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant={artwork.featured ? 'default' : 'outline'}
                        onClick={() => toggleFeatured(artwork.id)}
                      >
                        {artwork.featured ? 'Featured' : 'Not Featured'}
                      </Button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        className="text-primary hover:text-primary/80"
                        onClick={() => {
                          setSelectedArtwork(artwork)
                          setShowArtworkDialog(true)
                        }}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={showArtworkDialog} onOpenChange={setShowArtworkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Artwork: {selectedArtwork?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Update Status</h4>
                <div className="flex space-x-2">
                  {(['DRAFT', 'ACTIVE', 'ENDED', 'SOLD'] as const).map((status) => (
                    <Button
                      key={status}
                      variant={selectedArtwork?.status === status ? 'default' : 'outline'}
                      onClick={() => {
                        if (selectedArtwork) {
                          updateArtworkStatus(selectedArtwork.id, status)
                        }
                      }}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex justify-between">
                <Link
                  href={`/artworks/${selectedArtwork?.id}`}
                  className="text-primary hover:text-primary/80"
                >
                  View Details
                </Link>
                <Link
                  href={`/artworks/${selectedArtwork?.id}/bids`}
                  className="text-primary hover:text-primary/80"
                >
                  View Bids
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
} 