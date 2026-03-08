/**
 * ============================================================
 * Utilities - ฟังก์ชันทั่วไป
 * ============================================================
 */

/**
 * Format วันที่
 */
export function formatDate(date: string | Date, locale: string = 'th-TH'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d)
}

/**
 * Format วันที่แบบสั้น
 */
export function formatDateShort(date: string | Date, locale: string = 'th-TH'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d)
}

/**
 * คำนวณจำนวนคืน/วัน
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diff = end.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Generate booking code
 */
export function generateBookingCode(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `TE${year}${month}${day}-${random}`
}

/**
 * Paginate array
 */
export function paginate<T>(
  array: T[],
  page: number = 1,
  limit: number = 10
): {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
} {
  const start = (page - 1) * limit
  const end = start + limit
  const data = array.slice(start, end)
  
  return {
    data,
    total: array.length,
    page,
    limit,
    totalPages: Math.ceil(array.length / limit)
  }
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Pick fields from object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * Omit fields from object
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}

/**
 * แปลง object เป็น query string
 */
export function toQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })
  return searchParams.toString()
}

/**
 * Delay function
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry function
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      await delay(delayMs)
      return retry(fn, retries - 1, delayMs * 2)
    }
    throw error
  }
}
