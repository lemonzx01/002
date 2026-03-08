/**
 * ============================================================
 * Mock Data - ข้อมูลสำหรับ Development/Demo Mode
 * ============================================================
 */

import type { Hotel, Car, Booking, Payment, User, Admin } from '@chiangrai/shared'

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-001',
    email: 'user@example.com',
    password_hash: '$2a$10$xQZ8H3K9qP2vX5Y7Z8Y9Zu6F5s4T6U7V8W9X0Y1Z2A3B4C5D6E7F8G', // user123
    name: 'John Doe',
    role: 'user',
    email_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-002',
    email: 'validUserPass123@example.com',
    password_hash: '$2a$10$xQZ8H3K9qP2vX5Y7Z8Y9Zu6F5s4T6U7V8W9X0Y1Z2A3B4C5D6E7F8G',
    name: 'Jane Smith',
    role: 'user',
    email_verified: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 'partner-001',
    email: 'hotel@example.com',
    password_hash: '$2a$10$xQZ8H3K9qP2vX5Y7Z8Y9Zu6F5s4T6U7V8W9X0Y1Z2A3B4C5D6E7F8G', // user123
    name: 'Hotel Partner',
    role: 'partner',
    email_verified: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  }
]

// Mock Admins
export const mockAdmins: Admin[] = [
  {
    id: 'admin-001',
    email: 'admin@gotjourneythailand.com',
    password_hash: '$2a$10$xQZ8H3K9qP2vX5Y7Z8Y9Zu6F5s4T6U7V8W9X0Y1Z2A3B4C5D6E7F8G', // admin123
    name: 'Admin User',
    role: 'super_admin',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

// Mock Hotels
export const mockHotels: Hotel[] = [
  {
    id: 'hotel-001',
    name_th: 'โรงแรมเชียงราย ริเวอร์ไซด์',
    name_en: 'Chiangrai Riverside Hotel',
    description_th: 'โรงแรมหรูริมแม่น้ำกก วิวสวย บรรยากาศดี',
    description_en: 'Luxury hotel by Kok River with beautiful views',
    location_th: 'เชียงราษฏร์, เชียงราย',
    location_en: 'Chiang Rai, Chiang Rai',
    star_rating: 4,
    price_per_night: 2500,
    base_price_per_night: 2500,
    max_guests: 2,
    room_type_th: 'ห้องดีลักซ์',
    room_type_en: 'Deluxe Room',
    amenities_th: ['WiFi', 'สระว่ายน้ำ', 'อาหารเช้า', 'ที่จอดรถ', 'บริการนวด'],
    amenities_en: ['WiFi', 'Swimming Pool', 'Breakfast', 'Parking', 'Massage Service'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'
    ],
    currency: 'THB',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'hotel-002',
    name_th: 'รีสอร์ทสุดใจที่เชียงราย',
    name_en: 'The Heart Chiangrai Resort',
    description_th: 'รีสอร์ทสุดหรู วิวเขา สงบ ราคาคุ้มค่า',
    description_en: 'Luxury resort with mountain views, peaceful atmosphere',
    location_th: 'แม่จัน, เชียงราย',
    location_en: 'Mae Chan, Chiang Rai',
    star_rating: 5,
    price_per_night: 5500,
    base_price_per_night: 5500,
    max_guests: 4,
    room_type_th: 'ห้องสวีท',
    room_type_en: 'Suite Room',
    amenities_th: ['WiFi', 'สระว่ายน้ำ', 'อาหารเช้า', 'Spa', 'ฟิตเนส', 'ร้านอาหาร'],
    amenities_en: ['WiFi', 'Swimming Pool', 'Breakfast', 'Spa', 'Fitness', 'Restaurant'],
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
    ],
    currency: 'THB',
    is_active: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 'hotel-003',
    name_th: 'โฮสเทลเชียงราย ทาวเวอร์',
    name_en: 'Chiangrai Tower Hostel',
    description_th: 'โฮสเทลราคาประหยัด สะอาด อบอุ่น',
    description_en: 'Budget hostel, clean and cozy',
    location_th: 'เมืองเชียงราย',
    location_en: 'Chiang Rai City',
    star_rating: 3,
    price_per_night: 600,
    base_price_per_night: 600,
    max_guests: 1,
    room_type_th: 'เตียงเดี่ยว',
    room_type_en: 'Single Bed',
    amenities_th: ['WiFi', 'ที่จอดรถ', 'ห้องน้ำรวม'],
    amenities_en: ['WiFi', 'Parking', 'Shared Bathroom'],
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
    ],
    currency: 'THB',
    is_active: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  }
]

