/**
 * ============================================================
 * Car Detail API - จัดการข้อมูลรถเช่าเฉพาะ ID
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode, requireAdmin } from '@/lib/auth'
import { mockDataStore, findMockCar } from '@/lib/mock-data'
import { z } from 'zod'

const carSchema = z.object({
  name_th: z.string().min(1).optional(),
  name_en: z.string().min(1).optional(),
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
  is_active: z.boolean().optional()
})

/**
 * GET /api/cars/[id] - ดูรถเช่าตาม ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const language = new URL(request.url).searchParams.get('lang') || 'th'
  
  // Mock Mode
  if (isMockMode()) {
    const car = findMockCar(id)
    
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 })
    }
    
    const transformed = {
      id: car.id,
      name: language === 'en' ? car.name_en : car.name_th,
      description: language === 'en' ? car.description_en : car.description_th,
      car_type: language === 'en' ? car.car_type_en : car.car_type_th,
      max_passengers: car.max_passengers,
      price_per_day: car.base_price_per_day,
      includes: language === 'en' ? car.includes_en : car.includes_th,
      images: car.images,
      currency: car.currency,
      is_active: car.is_active,
      created_at: car.created_at
    }
    
    return NextResponse.json({ car: transformed })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 })
    }
    
    return NextResponse.json({ car: data })
  } catch (error) {
    console.error('Error fetching car:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/cars/[id] - แก้ไขรถเช่า (Admin only)
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
    const validatedData = carSchema.parse(body)
    
    // Mock Mode
    if (isMockMode()) {
      const index = mockDataStore.cars.findIndex(c => c.id === id)
      
      if (index === -1) {
        return NextResponse.json({ error: 'Car not found' }, { status: 404 })
      }
      
      const updatedCar = {
        ...mockDataStore.cars[index],
        ...validatedData,
        updated_at: new Date().toISOString()
      }
      
      mockDataStore.cars[index] = updatedCar
      return NextResponse.json({ car: updatedCar })
    }
    
    // Real Supabase Mode
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('cars')
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
    
    return NextResponse.json({ car: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error updating car:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/cars/[id] - ลบรถเช่า (Admin only)
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
    const index = mockDataStore.cars.findIndex(c => c.id === id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 })
    }
    
    mockDataStore.cars.splice(index, 1)
    return NextResponse.json({ message: 'Car deleted successfully' })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ message: 'Car deleted successfully' })
  } catch (error) {
    console.error('Error deleting car:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
