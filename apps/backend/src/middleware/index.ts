/**
 * ============================================================
 * Combined Middleware - รวม middleware ทั้งหมด
 * ============================================================
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Import individual middlewares
import { rateLimitMiddleware } from './rate-limit'
import { corsMiddleware } from './cors'

/**
 * Main middleware function
 * รวม CORS, Rate Limiting, และ Authentication
 */
export async function middleware(request: NextRequest) {
  // 1. Apply CORS
  const corsResponse = corsMiddleware(request)
  if (corsResponse.headers.get('access-control-allow-origin')) {
    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse
    }
  }

  // 2. Apply Rate Limiting
  const rateLimitResponse = rateLimitMiddleware(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  // 3. Continue to route handler
  return NextResponse.next()
}

/**
 * Configure which routes to run middleware on
 */
export const config = {
  matcher: [
    '/api/:path*',
  ],
}
