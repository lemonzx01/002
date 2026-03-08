/**
 * ============================================================
 * Partners API - จัดการข้อมูล Partner
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode, requireAuth, getUserPartnerId } from '@/lib/auth'
import { rbacMiddleware } from '@/lib/rbac'
import { z } from 'zod'

const partnerSchema = z.object({
  name_th: z.string().min(1),
  name_en: z.string().optional(),
  type: z.enum(['hotel', 'driver', 'both']),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  line_id: z.string().optional(),
  address_th: z.string().optional(),
  address_en: z.string().optional(),
  tax_id: z.string().optional(),
  bank_account: z.string().optional(),
  bank_name: z.string().optional()
})

/**
 * GET /api/partners - ดูข้อมูล partner ของตัวเอง
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  
  // Check auth
  const rbac = await rbacMiddleware(request)
  if (!rbac.allowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Mock Mode
  if (isMockMode()) {
    return NextResponse.json({
      partners: [{
        id: 'partner-001',
        user_id: 'user-001',
        name_th: 'โรงแรมทดสอบ',
        type: 'hotel',
        is_verified: true,
        is_active: true
      }],
      total: 1
    })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    let query = supabase.from('partners').select('*')
    
    // If not admin, only show own partner
    if (rbac.role !== 'admin' && rbac.partnerId) {
      query = query.eq('id', rbac.partnerId)
    }
    
    if (type) {
      query = query.eq('type', type)
    }
    
    const { data, error } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ partners: data, total: data?.length || 0 })
  } catch (error) {
    console.error('Error fetching partners:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/partners - สมัครเป็น partner
 */
export async function POST(request: Request) {
  // Allow anyone to register as partner
  try {
    const body = await request.json()
    const data = partnerSchema.parse(body)
    
    // Mock Mode
    if (isMockMode()) {
      const newPartner = {
        id: `partner-${Date.now()}`,
        user_id: 'user-001',
        ...data,
        is_verified: false,
        is_active: true,
        created_at: new Date().toISOString()
      }
      return NextResponse.json({ partner: newPartner }, { status: 201 })
    }
    
    // Real Supabase Mode
    const supabase = await createAdminClient()
    const { data: partner, error } = await supabase
      .from('partners')
      .insert([data])
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ partner }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating partner:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/partners - แก้ไขข้อมูล partner
 */
export async function PUT(request: Request) {
  const rbac = await rbacMiddleware(request)
  if (!rbac.allowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const data = partnerSchema.partial().parse(body)
    
    // Mock Mode
    if (isMockMode()) {
      return NextResponse.json({
        partner: { id: rbac.partnerId, ...data }
      })
    }
    
    // Real Supabase Mode
    const supabase = await createAdminClient()
    const { data: partner, error } = await supabase
      .from('partners')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', rbac.partnerId || '')
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ partner })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error updating partner:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
