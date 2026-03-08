/**
 * ============================================================
 * Admin Coupons API - จัดการ coupons (Admin only)
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode, requireAdmin } from '@/lib/auth'
import { z } from 'zod'

const createCouponSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
  description_th: z.string().optional(),
  description_en: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().positive(),
  min_booking_value: z.number().optional().default(0),
  max_uses: z.number().optional(),
  valid_from: z.string(),
  valid_until: z.string(),
  applicable_to: z.enum(['all', 'hotel', 'car']).optional().default('all')
})

/**
 * POST /api/admin/coupons - สร้าง coupon ใหม่
 */
export async function POST(request: Request) {
  const authError = await requireAdmin()
  if (authError) return authError
  
  try {
    const body = await request.json()
    const data = createCouponSchema.parse(body)
    
    // Mock Mode
    if (isMockMode()) {
      const newCoupon = {
        id: `coupon-${Date.now()}`,
        ...data,
        used_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return NextResponse.json({ coupon: newCoupon }, { status: 201 })
    }
    
    // Real Supabase Mode
    const supabase = await createAdminClient()
    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert([data])
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ coupon }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating coupon:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/coupons/[id] - แก้ไข coupon
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
    const data = createCouponSchema.partial().parse(body)
    
    // Mock Mode
    if (isMockMode()) {
      return NextResponse.json({ 
        message: 'Coupon updated (mock)',
        coupon: { id, ...data }
      })
    }
    
    // Real Supabase Mode
    const supabase = await createAdminClient()
    const { data: coupon, error } = await supabase
      .from('coupons')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ coupon })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error updating coupon:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/coupons/[id] - ลบ coupon
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
    return NextResponse.json({ message: 'Coupon deleted (mock)' })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ message: 'Coupon deleted' })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
