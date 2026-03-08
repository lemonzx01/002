/**
 * ============================================================
 * Reviews API - ระบบรีวิวโรงแรมและรถเช่า
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode, requireAuth } from '@/lib/auth'
import { z } from 'zod'

// In-memory store for mock mode
const mockReviews: Array<Record<string, unknown>> = [
  {
    id: 'review-001',
    item_type: 'hotel',
    item_id: 'hotel-001',
    rating: 5,
    comment_th: 'โรงแรมสวยมาก วิวสะพรรณ พนักงานบริการดีเยี่ยม',
    comment_en: 'Beautiful hotel with amazing view, excellent service',
    user_name: 'John D.',
    user_id: 'user-001',
    created_at: '2026-03-01T10:00:00Z'
  },
  {
    id: 'review-002',
    item_type: 'hotel',
    item_id: 'hotel-001',
    rating: 4,
    comment_th: 'ทำเลดี ใกล้ตลาด ห้องสะอาด',
    comment_en: 'Great location near market, clean room',
    user_name: 'Jane S.',
    user_id: 'user-002',
    created_at: '2026-02-28T14:30:00Z'
  },
  {
    id: 'review-003',
    item_type: 'car',
    item_id: 'car-002',
    rating: 5,
    comment_th: 'รถใหม่ สะอาด คนขับบริการดีมาก',
    comment_en: 'New car, clean, driver provided excellent service',
    user_name: 'Mike T.',
    user_id: 'user-003',
    created_at: '2026-03-03T09:00:00Z'
  }
]

// Validation Schema
const reviewSchema = z.object({
  item_type: z.enum(['hotel', 'car']),
  item_id: z.string(),
  rating: z.number().min(1).max(5),
  comment_th: z.string().optional(),
  comment_en: z.string().optional()
})

/**
 * GET /api/reviews - ดูรีวิว
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const item_type = searchParams.get('item_type')
  const item_id = searchParams.get('item_id')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = parseInt(searchParams.get('offset') || '0')
  
  // Mock Mode
  if (isMockMode()) {
    let reviews = [...mockReviews]
    
    if (item_type) {
      reviews = reviews.filter(r => r.item_type === item_type)
    }
    if (item_id) {
      reviews = reviews.filter(r => r.item_id === item_id)
    }
    
    // Calculate rating stats
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.forEach(r => {
      ratingCounts[r.rating as keyof typeof ratingCounts]++
    })
    
    const totalRating = reviews.reduce((sum, r) => sum + (r.rating as number), 0)
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0
    
    // Paginate
    const paginatedReviews = reviews.slice(offset, offset + limit)
    
    return NextResponse.json({ 
      reviews: paginatedReviews, 
      total: reviews.length,
      average_rating: Math.round(avgRating * 10) / 10,
      rating_count: reviews.length,
      rating_distribution: ratingCounts
    })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    let query = supabase.from('reviews').select('*, users(name)')
    
    if (item_type) {
      query = query.eq('item_type', item_type)
    }
    if (item_id) {
      query = query.eq('item_id', item_id)
    }
    
    const { data: reviews, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Calculate stats
    const allReviews = await supabase
      .from('reviews')
      .select('rating')
      .eq('item_type', item_type || '')
      .eq('item_id', item_id || '')
    
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ;(allReviews.data || []).forEach(r => {
      ratingCounts[r.rating as keyof typeof ratingCounts]++
    })
    
    const totalRating = (allReviews.data || []).reduce((sum, r) => sum + r.rating, 0)
    const avgRating = (allReviews.data || []).length > 0 
      ? totalRating / (allReviews.data || []).length 
      : 0
    
    return NextResponse.json({ 
      reviews: reviews || [],
      total: allReviews.data?.length || 0,
      average_rating: Math.round(avgRating * 10) / 10,
      rating_count: allReviews.data?.length || 0,
      rating_distribution: ratingCounts
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/reviews - สร้างรีวิวใหม่
 */
export async function POST(request: Request) {
  // Check auth - allow unauthenticated for demo
  // const authError = await requireAuth()
  // if (authError) return authError
  
  try {
    const body = await request.json()
    const validatedData = reviewSchema.parse(body)
    
    const newReview = {
      id: `review-${Date.now()}`,
      ...validatedData,
      user_id: 'user-001', // Would come from auth
      user_name: 'Guest User',
      created_at: new Date().toISOString()
    }
    
    // Mock Mode
    if (isMockMode()) {
      mockReviews.push(newReview)
      return NextResponse.json({ review: newReview }, { status: 201 })
    }
    
    // Real Supabase Mode
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        ...validatedData,
        user_id: 'user-001' // Would come from auth
      }])
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ review: data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
