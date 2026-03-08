/**
 * ============================================================
 * Checkout API Tests
 * ============================================================
 */

import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/checkout/route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn()
}))

vi.mock('@/lib/auth', () => ({
  isMockMode: vi.fn(() => true)
}))

vi.mock('@/lib/mock-data', () => ({
  mockDataStore: {
    bookings: [
      {
        id: 'booking-001',
        booking_code: 'TE260301-0001',
        booking_type: 'HOTEL',
        hotel_id: 'hotel-001',
        check_in_date: '2026-04-01',
        check_out_date: '2026-04-03',
        number_of_guests: 2,
        customer_name: 'สมชาย ใจดี',
        customer_email: 'somchai@example.com',
        customer_phone: '0812345678',
        total_price: 7500,
        currency: 'THB',
        status: 'PENDING',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ],
    generateId: vi.fn((prefix) => `${prefix}-${Date.now()}`)
  },
  findMockBookingByCode: vi.fn((code) => {
    if (code === 'TE260301-0001') {
      return {
        id: 'booking-001',
        booking_code: 'TE260301-0001',
        booking_type: 'HOTEL',
        customer_name: 'สมชาย ใจดี',
        total_price: 7500,
        currency: 'THB',
        status: 'PENDING'
      }
    }
    return null
  })
}))

describe('POST /api/checkout', () => {
  it('should create checkout session with booking_code', async () => {
    const request = new NextRequest('http://localhost:3001/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        booking_code: 'TE260301-0001',
        currency: 'THB'
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.url).toBeDefined()
    expect(data.session_id).toBeDefined()
    expect(data.booking_code).toBe('TE260301-0001')
    expect(data.amount).toBe(7500)
    expect(data.currency).toBe('THB')
  })

  it('should create checkout session with booking_id', async () => {
    const request = new NextRequest('http://localhost:3001/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        booking_id: 'booking-001',
        currency: 'THB'
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.url).toBeDefined()
    expect(data.session_id).toBeDefined()
  })

  it('should return 404 for non-existent booking', async () => {
    const request = new NextRequest('http://localhost:3001/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        booking_code: 'NON-EXISTENT',
        currency: 'THB'
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Booking not found')
  })

  it('should return 400 for missing booking_id and booking_code', async () => {
    const request = new NextRequest('http://localhost:3001/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        currency: 'THB'
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    
    expect(response.status).toBe(400)
  })

  it('should accept custom currency', async () => {
    const request = new NextRequest('http://localhost:3001/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        booking_code: 'TE260301-0001',
        currency: 'USD'
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.currency).toBe('USD')
  })
})
