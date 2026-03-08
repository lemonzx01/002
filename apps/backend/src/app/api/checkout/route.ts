/**
 * ============================================================
 * Checkout API - สร้าง Stripe Checkout Session
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode } from '@/lib/auth'
import { mockDataStore, findMockBookingByCode } from '@/lib/mock-data'
import { z } from 'zod'

// Validation Schema
const checkoutSchema = z.object({
  booking_id: z.string().optional(),
  booking_code: z.string().optional(),
  currency: z.string().optional()
})

/**
 * POST /api/checkout - สร้าง Stripe Checkout Session
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { booking_id, booking_code, currency = 'THB' } = checkoutSchema.parse(body)
    
    // Find booking
    let booking: Record<string, unknown> | null = null
    
    // Mock Mode
    if (isMockMode()) {
      if (booking_code) {
        booking = findMockBookingByCode(booking_code) as Record<string, unknown>
      } else if (booking_id) {
        booking = mockDataStore.bookings.find(b => b.id === booking_id) as Record<string, unknown>
      }
      
      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }
      
      // In mock mode, return a mock checkout URL
      const mockCheckoutUrl = new URL('/checkout/success', request.url)
      mockCheckoutUrl.searchParams.set('booking_code', booking.booking_code as string)
      mockCheckoutUrl.searchParams.set('demo', 'true')
      
      return NextResponse.json({
        url: mockCheckoutUrl.toString(),
        session_id: `cs_test_demo_${Date.now()}`,
        booking_code: booking.booking_code,
        amount: booking.total_price,
        currency
      })
    }
    
    // Real Stripe Mode
    const supabase = await createAdminClient()
    
    // Get booking
    let query = supabase.from('bookings').select('*')
    if (booking_code) {
      query = query.eq('booking_code', booking_code)
    } else if (booking_id) {
      query = query.eq('id', booking_id)
    }
    
    const { data: bookingData, error: bookingError } = await query.single()
    
    if (bookingError || !bookingData) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    booking = bookingData as Record<string, unknown>
    
    // Check if Stripe is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      // Fallback to mock mode if Stripe not configured
      const mockCheckoutUrl = new URL('/checkout/success', request.url)
      mockCheckoutUrl.searchParams.set('booking_code', booking.booking_code as string)
      mockCheckoutUrl.searchParams.set('demo', 'true')
      
      return NextResponse.json({
        url: mockCheckoutUrl.toString(),
        session_id: `cs_test_demo_${Date.now()}`,
        booking_code: booking.booking_code,
        amount: booking.total_price,
        currency,
        warning: 'Stripe not configured, using demo mode'
      })
    }
    
    // Import Stripe
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-01-27.acacia'
    })
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'promptpay'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Booking ${booking.booking_code}`,
              description: `Hotel/Car booking for ${booking.customer_name}`
            },
            unit_amount: Math.round((booking.total_price as number) * 100)
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}&booking_code=${booking.booking_code}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout?booking_code=${booking.booking_code}`,
      metadata: {
        booking_id: booking.id as string,
        booking_code: booking.booking_code as string
      }
    })
    
    return NextResponse.json({
      url: session.url,
      session_id: session.id,
      booking_code: booking.booking_code,
      amount: booking.total_price,
      currency
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating checkout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
