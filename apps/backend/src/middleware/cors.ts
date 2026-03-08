/**
 * ============================================================
 * CORS Configuration - ตั้งค่า Cross-Origin Resource Sharing
 * ============================================================
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Allowed origins (configure for production)
 */
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ]

/**
 * Allowed methods
 */
const allowedMethods = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
]

/**
 * Allowed headers
 */
const allowedHeaders = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'X-CSRF-Token',
  'Accept-Language',
]

/**
 * Exposed headers (accessible by client)
 */
const exposedHeaders = [
  'X-Total-Count',
  'X-Page-Count',
  'X-Current-Page',
]

/**
 * CORS middleware
 */
export function corsMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only apply CORS to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Get origin from request
  const origin = request.headers.get('origin')
  const isAllowedOrigin = origin && allowedOrigins.includes(origin)

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
        'Access-Control-Allow-Methods': allowedMethods.join(', '),
        'Access-Control-Allow-Headers': allowedHeaders.join(', '),
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // Create response
  const response = NextResponse.next()

  // Add CORS headers
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', isAllowedOrigin ? origin : allowedOrigins[0])
  }
  response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '))
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '))
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Expose-Headers', exposedHeaders.join(', '))

  return response
}

/**
 * Apply CORS to specific responses
 */
export function withCors(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get('origin')
  const isAllowedOrigin = origin && allowedOrigins.includes(origin)

  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', isAllowedOrigin ? origin : allowedOrigins[0])
  }
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  return response
}
