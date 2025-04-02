'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'
import { BarChart, PieChart, CreditCard, Image, TrendingUp } from 'lucide-react'

interface ArtworkStats {
  totalArtworks: number
  activeAuctions: number
  completedAuctions: number
  totalBids: number
  totalSales: number
  averageSalePrice: number
  draftArtworks: number
  mostPopularArtwork: {
    _id: string
    title: string
    bidCount: number
    currentPrice: number
  } | null
}

interface RecentArtwork {
  _id: string
  title: string
  status: string
  currentPrice: number
  endDate: string
  bidCount: number
}

export default function ArtistDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ArtworkStats>({
    totalArtworks: 0,
    activeAuctions: 0,
    completedAuctions: 0,
    totalBids: 0,
    totalSales: 0,
    averageSalePrice: 0,
    draftArtworks: 0,
    mostPopularArtwork: null
  })
  const [recentArtworks, setRecentArtworks] = useState<RecentArtwork[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user?.role !== 'ARTIST') {
      router.push('/')
      return
    }

    // Fetch artist stats
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // Mock data for now - in a real app, this would be an API call
        setStats({
          totalArtworks: 12,
          activeAuctions: 5,
          completedAuctions: 7,
          totalBids: 34,
          totalSales: 2450,
          averageSalePrice: 350,
          draftArtworks: 2,
          mostPopularArtwork: {
            _id: '123',
            title: 'Sunset Over Mountains',
            bidCount: 8,
            currentPrice: 450
          }
        })
        
        // Mock recent artworks
        setRecentArtworks([
          {
            _id: '123',
            title: 'Sunset Over Mountains',
            status: 'ACTIVE',
            currentPrice: 450,
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            bidCount: 8
          },
          {
            _id: '456',
            title: 'Abstract Dreams',
            status: 'SOLD',
            currentPrice: 750,
            endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            bidCount: 12
          },
          {
            _id: '789',
            title: 'Urban Landscape',
            status: 'ACTIVE',
            currentPrice: 380,
            endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            bidCount: 6
          }
        ])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [session, status, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Artist Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {session?.user?.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/artworks/upload">
            <Button>Upload New Artwork</Button>
          </Link>
          <Link href="/my-artworks">
            <Button variant="outline">View All Artworks</Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Artworks</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArtworks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.draftArtworks} drafts • {stats.activeAuctions} active auctions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Auctions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAuctions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedAuctions} completed auctions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBids}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all your artworks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalSales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: ${stats.averageSalePrice.toLocaleString()} per artwork
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Popular Artwork Card */}
      {stats.mostPopularArtwork && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Most Popular Artwork</CardTitle>
            <CardDescription>Your artwork with the most bids</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium text-lg">{stats.mostPopularArtwork.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Current Price: ${stats.mostPopularArtwork.currentPrice.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-xl">{stats.mostPopularArtwork.bidCount}</p>
                <p className="text-sm text-muted-foreground">bids</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Artworks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Artworks</CardTitle>
          <CardDescription>Your recently created artworks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentArtworks.map((artwork) => (
              <div
                key={artwork._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <h3 className="font-medium">{artwork.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Status: <span className={`font-medium ${artwork.status === 'ACTIVE' ? 'text-green-600' : artwork.status === 'SOLD' ? 'text-blue-600' : ''}`}>{artwork.status}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${artwork.currentPrice.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {artwork.bidCount} bids
                  </p>
                </div>
              </div>
            ))}
            {recentArtworks.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No artworks found</p>
                <Link href="/artworks/upload">
                  <Button variant="outline" className="mt-4">Upload Your First Artwork</Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 