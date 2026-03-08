/**
 * ============================================================
 * Bookings API Tests
 * ============================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/bookings/route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn()
}))

vi.mock('@/lib/auth', () => ({
  isMockMode: vi.fn(() => true),
  requireAuth: vi.fn(() => null)
}))

// Reset mock data before each test
let mockBookings: Array<Record<string, unknown>> = []

vi.mock('@/lib/mock-data', () => ({
  mockDataStore: {
    bookings: [],
    cars: [
      {
        id: 'car-001',
        name_th: 'รถทดสอบ',
        name_en: 'Test Car',
        base_price_per_day: 1500,
        price_per_day: 1500
      }
    ],
    hotels: [
      {
        id: 'hotel-001',
        name_th: 'โรงแรมทดสอบ',
        name_en: 'Test Hotel',
        base_price_per_night: 2500,
        price_per_night: 2500
      }
    ],
    generateId: vi.fn((prefix) => `${prefix}-${Date.now()}`),
    generateBookingCode: vi.fn(() => `TE260301-${Math.random().toString(36).substr(2, 4).toUpperCase()}`)
  },
  findMockHotel: vi.fn((id) => ({
    id: 'hotel-001',
    name_th: 'โรงแรมทดสอบ',
    name_en: 'Test Hotel',
    base_price_per_night: 2500,
    price_per_night: 2500
  })),
  findMockCar: vi.fn((id) => ({
    id: 'car-001',
    name_th: 'รถทดสอบ',
    name_en: 'Test Car',
    base_price_per_day: 1500,
    price_per_day: 1500
  })),
  findMockBookingByCode: vi.fn((code) => {
    return mockBookings.find(b => b.booking_code === code)
  })
}))

describe('GET /api/bookings', () => {
  it('should return all bookings', async () => {
    const request = new NextRequest('http://localhost:3001/api/bookings')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.bookings).toBeDefined()
    expect(Array.isArray(data.bookings)).toBe(true)
  })

  it('should filter bookings by status', async () => {
    const request = new NextRequest('http://localhost:3001/api/bookings?status=PENDING')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    data.bookings.forEach((booking: Record<string, unknown>) => {
      expect(booking.status).toBe('PENDING')
    })
  })

  it('should filter bookings by type', async () => {
    const request = new NextRequest('http://localhost:3001/api/bookings?type=HOTEL')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    data.bookings.forEach((booking: Record<string, unknown>) => {
      expect(booking.booking_type).toBe('HOTEL')
    })
  })
})

describe('POST /api/bookings', () => {
  it('should create a new hotel booking', async () => {
    const request = new NextRequest('http://localhost:3001/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        booking_type: 'HOTEL',
        hotel_id: 'hotel-001',
        check_in_date: '2026-04-01',
        check_out_date: '2026-04-03',
        number_of_guests: 2,
        customer_name: 'สมชาย ใจดี',
        customer_email: 'somchai@example.com',
        customer_phone: '0812345678'
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.booking).toBeDefined()
    expect(data.booking.booking_type).toBe('HOTEL')
    expect(data.booking.hotel_id).toBe('hotel-001')
    expect(data.booking.booking_code).toBeDefined()
    expect(data.booking.status).toBe('PENDING')
  })

  it('should create a new car booking', async () => {
    const request = new NextRequest('http://localhost:3001/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        booking_type: 'CAR',
        car_id: 'car-001',
        check_in_date: '2026-04-01',
        check_out_date: '2026-04-03',
        number_of_guests: 2,
        customer_name: 'สมชาย ใจดี',
        customer_email: 'somchai@example.com',
        customer_phone: '0812345678'
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.booking).toBeDefined()
    expect(data.booking.booking_type).toBe('CAR')
    expect(data.booking.car_id).toBe('car-001')
  })

  it('should calculate correct price for hotel booking', async () => {
    const request = new NextRequest('http://localhost:3001/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        booking_type: 'HOTEL',
        hotel_id: 'hotel-001',
        check_in_date: '2026-04-01',
        check_out_date: '2026-04-04', // 3 nights
        number_of_guests: 2,
        customer_name: 'สมชาย ใจดี',
        customer_email: 'somchai@example.com',
        customer_phone: '0812345678'
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    // 3 nights * 2500 = 7500
    expect(data.booking.total_price).toBe(7500)
  })

  it('should calculate correct price for car booking', async () => {
    const request = new NextRequest('http://localhost:3001/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        booking_type: 'CAR',
        car_id: 'car-001',
        check_in_date: '2026-04-01',
        check_out_date: '2026-04-04', // 3 days
        number_of_guests: 2,
        customer_name: 'สมชาย ใจดี',
        customer_email: 'somchai@example.com',
        customer_phone: '0812345678'
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    // 3 days * 1500 = 4500
    expect(data.booking.total_price).toBe(4500)
  })

  it('should return 400 for invalid booking data', async () => {
    const request = new NextRequest('http://localhost:3001/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        booking_type: 'HOTEL',
        // Missing required fields
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    
    expect(response.status).toBe(400)
  })

  it('should return 400 for invalid email', async () => {
    const request = new NextRequest('http://localhost:3001/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        booking_type: 'HOTEL',
        hotel_id: 'hotel-001',
        check_in_date: '2026-04-01',
        check_out_date: '2026-04-03',
        number_of_guests: 2,
        customer_name: 'สมชาย',
        customer_email: 'invalid-email', // Invalid
        customer_phone: '0812345678'
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    
    expect(response.status).toBe(400)
  })
})
