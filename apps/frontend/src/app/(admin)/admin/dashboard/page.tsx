/**
 * Admin Dashboard - Dashboard Page for Admin
 * Features: Stats Cards, Charts, Recent Bookings, Quick Actions
 */

import AdminSidebar from '@/components/admin/Sidebar'
import { Building2, Car, Calendar, DollarSign, ArrowRight, TrendingUp, TrendingDown, Users, Clock } from 'lucide-react'
import { formatCurrency } from '@chiangrai/shared/utils'
import Link from 'next/link'
import { RecentBookings } from './RecentBookings'
import { RevenueChart } from './RevenueChart'
import { BookingStatsChart } from './BookingStatsChart'

export const metadata = {
  title: 'Dashboard | Admin',
  description: 'Admin Dashboard - System Overview',
}

export default async function AdminDashboardPage() {
  // Mock data for demonstration
  const displayData = {
    stats: {
      totalHotels: 12,
      totalCars: 28,
      totalBookings: 185,
      totalRevenue: 385000,
      pendingBookings: 12,
    },
    recentBookings: [],
    monthlyRevenue: [
      { month: 'Jan', revenue: 45000 },
      { month: 'Feb', revenue: 52000 },
      { month: 'Mar', revenue: 48000 },
      { month: 'Apr', revenue: 61000 },
      { month: 'May', revenue: 55000 },
      { month: 'Jun', revenue: 67000 },
    ],
    bookingByStatus: [
      { status: 'confirmed', count: 45 },
      { status: 'pending', count: 12 },
      { status: 'cancelled', count: 8 },
      { status: 'completed', count: 120 },
    ],
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">System Overview - Hotels & Car Rentals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Hotels"
            value={displayData.stats.totalHotels.toString()}
            icon={Building2}
            trend="+2"
            trendUp={true}
            color="blue"
          />
          <StatsCard
            title="Cars"
            value={displayData.stats.totalCars.toString()}
            icon={Car}
            trend="+5"
            trendUp={true}
            color="green"
          />
          <StatsCard
            title="Bookings"
            value={displayData.stats.totalBookings.toString()}
            icon={Calendar}
            trend="+18"
            trendUp={true}
            color="purple"
          />
          <StatsCard
            title="Revenue"
            value={formatCurrency(displayData.stats.totalRevenue)}
            icon={DollarSign}
            trend="+12%"
            trendUp={true}
            color="orange"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h2>
            <RevenueChart data={displayData.monthlyRevenue} />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h2>
            <BookingStatsChart data={displayData.bookingByStatus} />
          </div>
        </div>

        {/* Recent Bookings & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
              <Link href="/admin/bookings" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <RecentBookings bookings={displayData.recentBookings} />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Actions</h2>
            <div className="space-y-4">
              <QuickAction title="Pending Bookings" count={displayData.stats.pendingBookings} icon={Clock} href="/admin/bookings?status=pending" color="yellow" />
              <QuickAction title="New Cars" count={3} icon={Car} href="/admin/cars" color="green" />
              <QuickAction title="New Partners" count={2} icon={Users} href="/admin/partners" color="blue" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatsCard({ title, value, icon: Icon, trend, trendUp, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {trend}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{title}</p>
      </div>
    </div>
  )
}

function QuickAction({ title, count, icon: Icon, href, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  }

  return (
    <Link href={href} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">{count}</span>
    </Link>
  )
}
