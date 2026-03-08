/**
 * ============================================================
 * Security Utilities - ฟังก์ชันความปลอดภัย
 * ============================================================
 */

/**
 * ตรวจสอบ UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * ตรวจสอบ Email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * ตรวจสอบเบอร์โทรศัพท์ไทย
 */
export function isValidThaiPhone(phone: string): boolean {
  const phoneRegex = /^(\+66|0)[89]\d{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * ตรวจสอบ URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * ทำให้ข้อมูลปลอดภัย (sanitize)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

/**
 * Hash ข้อมูล (simple)
 */
export function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

/**
 * สร้าง random string
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * ตรวจสอบ password strength
 */
export function checkPasswordStrength(password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  if (password.length >= 8) score += 1
  else feedback.push('Password should be at least 8 characters')
  
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Add lowercase letters')
  
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Add uppercase letters')
  
  if (/[0-9]/.test(password)) score += 1
  else feedback.push('Add numbers')
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  else feedback.push('Add special characters')
  
  return {
    isValid: score >= 3,
    score,
    feedback
  }
}
