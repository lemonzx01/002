/**
 * ============================================================
 * Validations - ฟังก์ชันตรวจสอบข้อมูล
 * ============================================================
 */

import { z } from 'zod'

/**
 * Schema สำหรับ Login
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

/**
 * Schema สำหรับ Register
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional()
})

/**
 * Schema สำหรับ Hotel
 */
export const hotelSchema = z.object({
  name_th: z.string().min(1, 'Name (TH) is required'),
  name_en: z.string().min(1, 'Name (EN) is required'),
  description_th: z.string().optional(),
  description_en: z.string().optional(),
  location_th: z.string().optional(),
  location_en: z.string().optional(),
  star_rating: z.number().min(1).max(5).optional(),
  price_per_night: z.number().positive().optional(),
  base_price_per_night: z.number().positive().optional(),
  max_guests: z.number().positive().optional(),
  room_type_th: z.string().optional(),
  room_type_en: z.string().optional(),
  amenities_th: z.array(z.string()).optional(),
  amenities_en: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  currency: z.string().optional(),
  is_active: z.boolean().optional()
})

/**
 * Schema สำหรับ Car
 */
export const carSchema = z.object({
  name_th: z.string().min(1, 'Name (TH) is required'),
  name_en: z.string().min(1, 'Name (EN) is required'),
  description_th: z.string().optional(),
  description_en: z.string().optional(),
  car_type_th: z.string().optional(),
  car_type_en: z.string().optional(),
  max_passengers: z.number().positive().optional(),
  price_per_day: z.number().positive().optional(),
  base_price_per_day: z.number().positive().optional(),
  includes_th: z.array(z.string()).optional(),
  includes_en: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  driver_name: z.string().optional(),
  driver_surname: z.string().optional(),
  currency: z.string().optional(),
  is_active: z.boolean().optional()
})

/**
 * Schema สำหรับ Booking
 */
export const bookingSchema = z.object({
  booking_type: z.enum(['HOTEL', 'CAR', 'COMBO']),
  hotel_id: z.string().optional(),
  car_id: z.string().optional(),
  room_type_id: z.string().optional(),
  check_in_date: z.string(),
  check_out_date: z.string(),
  number_of_guests: z.number().positive(),
  customer_name: z.string().min(1, 'Name is required'),
  customer_email: z.string().email('Invalid email'),
  customer_phone: z.string().min(1, 'Phone is required'),
  customer_line: z.string().optional(),
  special_requests: z.string().optional()
})

/**
 * Schema สำหรับ Review
 */
export const reviewSchema = z.object({
  item_type: z.enum(['hotel', 'car']),
  item_id: z.string(),
  rating: z.number().min(1).max(5),
  comment_th: z.string().optional(),
  comment_en: z.string().optional()
})

/**
 * Schema สำหรับ Checkout
 */
export const checkoutSchema = z.object({
  booking_id: z.string().optional(),
  booking_code: z.string().optional(),
  currency: z.string().optional()
}).refine(data => data.booking_id || data.booking_code, {
  message: 'Either booking_id or booking_code is required'
})

/**
 * Validate และ return errors
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
} {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  const errors: Record<string, string[]> = {}
  result.error.errors.forEach(err => {
    const path = err.path.join('.')
    if (!errors[path]) {
      errors[path] = []
    }
    errors[path].push(err.message)
  })
  
  return { success: false, errors }
}
