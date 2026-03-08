/**
 * ============================================================
 * Cars API Tests
 * ============================================================
 */

import { describe, it, expect, vi } from 'vitest'
import { GET, POST } from '@/app/api/cars/route'
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
    cars: [
      {
        id: 'car-001',
        name_th: 'รถทดสอบ',
        name_en: 'Test Car',
        description_th: 'รายละเอียดรถภาษาไทย',
        description_en: 'Car description in English',
        car_type_th: 'SUV',
        car_type_en: 'SUV',
        max_passengers: 4,
        price_per_day: 1500,
        base_price_per_day: 1500,
        includes_th: ['ค่าน้ำมัน', 'ประกันภัย'],
        includes_en: ['Fuel', 'Insurance'],
        images: ['https://example.com/car.jpg'],
        currency: 'THB',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ],
    generateId: vi.fn((prefix) => `${prefix}-${Date.now()}`)
  },
  findMockCar: vi.fn((id) => {
    const cars = [
      {
        id: 'car-001',
        name_th: 'รถทดสอบ',
        name_en: 'Test Car',
        description_th: 'รายละเอียดรถภาษาไทย',
        description_en: 'Car description in English',
        car_type_th: 'SUV',
        car_type_en: 'SUV',
        max_passengers: 4,
        price_per_day: 1500,
        base_price_per_day: 1500,
        includes_th: ['ค่าน้ำมัน', 'ประกันภัย'],
        includes_en: ['Fuel', 'Insurance'],
        images: ['https://example.com/car.jpg'],
        currency: 'THB',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]
    return cars.find(c => c.id === id)
  })
}))

describe('GET /api/cars', () => {
  it('should return all cars in mock mode', async () => {
    const request = new NextRequest('http://localhost:3001/api/cars')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.cars).toBeDefined()
    expect(Array.isArray(data.cars)).toBe(true)
    expect(data.total).toBeGreaterThanOrEqual(0)
  })

  it('should filter active cars when active=true', async () => {
    const request = new NextRequest('http://localhost:3001/api/cars?active=true')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    if (data.cars.length > 0) {
      data.cars.forEach((car: Record<string, unknown>) => {
        expect(car.is_active).toBe(true)
      })
    }
  })

  it('should return cars in English when lang=en', async () => {
    const request = new NextRequest('http://localhost:3001/api/cars?lang=en')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    if (data.cars.length > 0) {
      expect(data.cars[0].name).toBe('Test Car')
    }
  })

  it('should return cars in Thai by default', async () => {
    const request = new NextRequest('http://localhost:3001/api/cars')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    if (data.cars.length > 0) {
      expect(data.cars[0].name).toBe('รถทดสอบ')
    }
  })
})

describe('POST /api/cars', () => {
  it('should create a new car', async () => {
    const request = new NextRequest('http://localhost:3001/api/cars', {
      method: 'POST',
      body: JSON.stringify({
        name_th: 'รถใหม่',
        name_en: 'New Car',
        description_th: 'รายละเอียดรถใหม่',
        description_en: 'New car description',
        car_type_th: 'รถหรู',
        car_type_en: 'Luxury',
        max_passengers: 2,
        base_price_per_day: 5000,
        includes_th: ['ประกันภัย', 'ค่าคนขับ'],
        includes_en: ['Insurance', 'Driver'],
        images: ['https://example.com/new-car.jpg'],
        currency: 'THB',
        is_active: true
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.car).toBeDefined()
    expect(data.car.name_th).toBe('รถใหม่')
    expect(data.car.name_en).toBe('New Car')
  })

  it('should return 400 for invalid car data', async () => {
    const request = new NextRequest('http://localhost:3001/api/cars', {
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
