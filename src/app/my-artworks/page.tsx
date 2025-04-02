'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'
import Image from 'next/image'
import { Pencil, Eye, Clock, CheckCircle } from 'lucide-react'
import type { IArtwork } from '@/models/Artwork'
import { formatCurrency } from '@/utils/format'

export default function MyArtworksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [artworks, setArtworks] = useState<IArtwork[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && session?.user?.email) {
      fetchMyArtworks()
    }
  }, [status, session, router])

  const fetchMyArtworks = async () => {
    try {
      const response = await fetch('/api/artworks/my-artworks')
      if (!response.ok) {
        throw new Error('Failed to fetch artworks')
      }
      const data = await response.json()
      setArtworks(data)
    } catch (error) {
      console.error('Error fetching artworks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (artworkId: string, newStatus: string) => {
    // In a real app, this would make an API call
    setArtworks(prevArtworks => 
      prevArtworks.map(artwork => 
        artwork._id.toString() === artworkId 
          ? { ...artwork, status: newStatus as IArtwork['status'] } 
          : artwork
      )
    )
  }

  const getStatusBadgeClass = (status: IArtwork['status']) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'ENDED':
        return 'bg-blue-100 text-blue-800'
      case 'SOLD':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: IArtwork['status']) => {
    switch (status) {
      case 'DRAFT':
        return <Pencil className="h-4 w-4 mr-1" />
      case 'ACTIVE':
        return <Clock className="h-4 w-4 mr-1" />
      case 'ENDED':
        return <Eye className="h-4 w-4 mr-1" />
      case 'SOLD':
        return <CheckCircle className="h-4 w-4 mr-1" />
      default:
        return null
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              My Artworks
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {artworks.map((artwork) => (
                    <tr key={artwork._id.toString()}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {artwork.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {session?.user?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(artwork.currentPrice)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(artwork.status)}`}>
                          {getStatusIcon(artwork.status)}
                          {artwork.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => router.push(`/artworks/${artwork._id.toString()}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 