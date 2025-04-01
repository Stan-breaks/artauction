'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number
  totalArtists: number
  totalArtworks: number
  totalBids: number
  totalRevenue: number
  activeAuctions: number
}

interface RecentActivity {
  id: string
  type: 'USER_SIGNUP' | 'ARTWORK_UPLOAD' | 'BID_PLACED' | 'AUCTION_ENDED'
  description: string
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalArtists: 0,
    totalArtworks: 0,
    totalBids: 0,
    totalRevenue: 0,
    activeAuctions: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, activityResponse] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/recent-activity')
        ])

        if (statsResponse.ok && activityResponse.ok) {
          const [statsData, activityData] = await Promise.all([
            statsResponse.json(),
            activityResponse.json()
          ])

          setStats(statsData)
          setRecentActivity(activityData.activities)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'USER_SIGNUP':
        return '👤'
      case 'ARTWORK_UPLOAD':
        return '🎨'
      case 'BID_PLACED':
        return '💰'
      case 'AUCTION_ENDED':
        return '🏁'
      default:
        return '📝'
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <ProtectedRoute roles={['ADMIN']}>
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="space-x-4">
            <Link href="/admin/users">
              <Button variant="outline">Manage Users</Button>
            </Link>
            <Link href="/admin/artworks">
              <Button variant="outline">Manage Artworks</Button>
            </Link>
            <Link href="/admin/reports">
              <Button>View Reports</Button>
            </Link>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Users</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Artists</p>
                <p className="text-2xl font-bold">{stats.totalArtists}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Artworks</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Artworks</p>
                <p className="text-2xl font-bold">{stats.totalArtworks}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Auctions</p>
                <p className="text-2xl font-bold">{stats.activeAuctions}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Bids & Revenue</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Bids</p>
                <p className="text-2xl font-bold">{stats.totalBids}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1">
                    <p className="text-gray-800">{activity.description}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  )
} 