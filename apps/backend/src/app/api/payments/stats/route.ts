/**
 * ============================================================
 * Payments Stats API - สถิติการชำระเงินสำหรับ Admin
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode, requireAdmin } from '@/lib/auth'
import { mockDataStore } from '@/lib/mock-data'

/**
 * GET /api/payments/stats - ดูสถิติการชำระเงิน (Admin only)
 */
export async function GET(request: Request) {
  const authError = await requireAdmin()
  if (authError) return authError
  
  // Mock Mode
  if (isMockMode()) {
    const payments = mockDataStore.payments
    const bookings = mockDataStore.bookings
    
    // Calculate stats
    const totalRevenue = payments
      .filter(p => p.status === 'SUCCEEDED')
      .reduce((sum, p) => sum + (p.amount / 100), 0)
    
    const pendingPayments = payments.filter(p => p.status === 'PENDING').length
    const succeededPayments = payments.filter(p => p.status === 'SUCCEEDED').length
    const failedPayments = payments.filter(p => p.status === 'FAILED').length
    const refundedPayments = payments.filter(p => p.status === 'REFUNDED').length
    
    const totalBookings = bookings.length
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length
    const paidBookings = bookings.filter(b => b.status === 'PAID').length
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length
    
    // Currency breakdown
    const currencyStats: Record<string, { count: number; amount: number }> = {}
    payments
      .filter(p => p.status === 'SUCCEEDED')
      .forEach(p => {
        if (!currencyStats[p.currency]) {
          currencyStats[p.currency] = { count: 0, amount: 0 }
        }
        currencyStats[p.currency].count++
        currencyStats[p.currency].amount += p.amount / 100
      })
    
    // Recent transactions
    const recentPayments = [...payments]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(p => {
        const payment: Record<string, unknown> = { ...p }
        const booking = bookings.find(b => b.id === p.booking_id)
        if (booking) {
          payment.booking_code = booking.booking_code
          payment.customer_name = booking.customer_name
        }
        return payment
      })
    
    return NextResponse.json({
      stats: {
        payments: {
          total: payments.length,
          pending: pendingPayments,
          succeeded: succeededPayments,
          failed: failedPayments,
          refunded: refundedPayments
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          paid: paidBookings,
          cancelled: cancelledBookings,
          completed: completedBookings
        },
        revenue: {
          total: totalRevenue,
          currency: 'THB',
          by_currency: currencyStats
        },
        recent_transactions: recentPayments
      }
    })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    
    // Get payments stats
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
    
    if (paymentsError) {
      return NextResponse.json({ error: paymentsError.message }, { status: 500 })
    }
    
    // Get bookings stats
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
    
    if (bookingsError) {
      return NextResponse.json({ error: bookingsError.message }, { status: 500 })
    }
    
    // Calculate stats
    const totalRevenue = (payments || [])
      .filter(p => p.status === 'SUCCEEDED')
      .reduce((sum, p) => sum + (p.amount / 100), 0)
    
    const pendingPayments = (payments || []).filter(p => p.status === 'PENDING').length
    const succeededPayments = (payments || []).filter(p => p.status === 'SUCCEEDED').length
    const failedPayments = (payments || []).filter(p => p.status === 'FAILED').length
    const refundedPayments = (payments || []).filter(p => p.status === 'REFUNDED').length
    
    const totalBookings = (bookings || []).length
    const pendingBookings = (bookings || []).filter(b => b.status === 'PENDING').length
    const confirmedBookings = (bookings || []).filter(b => b.status === 'CONFIRMED').length
    const paidBookings = (bookings || []).filter(b => b.status === 'PAID').length
    const cancelledBookings = (bookings || []).filter(b => b.status === 'CANCELLED').length
    const completedBookings = (bookings || []).filter(b => b.status === 'COMPLETED').length
    
    // Currency breakdown
    const currencyStats: Record<string, { count: number; amount: number }> = {}
    ;(payments || [])
      .filter(p => p.status === 'SUCCEEDED')
      .forEach(p => {
        if (!currencyStats[p.currency]) {
          currencyStats[p.currency] = { count: 0, amount: 0 }
        }
        currencyStats[p.currency].count++
        currencyStats[p.currency].amount += p.amount / 100
      })
    
    return NextResponse.json({
      stats: {
        payments: {
          total: (payments || []).length,
          pending: pendingPayments,
          succeeded: succeededPayments,
          failed: failedPayments,
          refunded: refundedPayments
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          paid: paidBookings,
          cancelled: cancelledBookings,
          completed: completedBookings
        },
        revenue: {
          total: totalRevenue,
          by_currency: currencyStats
        }
      }
    })
  } catch (error) {
    console.error('Error fetching payment stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
