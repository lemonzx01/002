/**
 * ============================================================
 * Hotel Detail API - จัดการข้อมูลโรงแรมเฉพาะ ID
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode, requireAdmin } from '@/lib/auth'
import { mockDataStore, findMockHotel } from '@/lib/mock-data'
import { z } from 'zod'

const hotelSchema = z.object({
  name_th: z.string().min(1).optional(),
  name_en: z.string().min(1).optional(),
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
  is_active: z.boolean().optional()
})

/**
 * GET /api/hotels/[id] - ดูโรงแรมตาม ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const language = new URL(request.url).searchParams.get('lang') || 'th'
  
  // Mock Mode
  if (isMockMode()) {
    const hotel = findMockHotel(id)
    
    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
    }
    
    const transformed = {
      id: hotel.id,
      name: language === 'en' ? hotel.name_en : hotel.name_th,
      description: language === 'en' ? hotel.description_en : hotel.description_th,
      location: language === 'en' ? hotel.location_en : hotel.location_th,
      star_rating: hotel.star_rating,
      price_per_night: hotel.base_price_per_night,
      max_guests: hotel.max_guests,
      room_type: language === 'en' ? hotel.room_type_en : hotel.room_type_th,
      amenities: language === 'en' ? hotel.amenities_en : hotel.amenities_th,
      images: hotel.images,
      currency: hotel.currency,
      is_active: hotel.is_active,
      created_at: hotel.created_at
    }
    
    return NextResponse.json({ hotel: transformed })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
    }
    
    return NextResponse.json({ hotel: data })
  } catch (error) {
    console.error('Error fetching hotel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/hotels/[id] - แก้ไขโรงแรม (Admin only)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin()
  if (authError) return authError
  
  const { id } = await params
  
  try {
    const body = await request.json()
    const validatedData = hotelSchema.parse(body)
    
    // Mock Mode
    if (isMockMode()) {
      const index = mockDataStore.hotels.findIndex(h => h.id === id)
      
      if (index === -1) {
        return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
      }
      
      const updatedHotel = {
        ...mockDataStore.hotels[index],
        ...validatedData,
        updated_at: new Date().toISOString()
      }
      
      mockDataStore.hotels[index] = updatedHotel
      return NextResponse.json({ hotel: updatedHotel })
    }
    
    // Real Supabase Mode
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('hotels')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ hotel: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error updating hotel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/hotels/[id] - ลบโรงแรม (Admin only)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin()
  if (authError) return authError
  
  const { id } = await params
  
  // Mock Mode
  if (isMockMode()) {
    const index = mockDataStore.hotels.findIndex(h => h.id === id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
    }
    
    mockDataStore.hotels.splice(index, 1)
    return NextResponse.json({ message: 'Hotel deleted successfully' })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    const { error } = await supabase
      .from('hotels')
      .delete()
      .eq('id', id)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ message: 'Hotel deleted successfully' })
  } catch (error) {
    console.error('Error deleting hotel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
