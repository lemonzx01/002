/**
 * ============================================================
 * Car Options API - ตัวเลือกเพิ่มเติมสำหรับรถเช่า
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode, requireAdmin } from '@/lib/auth'
import { z } from 'zod'

// Mock car options
const mockCarOptions: Array<Record<string, unknown>> = [
  {
    id: 'option-001',
    car_id: 'car-001',
    name_th: 'รวมค่าคนขับ',
    name_en: 'Including driver',
    description_th: 'รวมค่าคนขับแล้ว',
    description_en: 'Driver fee included',
    price_type: 'per_booking',
    price: 0,
    is_available: true,
    sort_order: 1
  },
  {
    id: 'option-002',
    car_id: 'car-001',
    name_th: 'เพิ่มคนขับ',
    name_en: 'Add driver',
    description_th: 'เพิ่มบริการคนขับ',
    description_en: 'Add professional driver',
    price_type: 'per_day',
    price: 500,
    is_available: true,
    sort_order: 2
  },
  {
    id: 'option-003',
    car_id: 'car-002',
    name_th: 'รวมค่าคนขับ',
    name_en: 'Including driver',
    description_th: 'รวมค่าคนขับแล้ว',
    description_en: 'Driver fee included',
    price_type: 'per_booking',
    price: 0,
    is_available: true,
    sort_order: 1
  },
  {
    id: 'option-004',
    car_id: 'car-002',
    name_th: 'ขับเอง',
    name_en: 'Self-drive',
    description_th: 'รับรถไปขับเอง',
    description_en: 'Pick up and drive yourself',
    price_type: 'per_booking',
    price: -500,
    is_available: true,
    sort_order: 2
  },
  {
    id: 'option-005',
    car_id: 'car-002',
    name_th: 'เพิ่มเบาะเด็ก',
    name_en: 'Add child seat',
    description_th: 'เบาะนั่งสำหรับเด็ก',
    description_en: 'Child safety seat',
    price_type: 'per_booking',
    price: 200,
    is_available: true,
    sort_order: 3
  },
  {
    id: 'option-006',
    car_id: 'car-002',
    name_th: 'เพิ่ม GPS',
    name_en: 'Add GPS',
    description_th: 'ระบบนำทาง GPS',
    description_en: 'GPS navigation system',
    price_type: 'per_day',
    price: 100,
    is_available: true,
    sort_order: 4
  },
  {
    id: 'option-007',
    car_id: 'car-003',
    name_th: 'รวมค่าคนขับ',
    name_en: 'Including driver',
    description_th: 'รวมค่าคนขับแล้ว',
    description_en: 'Driver fee included',
    price_type: 'per_booking',
    price: 0,
    is_available: true,
    sort_order: 1
  },
  {
    id: 'option-008',
    car_id: 'car-003',
    name_th: 'รับจากสนามบิน',
    name_en: 'Airport pickup',
    description_th: 'รับจากสนามบินฟรี',
    description_en: 'Free airport pickup',
    price_type: 'per_booking',
    price: 0,
    is_available: true,
    sort_order: 2
  }
]

const optionSchema = z.object({
  car_id: z.string(),
  name_th: z.string().min(1),
  name_en: z.string().min(1),
  description_th: z.string().optional(),
  description_en: z.string().optional(),
  price_type: z.enum(['per_day', 'per_booking', 'per_person']),
  price: z.number(),
  is_available: z.boolean().optional()
})

/**
 * GET /api/car-options - ดูตัวเลือกของรถ
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const car_id = searchParams.get('car_id')
  
  // Mock Mode
  if (isMockMode()) {
    let options = [...mockCarOptions]
    
    if (car_id) {
      options = options.filter(o => o.car_id === car_id)
    }
    
    return NextResponse.json({ options, total: options.length })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    let query = supabase.from('car_options').select('*').order('sort_order')
    
    if (car_id) {
      query = query.eq('car_id', car_id)
    }
    
    const { data, error } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ options: data, total: data?.length || 0 })
  } catch (error) {
    console.error('Error fetching car options:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/car-options - สร้างตัวเลือกใหม่ (Admin)
 */
export async function POST(request: Request) {
  const authError = await requireAdmin()
  if (authError) return authError
  
  try {
    const body = await request.json()
    const data = optionSchema.parse(body)
    
    // Mock Mode
    if (isMockMode()) {
      const newOption = {
        id: `option-${Date.now()}`,
        ...data,
        is_available: data.is_available ?? true,
        sort_order: mockCarOptions.length + 1,
        created_at: new Date().toISOString()
      }
      mockCarOptions.push(newOption)
      return NextResponse.json({ option: newOption }, { status: 201 })
    }
    
    // Real Supabase Mode
    const supabase = await createAdminClient()
    const { data: option, error } = await supabase
      .from('car_options')
      .insert([data])
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ option }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating car option:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
