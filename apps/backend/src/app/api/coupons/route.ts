/**
 * ============================================================
 * Coupons API - ระบบส่วนลด/โปรโมชัน
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode, requireAdmin } from '@/lib/auth'
import { z } from 'zod'

// Mock coupons
const mockCoupons: Array<Record<string, unknown>> = [
  {
    id: 'coupon-001',
    code: 'WELCOME10',
    description_th: 'ส่วนลด 10% สำหรับการจองครั้งแรก',
    description_en: '10% off for first booking',
    discount_type: 'percentage',
    discount_value: 10,
    min_booking_value: 0,
    max_uses: null,
    used_count: 0,
    valid_from: '2026-01-01',
    valid_until: '2026-12-31',
    applicable_to: 'all',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'coupon-002',
    code: 'SUMMER50',
    description_th: 'ส่วนลด 50 บาท',
    description_en: '50 THB off',
    discount_type: 'fixed',
    discount_value: 50,
    min_booking_value: 500,
    max_uses: 100,
    used_count: 15,
    valid_from: '2026-03-01',
    valid_until: '2026-04-30',
    applicable_to: 'all',
    is_active: true,
    created_at: '2026-03-01T00:00:00Z'
  },
  {
    id: 'coupon-003',
    code: 'HOTEL25',
    description_th: 'ส่วนลด 25% โรงแรม',
    description_en: '25% off hotels',
    discount_type: 'percentage',
    discount_value: 25,
    min_booking_value: 1000,
    max_uses: null,
    used_count: 0,
    valid_from: '2026-01-01',
    valid_until: '2026-06-30',
    applicable_to: 'hotel',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  }
]

// Validation Schema
const couponSchema = z.object({
  code: z.string().min(1).max(50),
  booking_type: z.enum(['HOTEL', 'CAR', 'COMBO']).optional(),
  booking_value: z.number().positive()
})

const createCouponSchema = z.object({
  code: z.string().min(1).max(50),
  description_th: z.string().optional(),
  description_en: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().positive(),
  min_booking_value: z.number().optional(),
  max_uses: z.number().optional(),
  valid_from: z.string(),
  valid_until: z.string(),
  applicable_to: z.enum(['all', 'hotel', 'car']).optional()
})

/**
 * GET /api/coupons - ดูรายการ coupons
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const active = searchParams.get('active')
  const code = searchParams.get('code')
  
  // Mock Mode
  if (isMockMode()) {
    let coupons = [...mockCoupons]
    
    if (active === 'true') {
      const now = new Date().toISOString().split('T')[0]
      coupons = coupons.filter(c => 
        c.is_active && 
        c.valid_from <= now && 
        c.valid_until >= now &&
        (c.max_uses === null || c.used_count < c.max_uses)
      )
    }
    
    if (code) {
      coupons = coupons.filter(c => c.code.toUpperCase() === code.toUpperCase())
    }
    
    return NextResponse.json({ coupons, total: coupons.length })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    let query = supabase.from('coupons').select('*')
    
    if (active === 'true') {
      const now = new Date().toISOString().split('T')[0]
      query = query.eq('is_active', true)
        .lte('valid_from', now)
        .gte('valid_until', now)
    }
    
    if (code) {
      query = query.ilike('code', code)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ coupons: data, total: data?.length || 0 })
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/coupons/validate - ตรวจสอบ coupon
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, booking_type, booking_value } = couponSchema.parse(body)
    
    // Mock Mode
    if (isMockMode()) {
      const coupon = mockCoupons.find(c => c.code.toUpperCase() === code.toUpperCase())
      
      if (!coupon) {
        return NextResponse.json({ 
          valid: false, 
          error: 'Invalid coupon code' 
        }, { status: 400 })
      }
      
      // Check if active
      if (!coupon.is_active) {
        return NextResponse.json({ 
          valid: false, 
          error: 'Coupon is inactive' 
        }, { status: 400 })
      }
      
      // Check validity dates
      const now = new Date().toISOString().split('T')[0]
      if (now < coupon.valid_from || now > coupon.valid_until) {
        return NextResponse.json({ 
          valid: false, 
          error: 'Coupon has expired' 
        }, { status: 400 })
      }
      
      // Check max uses
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return NextResponse.json({ 
          valid: false, 
          error: 'Coupon usage limit reached' 
        }, { status: 400 })
      }
      
      // Check minimum booking value
      if (coupon.min_booking_value && booking_value < coupon.min_booking_value) {
        return NextResponse.json({ 
          valid: false, 
          error: `Minimum booking value is ${coupon.min_booking_value} ${coupon.discount_type === 'percentage' ? 'THB' : ''}` 
        }, { status: 400 })
      }
      
      // Check applicable to
      if (coupon.applicable_to !== 'all' && booking_type) {
        if (coupon.applicable_to === 'hotel' && booking_type !== 'HOTEL') {
          return NextResponse.json({ 
            valid: false, 
            error: 'Coupon is only applicable to hotel bookings' 
          }, { status: 400 })
        }
        if (coupon.applicable_to === 'car' && booking_type !== 'CAR') {
          return NextResponse.json({ 
            valid: false, 
            error: 'Coupon is only applicable to car bookings' 
          }, { status: 400 })
        }
      }
      
      // Calculate discount
      let discount_amount = 0
      if (coupon.discount_type === 'percentage') {
        discount_amount = (booking_value * coupon.discount_value) / 100
      } else {
        discount_amount = coupon.discount_value
      }
      
      const final_price = Math.max(0, booking_value - discount_amount)
      
      return NextResponse.json({
        valid: true,
        coupon: {
          code: coupon.code,
          description_th: coupon.description_th,
          description_en: coupon.description_en,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value
        },
        original_price: booking_value,
        discount_amount,
        final_price
      })
    }
    
    // Real Supabase Mode
    const supabase = await createAdminClient()
    const now = new Date().toISOString().split('T')[0]
    
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', code)
      .eq('is_active', true)
      .lte('valid_from', now)
      .gte('valid_until', now)
      .single()
    
    if (error || !coupon) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid or expired coupon' 
      }, { status: 400 })
    }
    
    // Check max uses
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Coupon usage limit reached' 
      }, { status: 400 })
    }
    
    // Check minimum booking value
    if (coupon.min_booking_value && booking_value < coupon.min_booking_value) {
      return NextResponse.json({ 
        valid: false, 
        error: `Minimum booking value is ${coupon.min_booking_value}` 
      }, { status: 400 })
    }
    
    // Calculate discount
    let discount_amount = 0
    if (coupon.discount_type === 'percentage') {
      discount_amount = (booking_value * coupon.discount_value) / 100
    } else {
      discount_amount = coupon.discount_value
    }
    
    const final_price = Math.max(0, booking_value - discount_amount)
    
    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description_th: coupon.description_th,
        description_en: coupon.description_en,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value
      },
      original_price: booking_value,
      discount_amount,
      final_price
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error validating coupon:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
