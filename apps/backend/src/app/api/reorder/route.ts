/**
 * ============================================================
 * Reorder API - จองซ้ำง่ายๆ
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode } from '@/lib/auth'
import { mockDataStore, findMockCar, findMockHotel } from '@/lib/mock-data'

/**
 * GET /api/reorder/[booking_code] - ดูข้อมูลจองซ้ำ
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  
  // Mock Mode
  if (isMockMode()) {
    const booking = mockDataStore.bookings.find(b => b.booking_code === code)
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    // Check if can reorder (only PAID or COMPLETED)
    if (!['PAID', 'COMPLETED'].includes(booking.status as string)) {
      return NextResponse.json({ error: 'Cannot reorder this booking' }, { status: 400 })
    }
    
    // Get item details
    let itemDetails = null
    if (booking.hotel_id) {
      const hotel = findMockHotel(booking.hotel_id)
      itemDetails = {
        type: 'hotel',
        id: booking.hotel_id,
        name: hotel?.name_th,
        price: hotel?.base_price_per_night
      }
    } else if (booking.car_id) {
      const car = findMockCar(booking.car_id)
      itemDetails = {
        type: 'car',
        id: booking.car_id,
        name: car?.name_th,
        price: car?.base_price_per_day
      }
    }
    
    return NextResponse.json({
      can_reorder: true,
      original_booking: booking.booking_code,
      item: itemDetails,
      previous_dates: {
        check_in: booking.check_in_date,
        check_out: booking.check_out_date
      }
    })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, hotels(*), cars(*)')
      .eq('booking_code', code)
      .single()
    
    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    // Check if can reorder
    if (!['PAID', 'COMPLETED'].includes(booking.status)) {
      return NextResponse.json({ error: 'Cannot reorder this booking' }, { status: 400 })
    }
    
    return NextResponse.json({
      can_reorder: true,
      original_booking: booking.booking_code,
      item: booking.hotels || booking.cars,
      previous_dates: {
        check_in: booking.check_in_date,
        check_out: booking.check_out_date
      }
    })
  } catch (error) {
    console.error('Error fetching reorder data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/reorder - จองซ้ำ
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { original_code, check_in_date, check_out_date, customer_email, customer_phone, customer_name } = body
    
    // Validate required
    if (!original_code || !check_in_date || !check_out_date || !customer_email || !customer_phone || !customer_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Mock Mode
    if (isMockMode()) {
      const original = mockDataStore.bookings.find(b => b.booking_code === original_code)
      
      if (!original) {
        return NextResponse.json({ error: 'Original booking not found' }, { status: 404 })
      }
      
      // Create new booking with same details
      const newBooking = {
        id: mockDataStore.generateId('booking'),
        booking_code: mockDataStore.generateBookingCode(),
        booking_type: original.booking_type,
        hotel_id: original.hotel_id,
        car_id: original.car_id,
        check_in_date,
        check_out_date,
        number_of_guests: original.number_of_guests,
        customer_name,
        customer_email,
        customer_phone,
        total_price: original.total_price,
        currency: 'THB',
        status: 'PENDING',
        reordering_from: original_code,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      mockDataStore.bookings.push(newBooking)
      
      return NextResponse.json({ 
        booking: newBooking,
        message: 'Reorder successful'
      }, { status: 201 })
    }
    
    // Real Supabase Mode
    const supabase = await createAdminClient()
    
    // Get original booking
    const { data: original } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_code', original_code)
      .single()
    
    if (!original) {
      return NextResponse.json({ error: 'Original booking not found' }, { status: 404 })
    }
    
    // Create new booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([{
        booking_type: original.booking_type,
        hotel_id: original.hotel_id,
        car_id: original.car_id,
        check_in_date,
        check_out_date,
        number_of_guests: original.number_of_guests,
        customer_name,
        customer_email,
        customer_phone,
        reordering_from: original_code,
        status: 'PENDING'
      }])
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ 
      booking,
      message: 'Reorder successful'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating reorder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
