/**
 * ============================================================
 * Draft Booking API - บันทึกจองไว้ก่อน
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode } from '@/lib/auth'
import { mockDataStore } from '@/lib/mock-data'
import { z } from 'zod'
import crypto from 'crypto'

// Validation Schema for Draft
const draftSchema = z.object({
  booking_type: z.enum(['HOTEL', 'CAR', 'COMBO']),
  hotel_id: z.string().optional(),
  car_id: z.string().optional(),
  check_in_date: z.string(),
  check_out_date: z.string(),
  number_of_guests: z.number().min(1),
  customer_name: z.string().optional(),
  customer_email: z.string().email().optional(),
  customer_phone: z.string().optional(),
  car_options: z.array(z.object({
    option_id: z.string(),
    quantity: z.number().min(1).optional()
  })).optional(),
  coupon_code: z.string().optional()
})

/**
 * POST /api/drafts - สร้าง draft booking
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = draftSchema.parse(body)
    
    // Generate draft token
    const draftToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    
    // Mock Mode
    if (isMockMode()) {
      const draft = {
        id: `draft-${Date.now()}`,
        draft_token: draftToken,
        ...data,
        is_draft: true,
        expires_at: expiresAt,
        status: 'DRAFT',
        total_price: 0,
        currency: 'THB',
        created_at: new Date().toISOString()
      }
      
      // Store in mock (separate from real bookings)
      return NextResponse.json({ 
        draft,
        draft_url: `/booking/draft?token=${draftToken}`
      }, { status: 201 })
    }
    
    // Real Supabase Mode
    const supabase = await createAdminClient()
    const { data: draft, error } = await supabase
      .from('bookings')
      .insert([{
        ...data,
        is_draft: true,
        draft_token: draftToken,
        expires_at: expiresAt,
        status: 'DRAFT'
      }])
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ 
      draft,
      draft_url: `/booking/draft?token=${draftToken}`
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating draft:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/drafts - ดู draft ตาม token
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }
  
  // Mock Mode
  if (isMockMode()) {
    return NextResponse.json({ 
      draft: null,
      message: 'Draft lookup not available in mock mode'
    })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    
    const { data: draft, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('draft_token', token)
      .eq('is_draft', true)
      .single()
    
    if (error || !draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }
    
    // Check if expired
    if (new Date(draft.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Draft expired' }, { status: 410 })
    }
    
    return NextResponse.json({ draft })
  } catch (error) {
    console.error('Error fetching draft:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
