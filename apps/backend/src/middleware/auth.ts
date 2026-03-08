/**
 * ============================================================
 * Auth Middleware - ป้องกัน routes ที่ต้องการ login
 * ============================================================
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = [
  '/api/wishlist',
  '/api/bookings',
]

// Routes that require admin authentication
const adminRoutes = [
  '/api/hotels',
  '/api/cars',
  '/api/payments',
  '/api/admin',
  '/api/upload',
]

// Public routes (no auth required)
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/hotels',
  '/api/cars',
  '/api/search',
  '/api/reviews',
  '/api/calendar',
  '/api/checkout',
  '/api/webhooks',
]

/**
 * Check if route requires authentication
 */
function requiresAuth(path: string): boolean {
  return protectedRoutes.some(route => path.startsWith(route))
}

/**
 * Check if route requires admin authentication
 */
function requiresAdmin(path: string): boolean {
  return adminRoutes.some(route => {
    // Special handling for /api/hotels and /api/cars - only POST/PUT/DELETE require admin
    if (route === '/api/hotels' || route === '/api/cars') {
      return path.startsWith(route) && !path.endsWith('/') && !path.match(/\?/)
    }
    return path.startsWith(route)
  })
}

/**
 * Extract token from request
 */
function getToken(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Check cookies
  return request.cookies.get('auth_token')?.value || 
         request.cookies.get('admin_token')?.value ||
         null
}

/**
 * Verify JWT token (simple version)
 */
function verifyToken(token: string): { valid: boolean; role?: string } {
  if (!token) {
    return { valid: false }
  }

  try {
    // Simple verification - in production use proper JWT verification
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false }
    }

    // Decode payload (base64)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())

    // Check expiration
    if (payload.exp && Date.now() > payload.exp * 1000) {
      return { valid: false }
    }

    return { valid: true, role: payload.role }
  } catch {
    return { valid: false }
  }
}

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip non-API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // For protected methods on public routes, check if it's write operation
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
      // These should be protected in the route handlers
    }
    return NextResponse.next()
  }

  // Get token
  const token = getToken(request)
  
  // Check authentication for protected routes
  if (requiresAuth(pathname)) {
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const verification = verifyToken(token)
    if (!verification.valid) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
  }

  // Check admin authentication for admin routes
  if (requiresAdmin(pathname)) {
    if (!token) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    }

    const verification = verifyToken(token)
    if (!verification.valid || verification.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
  }

  // Continue to the route
  return NextResponse.next()
}

/**
 * Configure which routes to run middleware on
 */
export const config = {
  matcher: [
    '/api/:path*'
  ]
}
