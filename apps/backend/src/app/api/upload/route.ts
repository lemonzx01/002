/**
 * ============================================================
 * Upload API - อัปโหลดรูปภาพ
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode, requireAdmin } from '@/lib/auth'
import { z } from 'zod'

// Validation Schema
const uploadSchema = z.object({
  item_type: z.enum(['hotel', 'car']),
  item_id: z.string(),
  image_url: z.string().url()
})

/**
 * POST /api/upload - เพิ่มรูปภาพ
 */
export async function POST(request: Request) {
  const authError = await requireAdmin()
  if (authError) return authError
  
  try {
    const body = await request.json()
    const validatedData = uploadSchema.parse(body)
    
    // Mock Mode - just return success
    if (isMockMode()) {
      return NextResponse.json({ 
        success: true, 
        url: validatedData.image_url,
        message: 'Image added (mock mode)'
      }, { status: 201 })
    }
    
    // Real Supabase Mode - add to storage and update record
    const supabase = await createAdminClient()
    const { item_type, item_id, image_url } = validatedData
    
    // Get existing images
    const table = item_type === 'hotel' ? 'hotels' : 'cars'
    const { data: existing, error: fetchError } = await supabase
      .from(table)
      .select('images')
      .eq('id', item_id)
      .single()
    
    if (fetchError) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }
    
    // Add new image
    const images = [...(existing.images || []), image_url]
    
    const { error: updateError } = await supabase
      .from(table)
      .update({ images })
      .eq('id', item_id)
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: true, 
      url: image_url,
      images 
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error uploading image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/upload - ลบรูปภาพ
 */
export async function DELETE(request: Request) {
  const authError = await requireAdmin()
  if (authError) return authError
  
  const { searchParams } = new URL(request.url)
  const item_type = searchParams.get('item_type')
  const item_id = searchParams.get('item_id')
  const image_url = searchParams.get('image_url')
  
  if (!item_type || !item_id || !image_url) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }
  
  // Mock Mode
  if (isMockMode()) {
    return NextResponse.json({ 
      success: true, 
      message: 'Image removed (mock mode)'
    })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    const table = item_type === 'hotel' ? 'hotels' : 'cars'
    
    // Get existing images
    const { data: existing, error: fetchError } = await supabase
      .from(table)
      .select('images')
      .eq('id', item_id)
      .single()
    
    if (fetchError) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }
    
    // Remove image
    const images = (existing.images || []).filter((url: string) => url !== image_url)
    
    const { error: updateError } = await supabase
      .from(table)
      .update({ images })
      .eq('id', item_id)
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }
    
    return NextResponse.json({ success: true, images })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
