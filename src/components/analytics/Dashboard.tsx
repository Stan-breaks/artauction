import { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { BarChart3, PieChart, TrendingUp, Users, Palette, DollarSign } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

type AnalyticsDashboardProps = {
  userId?: string;
  isAdmin?: boolean;
};

export default function AnalyticsDashboard({ userId, isAdmin = false }: AnalyticsDashboardProps) {
  const [auctionStats, setAuctionStats] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [artistStats, setArtistStats] = useState<any>(null);
  const [saleHistoryData, setSaleHistoryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch general auction analytics (available for admin)
        if (isAdmin) {
          const auctionResponse = await fetch('/api/analytics/auctions');
          const auctionData = await auctionResponse.json();
          setAuctionStats(auctionData);
          
          // Fetch sale history for charts
          const historyResponse = await fetch('/api/analytics/sales-history');
          const historyData = await historyResponse.json();
          setSaleHistoryData(historyData);
        }
        
        // Fetch user-specific analytics
        if (userId) {
          if (isAdmin) {
            // Fetch overall user stats for admins
            const usersResponse = await fetch('/api/analytics/users');
            const usersData = await usersResponse.json();
            setUserStats(usersData);
            
            // Fetch overall artist stats for admins
            const artistsResponse = await fetch('/api/analytics/artists');
            const artistsData = await artistsResponse.json();
            setArtistStats(artistsData);
          } else {
            // Fetch personal user stats for regular users
            const userResponse = await fetch(`/api/analytics/users/${userId}`);
            const userData = await userResponse.json();
            setUserStats(userData);
          }
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [userId, isAdmin]);
  
  // Sale History Chart Data
  const saleHistoryChartData = {
    labels: saleHistoryData?.labels || [],
    datasets: [
      {
        label: 'Sales Volume',
        data: saleHistoryData?.salesData || [],
        backgroundColor: 'rgba(37, 99, 235, 0.5)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 2,
        tension: 0.3,
      }
    ]
  };
  
  // Auction Status Distribution Chart Data
  const auctionStatusData = {
    labels: ['Active', 'Upcoming', 'Ended', 'Cancelled'],
    datasets: [
      {
        data: auctionStats ? [
          auctionStats.activeAuctions,
          auctionStats.upcomingAuctions || 0,
          auctionStats.completedAuctions,
          auctionStats.cancelledAuctions || 0
        ] : [0, 0, 0, 0],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // Blue for active
          'rgba(16, 185, 129, 0.8)', // Green for upcoming
          'rgba(249, 115, 22, 0.8)', // Orange for ended
          'rgba(239, 68, 68, 0.8)'   // Red for cancelled
        ],
        borderWidth: 1,
      }
    ]
  };
  
  // User Activity Chart Data (Admin view)
  const userActivityData = {
    labels: userStats?.activityLabels || [],
    datasets: [
      {
        label: 'New Users',
        data: userStats?.newUsersData || [],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
      },
      {
        label: 'Active Bidders',
        data: userStats?.activeBiddersData || [],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
      }
    ]
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>
      
      {/* Tab Navigation */}
      <div className="flex flex-wrap mb-6 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Overview
        </button>
        
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'sales'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Sales History
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'users'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              User Activity
            </button>
          </>
        )}
        
        {!isAdmin && (
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'personal'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            My Activity
          </button>
        )}
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Auctions */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium opacity-80">Total Auctions</p>
                  <p className="text-2xl font-bold mt-1">
                    {isAdmin ? auctionStats?.totalAuctions.toLocaleString() : userStats?.participatedAuctions || 0}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 opacity-80" />
              </div>
            </div>
            
            {/* Active Auctions */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium opacity-80">
                    {isAdmin ? 'Active Auctions' : 'Active Bids'}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {isAdmin ? auctionStats?.activeAuctions : userStats?.activeBids || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 opacity-80" />
              </div>
            </div>
            
            {/* Total Sales / Bids Placed */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium opacity-80">
                    {isAdmin ? 'Total Sales' : 'Bids Placed'}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {isAdmin 
                      ? `$${auctionStats?.totalSales.toLocaleString()}` 
                      : userStats?.bidsPlaced || 0}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 opacity-80" />
              </div>
            </div>
            
            {/* Artworks / Won Auctions */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium opacity-80">
                    {isAdmin ? 'Total Artworks' : 'Won Auctions'}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {isAdmin ? artistStats?.totalArtworks || 0 : userStats?.wonAuctions || 0}
                  </p>
                </div>
                <Palette className="h-8 w-8 opacity-80" />
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isAdmin ? (
              <>
                {/* Auction Status Distribution Chart (Admin) */}
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Auction Status Distribution</h3>
                  <div className="h-64">
                    <Doughnut 
                      data={auctionStatusData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
                
                {/* Top Performing Artists (Admin) */}
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Top Performing Artists</h3>
                  <div className="space-y-4">
                    {artistStats?.topArtists?.slice(0, 5).map((artist: any, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{artist.name}</span>
                            <span className="text-sm font-semibold">${artist.totalSales.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${(artist.totalSales / artistStats.topArtists[0].totalSales) * 100}%` }} 
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(!artistStats?.topArtists || artistStats.topArtists.length === 0) && (
                      <p className="text-gray-500 text-center py-4">No artist data available</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Personal Stats (Regular User) */}
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm col-span-1 lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">Your Auction Activity</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Total Bids</p>
                      <p className="text-2xl font-bold">{userStats?.bidsPlaced || 0}</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Won Auctions</p>
                      <p className="text-2xl font-bold">{userStats?.wonAuctions || 0}</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Active Bids</p>
                      <p className="text-2xl font-bold">{userStats?.activeBids || 0}</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                      <p className="text-2xl font-bold">${userStats?.totalSpent?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Sales History Tab (Admin only) */}
      {activeTab === 'sales' && isAdmin && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Sales History</h3>
          <div className="h-80">
            <Line 
              data={saleHistoryChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Monthly Sales Volume'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Sales Amount ($)'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Month'
                    }
                  }
                }
              }} 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Average Sale Price</h4>
              <p className="text-2xl font-bold">${auctionStats?.avgSalePrice.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Highest Sale</h4>
              <p className="text-2xl font-bold">${auctionStats?.highestSale.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Completed Auctions</h4>
              <p className="text-2xl font-bold">{auctionStats?.completedAuctions.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* User Activity Tab (Admin only) */}
      {activeTab === 'users' && isAdmin && (
        <div>
          <h3 className="text-lg font-semibold mb-4">User Activity</h3>
          <div className="h-80 mb-6">
            <Bar 
              data={userActivityData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'User Growth & Activity'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Users'
                    }
                  }
                }
              }} 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Total Users</h4>
              <p className="text-2xl font-bold">{userStats?.totalUsers || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Active Users</h4>
              <p className="text-2xl font-bold">{userStats?.activeUsers || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Artists</h4>
              <p className="text-2xl font-bold">{userStats?.artistCount || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-1">New This Month</h4>
              <p className="text-2xl font-bold">{userStats?.newThisMonth || 0}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Personal Activity Tab (Regular User only) */}
      {activeTab === 'personal' && !isAdmin && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Recent Activity</h3>
          
          {/* Recent Bids */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Recent Bids</h4>
            {userStats?.recentBids && userStats.recentBids.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Artwork</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                    {userStats.recentBids.map((bid: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{bid.artwork}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">${bid.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(bid.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            bid.status === 'highest' 
                              ? 'bg-green-100 text-green-800' 
                              : bid.status === 'outbid' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {bid.status === 'highest' ? 'Highest Bid' : bid.status === 'outbid' ? 'Outbid' : bid.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 py-4 text-center">No recent bids found</p>
            )}
          </div>
          
          {/* Won Auctions */}
          <div>
            <h4 className="font-medium mb-2">Won Auctions</h4>
            {userStats?.wonAuctionsDetails && userStats.wonAuctionsDetails.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userStats.wonAuctionsDetails.map((auction: any, index: number) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h5 className="font-semibold">{auction.artwork}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">by {auction.artist}</p>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-500">Final Price:</span>
                      <span className="font-medium">${auction.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Date:</span>
                      <span className="text-sm">{new Date(auction.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 py-4 text-center">You haven't won any auctions yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 