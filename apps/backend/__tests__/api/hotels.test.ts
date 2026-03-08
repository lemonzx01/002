/**
 * ============================================================
 * Hotels API Tests
 * ============================================================
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/app/api/hotels/route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn()
}))

vi.mock('@/lib/auth', () => ({
  isMockMode: vi.fn(() => true),
  requireAdmin: vi.fn(() => null)
}))

vi.mock('@/lib/mock-data', () => ({
  mockDataStore: {
    hotels: [
      {
        id: 'hotel-001',
        name_th: 'โรงแรมทดสอบ',
        name_en: 'Test Hotel',
        description_th: 'รายละเอียดภาษาไทย',
        description_en: 'English description',
        location_th: 'เชียงราย',
        location_en: 'Chiang Rai',
        star_rating: 4,
        price_per_night: 2500,
        base_price_per_night: 2500,
        max_guests: 2,
        room_type_th: 'ห้องดีลักซ์',
        room_type_en: 'Deluxe Room',
        amenities_th: ['WiFi', 'สระว่ายน้ำ'],
        amenities_en: ['WiFi', 'Swimming Pool'],
        images: ['https://example.com/image.jpg'],
        currency: 'THB',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ],
    generateId: vi.fn((prefix) => `${prefix}-${Date.now()}`)
  },
  findMockHotel: vi.fn((id) => {
    const hotels = [
      {
        id: 'hotel-001',
        name_th: 'โรงแรมทดสอบ',
        name_en: 'Test Hotel',
        description_th: 'รายละเอียดภาษาไทย',
        description_en: 'English description',
        location_th: 'เชียงราย',
        location_en: 'Chiang Rai',
        star_rating: 4,
        price_per_night: 2500,
        base_price_per_night: 2500,
        max_guests: 2,
        room_type_th: 'ห้องดีลักซ์',
        room_type_en: 'Deluxe Room',
        amenities_th: ['WiFi', 'สระว่ายน้ำ'],
        amenities_en: ['WiFi', 'Swimming Pool'],
        images: ['https://example.com/image.jpg'],
        currency: 'THB',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]
    return hotels.find(h => h.id === id)
  })
}))

describe('GET /api/hotels', () => {
  it('should return all hotels in mock mode', async () => {
    const request = new NextRequest('http://localhost:3001/api/hotels')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.hotels).toBeDefined()
    expect(Array.isArray(data.hotels)).toBe(true)
    expect(data.total).toBeGreaterThanOrEqual(0)
  })

  it('should filter active hotels when active=true', async () => {
    const request = new NextRequest('http://localhost:3001/api/hotels?active=true')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    if (data.hotels.length > 0) {
      data.hotels.forEach((hotel: Record<string, unknown>) => {
        expect(hotel.is_active).toBe(true)
      })
    }
  })

  it('should return hotels in English when lang=en', async () => {
    const request = new NextRequest('http://localhost:3001/api/hotels?lang=en')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    if (data.hotels.length > 0) {
      expect(data.hotels[0].name).toBe('Test Hotel')
    }
  })

  it('should return hotels in Thai by default', async () => {
    const request = new NextRequest('http://localhost:3001/api/hotels')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    if (data.hotels.length > 0) {
      expect(data.hotels[0].name).toBe('โรงแรมทดสอบ')
    }
  })
})

describe('POST /api/hotels', () => {
  it('should create a new hotel', async () => {
    const request = new NextRequest('http://localhost:3001/api/hotels', {
      method: 'POST',
      body: JSON.stringify({
        name_th: 'โรงแรมใหม่',
        name_en: 'New Hotel',
        description_th: 'รายละเอียดใหม่',
        description_en: 'New description',
        location_th: 'กรุงเทพ',
        location_en: 'Bangkok',
        star_rating: 5,
        base_price_per_night: 5000,
        max_guests: 4,
        room_type_th: 'ห้องสวีท',
        room_type_en: 'Suite Room',
        amenities_th: ['WiFi', 'สระว่ายน้ำ', 'Spa'],
        amenities_en: ['WiFi', 'Swimming Pool', 'Spa'],
        images: ['https://example.com/new.jpg'],
        currency: 'THB',
        is_active: true
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.hotel).toBeDefined()
    expect(data.hotel.name_th).toBe('โรงแรมใหม่')
    expect(data.hotel.name_en).toBe('New Hotel')
  })

  it('should return 400 for invalid hotel data', async () => {
    const request = new NextRequest('http://localhost:3001/api/hotels', {
      method: 'POST',
      body: JSON.stringify({
        name_th: '', // Invalid: empty name
        name_en: ''
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    
    expect(response.status).toBe(400)
  })
})
