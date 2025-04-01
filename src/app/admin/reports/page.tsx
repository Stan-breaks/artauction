'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

interface ReportData {
  revenue: {
    total: number
    monthly: {
      month: string
      amount: number
    }[]
  }
  users: {
    total: number
    newThisMonth: number
    byRole: {
      role: string
      count: number
    }[]
  }
  artworks: {
    total: number
    active: number
    sold: number
    totalValue: number
  }
  bids: {
    total: number
    thisMonth: number
    averagePerArtwork: number
  }
}

export default function Reports() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await fetch('/api/admin/reports')
        if (response.ok) {
          const reportData = await response.json()
          setData(reportData)
        }
      } catch (error) {
        console.error('Error fetching report data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!data) {
    return <div className="p-8">Error loading report data</div>
  }

  return (
    <ProtectedRoute roles={['ADMIN']}>
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Platform Reports</h1>

        {/* Revenue Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Revenue Overview</h2>
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Total Revenue</h3>
                <p className="text-3xl font-bold text-primary">
                  ${data.revenue.total.toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Monthly Revenue</h3>
                <div className="space-y-2">
                  {data.revenue.monthly.map((month) => (
                    <div key={month.month} className="flex justify-between">
                      <span className="text-gray-600">{month.month}</span>
                      <span className="font-medium">
                        ${month.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Users Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">User Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Total Users</h3>
              <p className="text-3xl font-bold">{data.users.total}</p>
              <p className="text-sm text-gray-600 mt-2">
                +{data.users.newThisMonth} this month
              </p>
            </Card>
            <Card className="p-6 md:col-span-2">
              <h3 className="text-lg font-medium mb-4">Users by Role</h3>
              <div className="grid grid-cols-3 gap-4">
                {data.users.byRole.map((role) => (
                  <div key={role.role} className="text-center">
                    <div className="text-2xl font-bold">{role.count}</div>
                    <div className="text-sm text-gray-600">{role.role}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* Artworks Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Artwork Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Total Artworks</h3>
              <p className="text-3xl font-bold">{data.artworks.total}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Active Auctions</h3>
              <p className="text-3xl font-bold">{data.artworks.active}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Sold Artworks</h3>
              <p className="text-3xl font-bold">{data.artworks.sold}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Total Value</h3>
              <p className="text-3xl font-bold">
                ${data.artworks.totalValue.toLocaleString()}
              </p>
            </Card>
          </div>
        </section>

        {/* Bids Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Bidding Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Total Bids</h3>
              <p className="text-3xl font-bold">{data.bids.total}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Bids This Month</h3>
              <p className="text-3xl font-bold">{data.bids.thisMonth}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Average Bids per Artwork</h3>
              <p className="text-3xl font-bold">
                {data.bids.averagePerArtwork.toFixed(1)}
              </p>
            </Card>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  )
} 