// Mock Cars
export const mockCars: Car[] = [
  {
    id: 'car-001',
    name_th: 'โตโยต้า คัมรี แท็กซิ',
    name_en: 'Toyota Camry Taxi',
    description_th: 'รถยนต์สาธารณะ บริการทั่วเชียงราย',
    description_en: 'Public taxi service around Chiang Rai',
    car_type_th: 'แท็กซี่',
    car_type_en: 'Taxi',
    max_passengers: 4,
    price_per_day: 1500,
    base_price_per_day: 1500,
    includes_th: ['ค่าน้ำมัน', 'ประกันภัย', 'ค่าคนขับ'],
    includes_en: ['Fuel', 'Insurance', 'Driver'],
    images: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800'
    ],
    currency: 'THB',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'car-002',
    name_th: 'มิตซูบิชิ ปาเจโร',
    name_en: 'Mitsubishi Pajero',
    description_th: 'รถ SUV 4WD เหมาะสำหรับทริปภาคเหนือ',
    description_en: '4WD SUV perfect for Northern Thailand trips',
    car_type_th: 'SUV',
    car_type_en: 'SUV',
    max_passengers: 7,
    price_per_day: 2500,
    base_price_per_day: 2500,
    includes_th: ['ประกันภัย', 'ไม่รวมน้ำมัน'],
    includes_en: ['Insurance', 'Excludes fuel'],
    images: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800'
    ],
    currency: 'THB',
    is_active: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 'car-003',
    name_th: 'เบนซ์ ซี คลาส',
    name_en: 'Mercedes-Benz C-Class',
    description_th: 'รถหรู สำหรับงานพิเศษ รับ-ส่ง สนามบิน',
    description_en: 'Luxury car for special occasions, airport transfer',
    car_type_th: 'รถหรู',
    car_type_en: 'Luxury',
    max_passengers: 3,
    price_per_day: 5000,
    base_price_per_day: 5000,
    includes_th: ['ประกันภัย', 'ค่าคนขับ', 'อาหารเช้า'],
    includes_en: ['Insurance', 'Driver', 'Breakfast'],
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'
    ],
    currency: 'THB',
    is_active: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  }
]

// Mock Bookings
export const mockBookings: Booking[] = [
  {
    id: 'booking-001',
    booking_code: 'TE260301-0001',
    booking_type: 'HOTEL',
    hotel_id: 'hotel-001',
    check_in_date: '2026-03-15',
    check_out_date: '2026-03-18',
    number_of_guests: 2,
    customer_name: 'สมชาย ใจดี',
    customer_email: 'somchai@example.com',
    customer_phone: '0812345678',
    total_price: 7500,
    currency: 'THB',
    status: 'CONFIRMED',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z'
  },
  {
    id: 'booking-002',
    booking_code: 'TE260301-0002',
    booking_type: 'CAR',
    car_id: 'car-002',
    check_in_date: '2026-03-20',
    check_out_date: '2026-03-25',
    number_of_guests: 4,
    customer_name: 'วิชัย มาดี',
    customer_email: 'vichai@example.com',
    customer_phone: '0898765432',
    customer_line: 'vichai123',
    total_price: 12500,
    currency: 'THB',
    status: 'PAID',
    created_at: '2026-03-02T14:30:00Z',
    updated_at: '2026-03-03T09:00:00Z'
  }
]

// Mock Payments
export const mockPayments: Payment[] = [
  {
    id: 'payment-001',
    booking_id: 'booking-002',
    stripe_checkout_session_id: 'cs_test_demo123',
    amount: 1250000, // in satang
    currency: 'THB',
    status: 'SUCCEEDED',
    paid_at: '2026-03-03T09:00:00Z',
    created_at: '2026-03-02T14:30:00Z',
    updated_at: '2026-03-03T09:00:00Z'
  }
]

// Helper functions
export function findMockUser(email: string): User | undefined {
  return mockUsers.find(u => u.email === email)
}

export function findMockAdmin(email: string): Admin | undefined {
  return mockAdmins.find(a => a.email === email)
}

export function findMockHotel(id: string): Hotel | undefined {
  return mockHotels.find(h => h.id === id)
}

export function findMockCar(id: string): Car | undefined {
  return mockCars.find(c => c.id === id)
}

export function findMockBooking(id: string): Booking | undefined {
  return mockBookings.find(b => b.id === id)
}

export function findMockBookingByCode(code: string): Booking | undefined {
  return mockBookings.find(b => b.booking_code === code)
}

// In-memory storage for new data (for demo mode)
export const mockDataStore = {
  hotels: [...mockHotels],
  cars: [...mockCars],
  bookings: [...mockBookings],
  payments: [...mockPayments],
  users: [...mockUsers],
  admins: [...mockAdmins],
  
  // Generate IDs
  generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
  
  generateBookingCode(): string {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const count = this.bookings.length + 1
    return `TE26${month}${day}-${String(count).padStart(4, '0')}`
  }
}
