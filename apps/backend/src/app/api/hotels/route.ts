/**
 * ============================================================
 * Hotels API - จัดการข้อมูลโรงแรม
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode, requireAdmin } from '@/lib/auth'
import { mockDataStore, findMockHotel } from '@/lib/mock-data'
import { z } from 'zod'

// Validation Schema
const hotelSchema = z.object({
  name_th: z.string().min(1),
  name_en: z.string().min(1),
  description_th: z.string().optional(),
  description_en: z.string().optional(),
  location_th: z.string().optional(),
  location_en: z.string().optional(),
  star_rating: z.number().min(1).max(5).optional(),
  price_per_night: z.number().optional(),
  base_price_per_night: z.number().optional(),
  max_guests: z.number().optional(),
  room_type_th: z.string().optional(),
  room_type_en: z.string().optional(),
  amenities_th: z.array(z.string()).optional(),
  amenities_en: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  currency: z.string().optional(),
  is_active: z.boolean().optional(),
  // Multi-tenant
  partner_id: z.string().optional()
})

/**
 * GET /api/hotels - ดูรายการโรงแรมทั้งหมด
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const active = searchParams.get('active')
  const language = searchParams.get('lang') || 'th'
  
  // Mock Mode
  if (isMockMode()) {
    let hotels = mockDataStore.hotels
    if (active === 'true') {
      hotels = hotels.filter(h => h.is_active)
    }
    
    // Transform to include language-specific fields
    const transformed = hotels.map(h => ({
      id: h.id,
      name: language === 'en' ? h.name_en : h.name_th,
      description: language === 'en' ? h.description_en : h.description_th,
      location: language === 'en' ? h.location_en : h.location_th,
      star_rating: h.star_rating,
      price_per_night: h.base_price_per_night,
      max_guests: h.max_guests,
      room_type: language === 'en' ? h.room_type_en : h.room_type_th,
      amenities: language === 'en' ? h.amenities_en : h.amenities_th,
      images: h.images,
      currency: h.currency,
      is_active: h.is_active,
      created_at: h.created_at
    }))
    
    return NextResponse.json({ hotels: transformed, total: transformed.length })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    let query = supabase.from('hotels').select('*')
    
    if (active === 'true') {
      query = query.eq('is_active', true)
    }
    
    const { data: hotels, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ hotels, total: hotels?.length || 0 })
  } catch (error) {
    console.error('Error fetching hotels:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/hotels - สร้างโรงแรมใหม่ (Admin only)
 */
export async function POST(request: Request) {
  // Check admin auth
  const authError = await requireAdmin()
  if (authError) return authError
  
  try {
    const body = await request.json()
    const validatedData = hotelSchema.parse(body)
    
    // Mock Mode
    if (isMockMode()) {
      const newHotel = {
        id: mockDataStore.generateId('hotel'),
        ...validatedData,
        price_per_night: validatedData.price_per_night || validatedData.base_price_per_night || 0,
        base_price_per_night: validatedData.base_price_per_night || validatedData.price_per_night || 0,
        amenities_th: validatedData.amenities_th || [],
        amenities_en: validatedData.amenities_en || [],
        images: validatedData.images || [],
        currency: validatedData.currency || 'THB',
        is_active: validatedData.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      mockDataStore.hotels.push(newHotel)
      return NextResponse.json({ hotel: newHotel }, { status: 201 })
    }
    
    // Real Supabase Mode
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('hotels')
      .insert([{
        ...validatedData,
        price_per_night: validatedData.price_per_night || validatedData.base_price_per_night || 0,
        base_price_per_night: validatedData.base_price_per_night || validatedData.price_per_night || 0,
        amenities_th: validatedData.amenities_th || [],
        amenities_en: validatedData.amenities_en || [],
        images: validatedData.images || [],
        currency: validatedData.currency || 'THB',
        is_active: validatedData.is_active ?? true
      }])
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ hotel: data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating hotel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
