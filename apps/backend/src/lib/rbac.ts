/**
 * ============================================================
 * Role-Based Access Control (RBAC)
 * ============================================================
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Role types
export type UserRole = 'user' | 'partner_hotel' | 'partner_driver' | 'admin'

// Permission definitions
export const rolePermissions: Record<UserRole, string[]> = {
  admin: ['*'],
  user: ['bookings:read', 'bookings:create', 'reviews:create', 'wishlists:*'],
  partner_hotel: ['hotels:*', 'bookings:read', 'reviews:read'],
  partner_driver: ['drivers:*', 'schedules:*', 'bookings:read']
}

/**
 * Check if user has permission
 */
export function hasPermission(role: UserRole, resource: string, action: string): boolean {
  const permissions = rolePermissions[role]
  
  // Admin has all permissions
  if (permissions.includes('*')) return true
  
  // Check specific permission
  return permissions.some(p => {
    if (p === `${resource}:*`) return true
    return p === `${resource}:${action}`
  })
}

/**
 * Get user's role from token
 */
export async function getUserRole(): Promise<UserRole | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value || cookieStore.get('admin_token')?.value
  
  if (!token) return null
  
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    return payload.role || 'user'
  } catch {
    return null
  }
}

/**
 * Get user's partner_id
 */
export async function getUserPartnerId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) return null
  
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    return payload.partner_id || null
  } catch {
    return null
  }
}

/**
 * Middleware helper to check permissions
 */
export async function checkPermission(
  resource: string,
  action: string
): Promise<NextResponse | null> {
  const role = await getUserRole()
  
  if (!role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  if (!hasPermission(role, resource, action)) {
    return NextResponse.json({ error: 'Forbidden - No permission' }, { status: 403 })
  }
  
  return null
}

/**
 * Filter query by user's partner_id
 */
export async function filterByPartner(table: string): Promise<string> {
  const partnerId = await getUserPartnerId()
  const role = await getUserRole()
  
  // Admin sees everything
  if (role === 'admin') return ''
  
  // Filter by partner
  if (partnerId) {
    return ` AND ${table}.partner_id = '${partnerId}'`
  }
  
  return ''
}

/**
 * RBAC Middleware
 */
export async function rbacMiddleware(
  request: NextRequest,
  requiredRole?: UserRole
): Promise<{ allowed: boolean; role?: UserRole; partnerId?: string }> {
  const role = await getUserRole()
  const partnerId = await getUserPartnerId()
  
  if (!role) {
    return { allowed: false }
  }
  
  // Check role requirement
  if (requiredRole && role !== requiredRole && role !== 'admin') {
    return { allowed: false }
  }
  
  return { allowed: true, role, partnerId }
}
