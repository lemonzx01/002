/**
 * ============================================================
 * Payments API - จัดการข้อมูลการชำระเงิน
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode, requireAdmin } from '@/lib/auth'
import { mockDataStore } from '@/lib/mock-data'
import { z } from 'zod'

// Validation Schema
const paymentSchema = z.object({
  booking_id: z.string(),
  amount: z.number().positive(),
  currency: z.string().optional(),
  status: z.enum(['PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED']).optional()
})

/**
 * GET /api/payments - ดูรายการการชำระเงิน (Admin only)
 */
export async function GET(request: Request) {
  const authError = await requireAdmin()
  if (authError) return authError
  
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const booking_id = searchParams.get('booking_id')
  
  // Mock Mode
  if (isMockMode()) {
    let payments = [...mockDataStore.payments]
    
    if (status) {
      payments = payments.filter(p => p.status === status)
    }
    if (booking_id) {
      payments = payments.filter(p => p.booking_id === booking_id)
    }
    
    // Add booking details
    const paymentsWithDetails = payments.map(p => {
      const payment: Record<string, unknown> = { ...p }
      const booking = mockDataStore.bookings.find(b => b.id === p.booking_id)
      if (booking) {
        payment.booking = booking
      }
      return payment
    })
    
    return NextResponse.json({ payments: paymentsWithDetails, total: paymentsWithDetails.length })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    let query = supabase.from('payments').select('*, bookings(*)')
    
    if (status) {
      query = query.eq('status', status)
    }
    if (booking_id) {
      query = query.eq('booking_id', booking_id)
    }
    
    const { data: payments, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ payments, total: payments?.length || 0 })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/payments - บันทึกการชำระเงิน (มักจะถูกเรียกจาก Stripe Webhook)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = paymentSchema.parse({
      ...body,
      currency: body.currency || 'THB'
    })
    
    // Mock Mode
    if (isMockMode()) {
      const newPayment = {
        id: mockDataStore.generateId('payment'),
        ...validatedData,
        amount: validatedData.amount * 100, // Convert to satang
        stripe_checkout_session_id: `cs_test_${Date.now()}`,
        status: validatedData.status || 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      mockDataStore.payments.push(newPayment)
      
      // Update booking status if payment succeeded
      if (validatedData.status === 'SUCCEEDED') {
        const bookingIndex = mockDataStore.bookings.findIndex(b => b.id === validatedData.booking_id)
        if (bookingIndex !== -1) {
          mockDataStore.bookings[bookingIndex].status = 'PAID'
          mockDataStore.bookings[bookingIndex].updated_at = new Date().toISOString()
        }
      }
      
      return NextResponse.json({ payment: newPayment }, { status: 201 })
    }
    
    // Real Supabase Mode
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        ...validatedData,
        amount: validatedData.amount * 100 // Convert to satang
      }])
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ payment: data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
