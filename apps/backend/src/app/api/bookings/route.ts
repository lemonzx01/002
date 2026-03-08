/**
 * ============================================================
 * Bookings API - จัดการข้อมูลการจอง
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode, requireAuth } from '@/lib/auth'
import { mockDataStore, findMockHotel, findMockCar, findMockBookingByCode } from '@/lib/mock-data'
import { z } from 'zod'

// Validation Schema for Booking
const bookingSchema = z.object({
  booking_type: z.enum(['HOTEL', 'CAR', 'COMBO']),
  hotel_id: z.string().optional(),
  car_id: z.string().optional(),
  room_type_id: z.string().optional(),
  check_in_date: z.string(),
  check_out_date: z.string(),
  number_of_guests: z.number().min(1),
  customer_name: z.string().min(1),
  customer_email: z.string().email(),
  customer_phone: z.string().min(1),
  customer_line: z.string().optional(),
  special_requests: z.string().optional(),
  // Car options
  car_options: z.array(z.object({
    option_id: z.string(),
    quantity: z.number().min(1).optional()
  })).optional(),
  // Coupon
  coupon_code: z.string().optional()
})

/**
 * GET /api/bookings - ดูรายการการจอง (Admin หรือ User ที่จอง)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  
  // Mock Mode
  if (isMockMode()) {
    let bookings = [...mockDataStore.bookings]
    
    if (status) {
      bookings = bookings.filter(b => b.status === status)
    }
    if (type) {
      bookings = bookings.filter(b => b.booking_type === type)
    }
    
    // Add hotel/car info
    const bookingsWithDetails = bookings.map(b => {
      const booking: Record<string, unknown> = { ...b }
      if (b.hotel_id) {
        booking.hotel = findMockHotel(b.hotel_id)
      }
      if (b.car_id) {
        booking.car = findMockCar(b.car_id)
      }
      return booking
    })
    
    return NextResponse.json({ bookings: bookingsWithDetails, total: bookingsWithDetails.length })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    let query = supabase.from('bookings').select('*, hotels(*), cars(*)')
    
    if (status) {
      query = query.eq('status', status)
    }
    if (type) {
      query = query.eq('booking_type', type)
    }
    
    const { data: bookings, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ bookings, total: bookings?.length || 0 })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/bookings - สร้างการจองใหม่
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = bookingSchema.parse(body)
    
    // Calculate total price
    let total_price = 0
    
    if (validatedData.booking_type === 'HOTEL' && validatedData.hotel_id) {
      const hotel = isMockMode() 
        ? findMockHotel(validatedData.hotel_id)
        : null
      
      if (hotel) {
        const checkIn = new Date(validatedData.check_in_date)
        const checkOut = new Date(validatedData.check_out_date)
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        total_price = (hotel.base_price_per_night || hotel.price_per_night) * nights
      }
    }
    
    if (validatedData.booking_type === 'CAR' && validatedData.car_id) {
      const car = isMockMode()
        ? findMockCar(validatedData.car_id)
        : null
      
      if (car) {
        const checkIn = new Date(validatedData.check_in_date)
        const checkOut = new Date(validatedData.check_out_date)
        const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        let carPrice = (car.base_price_per_day || car.price_per_day) * days
        
        // Add car options
        if (validatedData.car_options && validatedData.car_options.length > 0) {
          const { mockCarOptions } = await import('@/lib/mock-data')
          const { default: mockData } = mockDataStore
          
          for (const opt of validatedData.car_options) {
            const option = mockData.carOptions?.find((o: Record<string, unknown>) => o.id === opt.option_id)
            if (option) {
              if (option.price_type === 'per_day') {
                carPrice += (option.price as number) * days * (opt.quantity || 1)
              } else {
                carPrice += (option.price as number) * (opt.quantity || 1)
              }
            }
          }
        }
        
        total_price += carPrice
      }
    }
    
    if (validatedData.booking_type === 'COMBO') {
      // Calculate both
      if (validatedData.hotel_id) {
        const hotel = isMockMode() 
          ? findMockHotel(validatedData.hotel_id)
          : null
        if (hotel) {
          const checkIn = new Date(validatedData.check_in_date)
          const checkOut = new Date(validatedData.check_out_date)
          const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
          total_price += (hotel.base_price_per_night || hotel.price_per_night) * nights
        }
      }
      if (validatedData.car_id) {
        const car = isMockMode()
          ? findMockCar(validatedData.car_id)
          : null
        if (car) {
          const checkIn = new Date(validatedData.check_in_date)
          const checkOut = new Date(validatedData.check_out_date)
          const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
          total_price += (car.base_price_per_day || car.price_per_day) * days
        }
      }
    }
    
    // Mock Mode
    if (isMockMode()) {
      const newBooking = {
        id: mockDataStore.generateId('booking'),
        booking_code: mockDataStore.generateBookingCode(),
        ...validatedData,
        total_price,
        currency: 'THB',
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      mockDataStore.bookings.push(newBooking)
      return NextResponse.json({ booking: newBooking }, { status: 201 })
    }
    
    // Real Supabase Mode
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        ...validatedData,
        booking_code: `TE${Date.now()}`,
        total_price,
        currency: 'THB',
        status: 'PENDING'
      }])
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ booking: data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
