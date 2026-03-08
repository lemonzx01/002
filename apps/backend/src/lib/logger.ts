/**
 * ============================================================
 * Logger - ระบบ logging สำหรับ application
 * ============================================================
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
  userId?: string
  requestId?: string
}

/**
 * Logger class
 */
class Logger {
  private isProduction: boolean
  private isDevelopment: boolean

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  /**
   * Format log entry
   */
  private formatEntry(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.isProduction ? this.sanitizeContext(context) : context
    }
  }

  /**
   * Sanitize context for production (remove sensitive data)
   */
  private sanitizeContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!context) return undefined

    const sensitiveKeys = [
      'password',
      'password_hash',
      'token',
      'access_token',
      'refresh_token',
      'secret',
      'api_key',
      'credit_card',
      'cvv'
    ]

    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(context)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  /**
   * Output log
   */
  private log(entry: LogEntry): void {
    const { level, timestamp, message, context } = entry
    
    // Format output
    const prefix = `[${timestamp}] ${level.toUpperCase()}`
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''

    // Use appropriate console method
    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(`${prefix}: ${message}${contextStr}`)
        }
        break
      case 'info':
        console.log(`${prefix}: ${message}${contextStr}`)
        break
      case 'warn':
        console.warn(`${prefix}: ${message}${contextStr}`)
        break
      case 'error':
        console.error(`${prefix}: ${message}${contextStr}`)
        break
    }

    // In production, you might want to send to external service
    if (this.isProduction && level === 'error') {
      this.sendToExternalService(entry)
    }
  }

  /**
   * Send error logs to external service (optional)
   */
  private sendToExternalService(entry: LogEntry): void {
    // Example: Send to Sentry, Datadog, etc.
    // This is optional - implement based on your needs
  }

  /**
   * Debug log
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(this.formatEntry('debug', message, context))
  }

  /**
   * Info log
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(this.formatEntry('info', message, context))
  }

  /**
   * Warning log
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(this.formatEntry('warn', message, context))
  }

  /**
   * Error log
   */
  error(message: string, context?: Record<string, unknown>): void {
    this.log(this.formatEntry('error', message, context))
  }

  /**
   * Log API request
   */
  logRequest(method: string, path: string, statusCode: number, duration: number): void {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
    this.log(this.formatEntry(level, `${method} ${path}`, { statusCode, duration }))
  }

  /**
   * Log user action
   */
  logUserAction(userId: string, action: string, details?: Record<string, unknown>): void {
    this.log(this.formatEntry('info', `User action: ${action}`, { userId, ...details }))
  }
}

// Export singleton instance
export const logger = new Logger()

// Export convenience functions
export const debug = (message: string, context?: Record<string, unknown>) => logger.debug(message, context)
export const info = (message: string, context?: Record<string, unknown>) => logger.info(message, context)
export const warn = (message: string, context?: Record<string, unknown>) => logger.warn(message, context)
export const error = (message: string, context?: Record<string, unknown>) => logger.error(message, context)
