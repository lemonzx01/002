/**
 * ============================================================
 * Cars API - จัดการข้อมูลรถเช่า
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode, requireAdmin } from '@/lib/auth'
import { mockDataStore, findMockCar } from '@/lib/mock-data'
import { z } from 'zod'

// Validation Schema
const carSchema = z.object({
  name_th: z.string().min(1),
  name_en: z.string().min(1),
  description_th: z.string().optional(),
  description_en: z.string().optional(),
  car_type_th: z.string().optional(),
  car_type_en: z.string().optional(),
  max_passengers: z.number().optional(),
  price_per_day: z.number().optional(),
  base_price_per_day: z.number().optional(),
  includes_th: z.array(z.string()).optional(),
  includes_en: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  driver_name: z.string().optional(),
  driver_surname: z.string().optional(),
  currency: z.string().optional(),
  is_active: z.boolean().optional(),
  // Multi-tenant
  partner_id: z.string().optional()
})

/**
 * GET /api/cars - ดูรายการรถเช่าทั้งหมด
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const active = searchParams.get('active')
  const language = searchParams.get('lang') || 'th'
  
  // Mock Mode
  if (isMockMode()) {
    let cars = mockDataStore.cars
    if (active === 'true') {
      cars = cars.filter(c => c.is_active)
    }
    
    const transformed = cars.map(c => ({
      id: c.id,
      name: language === 'en' ? c.name_en : c.name_th,
      description: language === 'en' ? c.description_en : c.description_th,
      car_type: language === 'en' ? c.car_type_en : c.car_type_th,
      max_passengers: c.max_passengers,
      price_per_day: c.base_price_per_day,
      includes: language === 'en' ? c.includes_en : c.includes_th,
      images: c.images,
      currency: c.currency,
      is_active: c.is_active,
      created_at: c.created_at
    }))
    
    return NextResponse.json({ cars: transformed, total: transformed.length })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    let query = supabase.from('cars').select('*')
    
    if (active === 'true') {
      query = query.eq('is_active', true)
    }
    
    const { data: cars, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ cars, total: cars?.length || 0 })
  } catch (error) {
    console.error('Error fetching cars:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/cars - สร้างรถเช่าใหม่ (Admin only)
 */
export async function POST(request: Request) {
  const authError = await requireAdmin()
  if (authError) return authError
  
  try {
    const body = await request.json()
    const validatedData = carSchema.parse(body)
    
    // Mock Mode
    if (isMockMode()) {
      const newCar = {
        id: mockDataStore.generateId('car'),
        ...validatedData,
        price_per_day: validatedData.price_per_day || validatedData.base_price_per_day || 0,
        base_price_per_day: validatedData.base_price_per_day || validatedData.price_per_day || 0,
        includes_th: validatedData.includes_th || [],
        includes_en: validatedData.includes_en || [],
        images: validatedData.images || [],
        currency: validatedData.currency || 'THB',
        is_active: validatedData.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      mockDataStore.cars.push(newCar)
      return NextResponse.json({ car: newCar }, { status: 201 })
    }
    
    // Real Supabase Mode
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('cars')
      .insert([{
        ...validatedData,
        price_per_day: validatedData.price_per_day || validatedData.base_price_per_day || 0,
        base_price_per_day: validatedData.base_price_per_day || validatedData.price_per_day || 0,
        includes_th: validatedData.includes_th || [],
        includes_en: validatedData.includes_en || [],
        images: validatedData.images || [],
        currency: validatedData.currency || 'THB',
        is_active: validatedData.is_active ?? true
      }])
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ car: data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating car:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
