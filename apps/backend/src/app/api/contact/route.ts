/**
 * ============================================================
 * Contact Form API - ฟอร์มติดต่อเรา
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode } from '@/lib/auth'
import { z } from 'zod'

// Validation Schema
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  type: z.enum(['general', 'booking', 'support', 'partnership']).optional()
})

/**
 * POST /api/contact - ส่งข้อความติดต่อ
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = contactSchema.parse(body)
    
    // Mock Mode
    if (isMockMode()) {
      const newContact = {
        id: `contact-${Date.now()}`,
        ...data,
        status: 'PENDING',
        created_at: new Date().toISOString()
      }
      
      // Log for demo
      console.log('[Contact Form Submission]', newContact)
      
      return NextResponse.json({ 
        success: true,
        message: 'Thank you for contacting us! We will get back to you soon.',
        contact_id: newContact.id
      }, { status: 201 })
    }
    
    // Real Supabase Mode
    const supabase = await createAdminClient()
    const { data: contact, error } = await supabase
      .from('contacts')
      .insert([data])
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    // Send email notification to admin
    try {
      const { sendEmail } = await import('@/services/notifications/email')
      await sendEmail({
        to: 'admin@gotjourneythailand.com',
        subject: `New Contact: ${data.subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone || '-'}</p>
          <p><strong>Type:</strong> ${data.type || 'general'}</p>
          <p><strong>Message:</strong></p>
          <p>${data.message}</p>
        `
      })
    } catch (emailError) {
      console.error('Email notification failed:', emailError)
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      contact_id: contact.id
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/contact - ดูข้อความ (Admin only)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  
  // Mock Mode
  if (isMockMode()) {
    return NextResponse.json({
      contacts: [],
      total: 0
    })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    let query = supabase.from('contacts').select('*').order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data: contacts, error } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ contacts, total: contacts?.length || 0 })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
