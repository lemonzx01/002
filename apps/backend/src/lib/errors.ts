/**
 * ============================================================
 * Global Error Handler - จัดการ error ทั้งหมดใน app
 * ============================================================
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Custom Error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, message)
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(400, message)
  }
}

/**
 * Unauthorized Error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message)
  }
}

/**
 * Forbidden Error
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(403, message)
  }
}

/**
 * Conflict Error
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(409, message)
  }
}

/**
 * Format error response
 */
export function formatError(error: Error | AppError): {
  statusCode: number
  message: string
  stack?: string
} {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      message: error.message
    }
  }

  // Unknown error
  return {
    statusCode: 500,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  }
}

/**
 * Error logging
 */
export function logError(error: Error, context?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString()
  const env = process.env.NODE_ENV || 'development'
  
  const logData = {
    timestamp,
    environment: env,
    error: {
      name: error.name,
      message: error.message,
      stack: env === 'development' ? error.stack : undefined
    },
    context
  }

  // Console log (can be extended to use external logging services)
  console.error('❌ Error:', JSON.stringify(logData, null, 2))

  // In production, you might want to send to:
  // - Sentry: sentry.io
  // - LogRocket: logrocket.com
  // - Datadog: datadoghq.com
  // - CloudWatch: aws.amazon.com/cloudwatch
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    message: message || 'Success',
    data
  })
}

/**
 * Error response helper
 */
export function errorResponse(
  message: string,
  statusCode: number = 500,
  errors?: Record<string, string[]>
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(errors && { errors })
    },
    { status: statusCode }
  )
}

/**
 * Validation error response helper
 */
export function validationErrorResponse(errors: Record<string, string[]>): NextResponse {
  return errorResponse('Validation failed', 400, errors)
}

/**
 * Not found response helper
 */
export function notFoundResponse(message: string = 'Resource not found'): NextResponse {
  return errorResponse(message, 404)
}

/**
 * Unauthorized response helper
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return errorResponse(message, 401)
}

/**
 * Forbidden response helper
 */
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return errorResponse(message, 403)
}
