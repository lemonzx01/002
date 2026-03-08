/**
 * ============================================================
 * Search API - ค้นหาและกรองโรงแรม/รถเช่า
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode } from '@/lib/auth'
import { mockDataStore } from '@/lib/mock-data'
import { z } from 'zod'

// Validation Schema
const searchSchema = z.object({
  type: z.enum(['hotel', 'car', 'all']).optional(),
  query: z.string().optional(),
  min_price: z.coerce.number().optional(),
  max_price: z.coerce.number().optional(),
  location: z.string().optional(),
  rating: z.coerce.number().optional(),
  guests: z.coerce.number().optional(),
  check_in: z.string().optional(),
  check_out: z.string().optional(),
  sort_by: z.enum(['price_asc', 'price_desc', 'rating', 'newest']).optional(),
  lang: z.enum(['th', 'en']).optional()
})

/**
 * GET /api/search - ค้นหาทั้งโรงแรมและรถเช่า
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  // Parse query params
  const params = searchSchema.parse({
    type: searchParams.get('type') || 'all',
    query: searchParams.get('query'),
    min_price: searchParams.get('min_price'),
    max_price: searchParams.get('max_price'),
    location: searchParams.get('location'),
    rating: searchParams.get('rating'),
    guests: searchParams.get('guests'),
    check_in: searchParams.get('check_in'),
    check_out: searchParams.get('check_out'),
    sort_by: searchParams.get('sort_by'),
    lang: searchParams.get('lang') || 'th'
  })
  
  // Mock Mode
  if (isMockMode()) {
    const { type, query, min_price, max_price, location, rating, guests, sort_by, lang } = params
    
    let hotels: Array<Record<string, unknown>> = [...mockDataStore.hotels]
    let cars: Array<Record<string, unknown>> = [...mockDataStore.cars]
    
    // Filter hotels
    if (type === 'hotel' || type === 'all') {
      hotels = hotels.filter(h => {
        if (!h.is_active) return false
        if (query) {
          const q = query.toLowerCase()
          const name = lang === 'en' ? h.name_en : h.name_th
          const desc = lang === 'en' ? h.description_en : h.description_th
          const loc = lang === 'en' ? h.location_en : h.location_th
          if (!name?.toLowerCase().includes(q) && 
              !desc?.toLowerCase().includes(q) && 
              !loc?.toLowerCase().includes(q)) {
            return false
          }
        }
        if (min_price && (h.base_price_per_night as number) < min_price) return false
        if (max_price && (h.base_price_per_night as number) > max_price) return false
        if (location) {
          const loc = lang === 'en' ? h.location_en : h.location_th
          if (!loc?.toLowerCase().includes(location.toLowerCase())) return false
        }
        if (rating && (h.star_rating as number) < rating) return false
        if (guests && (h.max_guests as number) < guests) return false
        return true
      })
      
      // Sort hotels
      if (sort_by === 'price_asc') {
        hotels.sort((a, b) => (a.base_price_per_night as number) - (b.base_price_per_night as number))
      } else if (sort_by === 'price_desc') {
        hotels.sort((a, b) => (b.base_price_per_night as number) - (a.base_price_per_night as number))
      } else if (sort_by === 'rating') {
        hotels.sort((a, b) => (b.star_rating as number) - (a.star_rating as number))
      } else if (sort_by === 'newest') {
        hotels.sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime())
      }
    }
    
    // Filter cars
    if (type === 'car' || type === 'all') {
      cars = cars.filter(c => {
        if (!c.is_active) return false
        if (query) {
          const q = query.toLowerCase()
          const name = lang === 'en' ? c.name_en : c.name_th
          const desc = lang === 'en' ? c.description_en : c.description_th
          if (!name?.toLowerCase().includes(q) && !desc?.toLowerCase().includes(q)) {
            return false
          }
        }
        if (min_price && (c.base_price_per_day as number) < min_price) return false
        if (max_price && (c.base_price_per_day as number) > max_price) return false
        if (guests && (c.max_passengers as number) < guests) return false
        return true
      })
      
      // Sort cars
      if (sort_by === 'price_asc') {
        cars.sort((a, b) => (a.base_price_per_day as number) - (b.base_price_per_day as number))
      } else if (sort_by === 'price_desc') {
        cars.sort((a, b) => (b.base_price_per_day as number) - (a.base_price_per_day as number))
      } else if (sort_by === 'newest') {
        cars.sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime())
      }
    }
    
    // Transform results
    const transformItem = (item: Record<string, unknown>, itemType: 'hotel' | 'car') => ({
      id: item.id,
      type: itemType,
      name: lang === 'en' ? item.name_en : item.name_th,
      description: lang === 'en' ? item.description_en : item.description_th,
      location: lang === 'en' ? item.location_en : item.location_th,
      price: itemType === 'hotel' ? item.base_price_per_night : item.base_price_per_day,
      price_unit: itemType === 'hotel' ? 'per_night' : 'per_day',
      images: item.images,
      rating: item.star_rating,
      max_guests: item.max_guests || item.max_passengers,
      currency: item.currency,
      is_active: item.is_active
    })
    
    const results = [
      ...hotels.map(h => transformItem(h, 'hotel')),
      ...cars.map(c => transformItem(c, 'car'))
    ]
    
    return NextResponse.json({
      results,
      hotels: hotels.length,
      cars: cars.length,
      total: results.length,
      filters: params
    })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    const { type, query, min_price, max_price, location, rating, guests, sort_by } = params
    
    let hotels: Array<Record<string, unknown>> = []
    let cars: Array<Record<string, unknown>> = []
    
    if (type === 'hotel' || type === 'all') {
      let hotelQuery = supabase.from('hotels').select('*').eq('is_active', true)
      
      if (query) {
        hotelQuery = hotelQuery.or(`name_th.ilike.%${query}%,name_en.ilike.%${query}%`)
      }
      if (min_price) {
        hotelQuery = hotelQuery.gte('base_price_per_night', min_price)
      }
      if (max_price) {
        hotelQuery = hotelQuery.lte('base_price_per_night', max_price)
      }
      if (location) {
        hotelQuery = hotelQuery.or(`location_th.ilike.%${location}%,location_en.ilike.%${location}%`)
      }
      if (rating) {
        hotelQuery = hotelQuery.gte('star_rating', rating)
      }
      if (guests) {
        hotelQuery = hotelQuery.gte('max_guests', guests)
      }
      
      const { data: hotelData } = await hotelQuery
      hotels = hotelData || []
    }
    
    if (type === 'car' || type === 'all') {
      let carQuery = supabase.from('cars').select('*').eq('is_active', true)
      
      if (query) {
        carQuery = carQuery.or(`name_th.ilike.%${query}%,name_en.ilike.%${query}%`)
      }
      if (min_price) {
        carQuery = carQuery.gte('base_price_per_day', min_price)
      }
      if (max_price) {
        carQuery = carQuery.lte('base_price_per_day', max_price)
      }
      if (guests) {
        carQuery = carQuery.gte('max_passengers', guests)
      }
      
      const { data: carData } = await carQuery
      cars = carData || []
    }
    
    return NextResponse.json({
      results: [...hotels, ...cars],
      hotels: hotels.length,
      cars: cars.length,
      total: hotels.length + cars.length,
      filters: params
    })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
