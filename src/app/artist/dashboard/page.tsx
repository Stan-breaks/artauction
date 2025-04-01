'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

interface ArtworkStats {
  totalArtworks: number
  activeAuctions: number
  totalBids: number
  totalSales: number
}

interface RecentBid {
  id: string
  artworkTitle: string
  amount: number
  bidderName: string
  createdAt: string
}

export default function ArtistDashboard() {
  const [stats, setStats] = useState<ArtworkStats>({
    totalArtworks: 0,
    activeAuctions: 0,
    totalBids: 0,
    totalSales: 0
  })
  const [recentBids, setRecentBids] = useState<RecentBid[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, bidsResponse] = await Promise.all([
          fetch('/api/artist/stats'),
          fetch('/api/artist/recent-bids')
        ])

        if (statsResponse.ok && bidsResponse.ok) {
          const [statsData, bidsData] = await Promise.all([
            statsResponse.json(),
            bidsResponse.json()
          ])

          setStats(statsData)
          setRecentBids(bidsData.bids)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <ProtectedRoute roles={['ARTIST']}>
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Artist Dashboard</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Total Artworks</h3>
            <p className="text-3xl font-bold">{stats.totalArtworks}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Active Auctions</h3>
            <p className="text-3xl font-bold">{stats.activeAuctions}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Total Bids</h3>
            <p className="text-3xl font-bold">{stats.totalBids}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Total Sales</h3>
            <p className="text-3xl font-bold">${stats.totalSales.toLocaleString()}</p>
          </Card>
        </div>

        {/* Recent Bids */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Bids</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Artwork</th>
                    <th className="text-left py-3">Bidder</th>
                    <th className="text-left py-3">Amount</th>
                    <th className="text-left py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBids.map((bid) => (
                    <tr key={bid.id} className="border-b">
                      <td className="py-3">{bid.artworkTitle}</td>
                      <td className="py-3">{bid.bidderName}</td>
                      <td className="py-3">${bid.amount.toLocaleString()}</td>
                      <td className="py-3">
                        {new Date(bid.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 