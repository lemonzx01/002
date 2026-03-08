/**
 * ============================================================
 * Stripe Webhook - รับการแจ้งเตือนจาก Stripe
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode } from '@/lib/auth'
import { headers } from 'next/headers'

/**
 * POST /api/webhooks/stripe
 * 
 * Stripe webhook สำหรับ:
 * - checkout.session.completed → ชำระเงินสำเร็จ
 * - payment_intent.succeeded → ชำระเงินสำเร็จ
 * - payment_intent.payment_failed → ชำระเงินไม่สำเร็จ
 * - charge.refunded → คืนเงิน
 */
export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  // Get webhook secret
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  
  // Mock mode - just log and return success
  if (isMockMode() || !webhookSecret) {
    try {
      const event = JSON.parse(body)
      console.log('[Mock Webhook]', event.type)
      
      // Process mock event
      return processWebhookEvent(event)
    } catch (error) {
      console.error('Webhook error:', error)
      return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
    }
  }

  // Verify signature and process real event
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-01-27.acacia'
    })

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    return processWebhookEvent(event)
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}

/**
 * Process webhook event
 */
async function processWebhookEvent(event: Record<string, unknown>) {
  const supabase = await createAdminClient()
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data?.object as Record<string, unknown>
      const bookingId = session?.metadata?.booking_id as string
      const bookingCode = session?.metadata?.booking_code as string
      
      if (bookingId || bookingCode) {
        // Update booking status to PAID
        if (bookingId) {
          await supabase
            .from('bookings')
            .update({ 
              status: 'PAID',
              updated_at: new Date().toISOString()
            })
            .eq('id', bookingId)
        } else if (bookingCode) {
          await supabase
            .from('bookings')
            .update({ 
              status: 'PAID',
              updated_at: new Date().toISOString()
            })
            .eq('booking_code', bookingCode)
        }

        // Create payment record
        await supabase.from('payments').insert([{
          booking_id: bookingId,
          stripe_checkout_session_id: session?.id,
          amount: session?.amount_total || 0,
          currency: session?.currency?.toUpperCase() || 'THB',
          status: 'SUCCEEDED',
          paid_at: new Date().toISOString()
        }])

        console.log(`✅ Booking ${bookingCode || bookingId} marked as PAID`)
      }
      break
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data?.object as Record<string, unknown>
      console.log('Payment succeeded:', paymentIntent?.id)
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data?.object as Record<string, unknown>
      const bookingId = paymentIntent?.metadata?.booking_id
      
      if (bookingId) {
        await supabase
          .from('bookings')
          .update({ 
            status: 'CANCELLED',
            cancellation_reason: 'Payment failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', bookingId)
      }
      console.log('Payment failed:', paymentIntent?.id)
      break
    }

    case 'charge.refunded': {
      const charge = event.data?.object as Record<string, unknown>
      const paymentIntentId = charge?.payment_intent as string
      
      if (paymentIntentId) {
        // Update payment status
        await supabase
          .from('payments')
          .update({ 
            status: 'REFUNDED',
            refunded_at: new Date().toISOString(),
            refund_amount: charge?.amount
          })
          .eq('stripe_payment_intent_id', paymentIntentId)
      }
      console.log('Payment refunded:', charge?.id)
      break
    }

    default:
      console.log('Unhandled event type:', event.type)
  }

  return NextResponse.json({ received: true })
}

/**
 * GET /api/webhooks/stripe - Health check
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Stripe webhook endpoint',
    supported_events: [
      'checkout.session.completed',
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'charge.refunded'
    ]
  })
}
