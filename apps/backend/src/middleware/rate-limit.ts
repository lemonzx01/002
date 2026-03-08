/**
 * ============================================================
 * Rate Limiting Middleware - ป้องกันการเรียก API มากเกินไป
 * ============================================================
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// In-memory store for rate limiting
// In production, use Redis or similar
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Configuration from environment
const getConfig = () => ({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
})

/**
 * Get client identifier (IP address)
 */
function getClientIdentifier(request: NextRequest): string {
  // Check for forwarded IP
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  // Check for real IP
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to remote address
  return request.ip || 'unknown'
}

/**
 * Check rate limit for client
 */
function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
  const config = getConfig()
  const now = Date.now()
  
  let entry = rateLimitStore.get(identifier)
  
  // Check if we need to reset (window expired)
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(identifier, entry)
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }
  
  // Increment count
  entry.count++
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Clean up expired entries periodically
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000)

/**
 * Rate limiting middleware
 */
export function rateLimitMiddleware(request: NextRequest): NextResponse | null {
  // Skip rate limiting in development (optional)
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true') {
    return null
  }

  // Only apply to API routes
  const { pathname } = request.nextUrl
  if (!pathname.startsWith('/api/')) {
    return null
  }

  // Skip for certain paths
  const skipPaths = ['/api/health', '/api/webhooks']
  if (skipPaths.some(path => pathname.startsWith(path))) {
    return null
  }

  // Get client identifier
  const identifier = getClientIdentifier(request)
  
  // Check rate limit
  const result = checkRateLimit(identifier)
  
  if (!result.allowed) {
    const response = NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Please try again later',
        retry_after: Math.ceil((result.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': getConfig().maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetTime.toString(),
        },
      }
    )
    
    return response
  }

  // Add rate limit headers to successful responses
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', getConfig().maxRequests.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString())

  return response
}

/**
 * Helper to apply rate limit headers to any response
 */
export function withRateLimitHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const identifier = getClientIdentifier(request)
  const result = checkRateLimit(identifier)
  
  response.headers.set('X-RateLimit-Limit', getConfig().maxRequests.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
  
  return response
}
