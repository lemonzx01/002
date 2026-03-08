/**
 * ============================================================
 * Dashboard Stats API - สถิติสำหรับ Admin Dashboard
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode, requireAdmin } from '@/lib/auth'
import { mockDataStore } from '@/lib/mock-data'

/**
 * GET /api/admin/dashboard/stats - สถิติสำหรับ Dashboard
 */
export async function GET(request: Request) {
  // Check admin auth
  const authError = await requireAdmin()
  if (authError) return authError
  
  // Mock Mode
  if (isMockMode()) {
    const bookings = mockDataStore.bookings
    const payments = mockDataStore.payments
    const hotels = mockDataStore.hotels
    const cars = mockDataStore.cars
    
    // Calculate stats
    const totalRevenue = payments
      .filter(p => p.status === 'SUCCEEDED')
      .reduce((sum, p) => sum + (p.amount / 100), 0)
    
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length
    const paidBookings = bookings.filter(b => b.status === 'PAID').length
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length
    
    // Monthly revenue (mock - last 6 months)
    const monthlyRevenue = [
      { month: '2026-02', revenue: 125000, bookings: 15 },
      { month: '2026-01', revenue: 98000, bookings: 12 },
      { month: '2025-12', revenue: 156000, bookings: 18 },
      { month: '2025-11', revenue: 87000, bookings: 10 },
      { month: '2025-10', revenue: 112000, bookings: 14 },
      { month: '2025-09', revenue: 95000, bookings: 11 }
    ]
    
    // Top hotels
    const topHotels = hotels.slice(0, 5).map(h => ({
      id: h.id,
      name: h.name_th,
      bookings: Math.floor(Math.random() * 20) + 5,
      revenue: Math.floor(Math.random() * 100000) + 20000
    }))
    
    // Top cars
    const topCars = cars.slice(0, 5).map(c => ({
      id: c.id,
      name: c.name_th,
      bookings: Math.floor(Math.random() * 15) + 3,
      revenue: Math.floor(Math.random() * 80000) + 15000
    }))
    
    // Recent bookings
    const recentBookings = bookings
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(b => ({
        id: b.id,
        booking_code: b.booking_code,
        customer_name: b.customer_name,
        booking_type: b.booking_type,
        total_price: b.total_price,
        status: b.status,
        created_at: b.created_at
      }))
    
    // Booking trends
    const bookingTrends = [
      { date: '2026-03-06', bookings: 3 },
      { date: '2026-03-05', bookings: 5 },
      { date: '2026-03-04', bookings: 2 },
      { date: '2026-03-03', bookings: 7 },
      { date: '2026-03-02', bookings: 4 },
      { date: '2026-03-01', bookings: 6 }
    ]
    
    return NextResponse.json({
      overview: {
        total_bookings: bookings.length,
        total_revenue: totalRevenue,
        pending_bookings: pendingBookings,
        confirmed_bookings: confirmedBookings,
        paid_bookings: paidBookings,
        cancelled_bookings: cancelledBookings,
        total_hotels: hotels.filter(h => h.is_active).length,
        total_cars: cars.filter(c => c.is_active).length
      },
      monthly_revenue: monthlyRevenue,
      top_hotels: topHotels,
      top_cars: topCars,
      recent_bookings: recentBookings,
      booking_trends: bookingTrends
    })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    
    // Get bookings stats
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
    
    // Get payments stats
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
    
    // Get hotels count
    const { count: hotelsCount } = await supabase
      .from('hotels')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    // Get cars count
    const { count: carsCount } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    // Calculate stats
    const totalRevenue = (payments || [])
      .filter(p => p.status === 'SUCCEEDED')
      .reduce((sum, p) => sum + (p.amount / 100), 0)
    
    const pendingBookings = (bookings || []).filter(b => b.status === 'PENDING').length
    const confirmedBookings = (bookings || []).filter(b => b.status === 'CONFIRMED').length
    const paidBookings = (bookings || []).filter(b => b.status === 'PAID').length
    const cancelledBookings = (bookings || []).filter(b => b.status === 'CANCELLED').length
    
    // Get recent bookings
    const { data: recentBookings } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    // Get top hotels by bookings
    const { data: topHotelsData } = await supabase
      .from('bookings')
      .select('hotel_id, hotels(name_th)')
      .not('hotel_id', 'is', null)
    
    const hotelBookings: Record<string, number> = {}
    ;(topHotelsData || []).forEach(b => {
      if (b.hotel_id) {
        hotelBookings[b.hotel_id] = (hotelBookings[b.hotel_id] || 0) + 1
      }
    })
    
    return NextResponse.json({
      overview: {
        total_bookings: (bookings || []).length,
        total_revenue: totalRevenue,
        pending_bookings: pendingBookings,
        confirmed_bookings: confirmedBookings,
        paid_bookings: paidBookings,
        cancelled_bookings: cancelledBookings,
        total_hotels: hotelsCount || 0,
        total_cars: carsCount || 0
      },
      recent_bookings: recentBookings || [],
      hotel_popularity: hotelBookings
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
