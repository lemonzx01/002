/**
 * ============================================================
 * Calendar API - ปฏิทินการจอง
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode, requireAdmin } from '@/lib/auth'
import { mockDataStore, findMockHotel, findMockCar } from '@/lib/mock-data'
import { z } from 'zod'

// Validation Schema
const calendarSchema = z.object({
  year: z.coerce.number().min(2020).max(2030),
  month: z.coerce.number().min(1).max(12).optional(),
  item_type: z.enum(['hotel', 'car', 'all']).optional(),
  item_id: z.string().optional()
})

/**
 * GET /api/calendar - ดูปฏิทินการจอง
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
  const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined
  const itemType = searchParams.get('item_type') as 'hotel' | 'car' | 'all' | null
  const itemId = searchParams.get('item_id') || null
  
  // Mock Mode
  if (isMockMode()) {
    let bookings = [...mockDataStore.bookings]
    
    // Filter by item
    if (itemType === 'hotel' || itemType === 'all') {
      // Include hotel bookings
    } else if (itemType === 'car') {
      bookings = bookings.filter(b => b.booking_type === 'CAR' || b.booking_type === 'COMBO')
    }
    
    if (itemId) {
      bookings = bookings.filter(b => b.hotel_id === itemId || b.car_id === itemId)
    }
    
    // Filter by year/month
    bookings = bookings.filter(b => {
      const checkIn = new Date(b.check_in_date)
      const checkOut = new Date(b.check_out_date)
      
      // Check if booking overlaps with requested year
      if (checkIn.getFullYear() > year || checkOut.getFullYear() < year) {
        return false
      }
      
      // Check month if specified
      if (month) {
        const startMonth = checkIn.getMonth() + 1
        const endMonth = checkOut.getMonth() + 1
        if (startMonth > month && endMonth < month) {
          return false
        }
      }
      
      return true
    })
    
    // Transform to calendar events
    const events = bookings.map(b => {
      const event: Record<string, unknown> = {
        id: b.id,
        booking_code: b.booking_code,
        type: b.booking_type,
        customer_name: b.customer_name,
        check_in: b.check_in_date,
        check_out: b.check_out_date,
        status: b.status,
        guests: b.number_of_guests,
        total_price: b.total_price
      }
      
      if (b.hotel_id) {
        const hotel = findMockHotel(b.hotel_id)
        event.item = hotel
        event.item_name = hotel?.name_th
      }
      
      if (b.car_id) {
        const car = findMockCar(b.car_id)
        event.item = car
        event.item_name = car?.name_th
      }
      
      return event
    })
    
    // Group by date
    const dateMap = new Map<string, typeof events>()
    events.forEach(event => {
      const start = new Date(event.check_in as string)
      const end = new Date(event.check_out as string)
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0]
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, [])
        }
        dateMap.get(dateKey)!.push(event)
      }
    })
    
    return NextResponse.json({
      year,
      month,
      events,
      date_summary: Object.fromEntries(dateMap),
      total_events: events.length
    })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    
    let query = supabase
      .from('bookings')
      .select('*, hotels(name_th, name_en), cars(name_th, name_en)')
      .gte('check_out_date', `${year}-01-01`)
      .lte('check_in_date', `${year}-12-31`)
    
    if (month) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const endDate = month === 12 
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 1).padStart(2, '0')}-01`
      query = query.gte('check_out_date', startDate).lt('check_in_date', endDate)
    }
    
    if (itemType === 'hotel') {
      query = query.not('hotel_id', 'is', null)
    } else if (itemType === 'car') {
      query = query.not('car_id', 'is', null)
    }
    
    if (itemId) {
      query = query.or(`hotel_id.eq.${itemId},car_id.eq.${itemId}`)
    }
    
    const { data: bookings, error } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      year,
      month,
      events: bookings || [],
      total_events: bookings?.length || 0
    })
  } catch (error) {
    console.error('Error fetching calendar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
