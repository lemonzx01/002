/**
 * ============================================================
 * Booking Detail API - ดูการจองตาม Booking Code
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode, requireAdmin } from '@/lib/auth'
import { mockDataStore, findMockHotel, findMockCar, findMockBookingByCode } from '@/lib/mock-data'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PAID', 'CANCELLED', 'COMPLETED']).optional(),
  special_requests: z.string().optional(),
  cancellation_reason: z.string().optional(),
  cancelled_by: z.string().optional()
})

/**
 * GET /api/bookings/[code] - ดูการจองตาม Booking Code
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  
  // Mock Mode
  if (isMockMode()) {
    const booking = findMockBookingByCode(code)
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    // Add hotel/car details
    const bookingWithDetails: Record<string, unknown> = { ...booking }
    if (booking.hotel_id) {
      bookingWithDetails.hotel = findMockHotel(booking.hotel_id)
    }
    if (booking.car_id) {
      bookingWithDetails.car = findMockCar(booking.car_id)
    }
    
    return NextResponse.json({ booking: bookingWithDetails })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('*, hotels(*), cars(*)')
      .eq('booking_code', code)
      .single()
    
    if (error) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    return NextResponse.json({ booking: data })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/bookings/[code] - แก้ไขการจอง (Admin หรือ User ที่จอง)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  
  try {
    const body = await request.json()
    const validatedData = updateSchema.parse(body)
    
    // Mock Mode
    if (isMockMode()) {
      const booking = findMockBookingByCode(code)
      
      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }
      
      const index = mockDataStore.bookings.findIndex(b => b.booking_code === code)
      const updatedBooking = {
        ...mockDataStore.bookings[index],
        ...validatedData,
        updated_at: new Date().toISOString()
      }
      
      // Handle cancellation
      if (validatedData.status === 'CANCELLED') {
        updatedBooking.cancelled_at = new Date().toISOString()
        updatedBooking.cancellation_reason = validatedData.cancellation_reason
        updatedBooking.cancelled_by = validatedData.cancelled_by || 'customer'
        updatedBooking.refund_status = 'PENDING'
        updatedBooking.refund_percentage = 0 // Could implement policy
      }
      
      mockDataStore.bookings[index] = updatedBooking
      
      // Add hotel/car details
      const bookingWithDetails: Record<string, unknown> = { ...updatedBooking }
      if (updatedBooking.hotel_id) {
        bookingWithDetails.hotel = findMockHotel(updatedBooking.hotel_id)
      }
      if (updatedBooking.car_id) {
        bookingWithDetails.car = findMockCar(updatedBooking.car_id)
      }
      
      return NextResponse.json({ booking: bookingWithDetails })
    }
    
    // Real Supabase Mode
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('bookings')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
        ...(validatedData.status === 'CANCELLED' && {
          cancelled_at: new Date().toISOString()
        })
      })
      .eq('booking_code', code)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ booking: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
