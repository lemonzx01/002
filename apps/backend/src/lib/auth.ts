/**
 * ============================================================
 * Auth Utilities - ฟังก์ชันจัดการ Authentication
 * ============================================================
 */

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'development-secret-key-minimum-32-characters-long'
)

/**
 * ตรวจสอบว่าเป็น Mock Mode หรือไม่
 */
export function isMockMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL
}

/**
 * สร้าง JWT Token
 */
export async function signToken(payload: Record<string, unknown>, expiresIn = '7d'): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET)
}

/**
 * ตรวจสอบ JWT Token
 */
export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as Record<string, unknown>
  } catch {
    return null
  }
}

/**
 * ดึง JWT Secret
 */
export function getJwtSecret(): Uint8Array {
  return JWT_SECRET
}

/**
 * ตรวจสอบว่าผู้ใช้เข้าสู่ระบบหรือไม่
 */
export async function getCurrentUser(request: NextRequest): Promise<Record<string, unknown> | null> {
  const token = request.cookies.get('auth_token')?.value
  
  if (!token) {
    return null
  }
  
  return verifyToken(token)
}

/**
 * ตรวจสอบว่าเป็น Admin หรือไม่
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  return null
}

/**
 * ตรวจสอบว่าเป็น User หรือ Admin
 */
export async function requireAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value || cookieStore.get('admin_token')?.value
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const payload = await verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
  
  return null
}
