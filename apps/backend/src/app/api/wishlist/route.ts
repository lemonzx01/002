/**
 * ============================================================
 * Wishlist API - ระบบบันทึกไว้จองทีหลัง
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode, requireAuth } from '@/lib/auth'
import { z } from 'zod'

// In-memory store for mock mode
const mockWishlists: Array<Record<string, unknown>> = []

// Validation Schema
const wishlistSchema = z.object({
  item_type: z.enum(['hotel', 'car']),
  item_id: z.string()
})

/**
 * GET /api/wishlist - ดูรายการที่บันทึกไว้
 */
export async function GET(request: Request) {
  const authError = await requireAuth()
  if (authError) return authError
  
  // Mock Mode
  if (isMockMode()) {
    return NextResponse.json({ 
      wishlists: mockWishlists, 
      total: mockWishlists.length
    })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('wishlists')
      .select('*, hotels(*), cars(*)')
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ wishlists: data, total: data?.length || 0 })
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/wishlist - เพิ่มเข้าวิชลิสต์
 */
export async function POST(request: Request) {
  const authError = await requireAuth()
  if (authError) return authError
  
  try {
    const body = await request.json()
    const validatedData = wishlistSchema.parse(body)
    
    // Mock Mode
    if (isMockMode()) {
      // Check if already exists
      const exists = mockWishlists.find(
        w => w.item_type === validatedData.item_type && w.item_id === validatedData.item_id
      )
      
      if (exists) {
        return NextResponse.json({ error: 'Already in wishlist' }, { status: 400 })
      }
      
      const newWishlist = {
        id: `wishlist-${Date.now()}`,
        ...validatedData,
        user_id: 'user-001',
        created_at: new Date().toISOString()
      }
      
      mockWishlists.push(newWishlist)
      return NextResponse.json({ wishlist: newWishlist }, { status: 201 })
    }
    
    // Real Supabase Mode
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('wishlists')
      .insert([validatedData])
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ wishlist: data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error adding to wishlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/wishlist - ลบออกจากวิชลิสต์
 */
export async function DELETE(request: Request) {
  const authError = await requireAuth()
  if (authError) return authError
  
  const { searchParams } = new URL(request.url)
  const item_type = searchParams.get('item_type')
  const item_id = searchParams.get('item_id')
  
  if (!item_type || !item_id) {
    return NextResponse.json({ error: 'Missing item_type or item_id' }, { status: 400 })
  }
  
  // Mock Mode
  if (isMockMode()) {
    const index = mockWishlists.findIndex(
      w => w.item_type === item_type && w.item_id === item_id
    )
    
    if (index === -1) {
      return NextResponse.json({ error: 'Not found in wishlist' }, { status: 404 })
    }
    
    mockWishlists.splice(index, 1)
    return NextResponse.json({ message: 'Removed from wishlist' })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('item_type', item_type)
      .eq('item_id', item_id)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ message: 'Removed from wishlist' })
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
