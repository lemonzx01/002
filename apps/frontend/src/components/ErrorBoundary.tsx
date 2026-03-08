/**
 * ============================================================
 * Error Boundary - จัดการ error ทั้ง app
 * ============================================================
 */

'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Global Error Boundary
 * จัดการ error ที่เกิดขึ้นใน component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console (can extend to logging service)
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                เกิดข้อผิดพลาด
              </h1>
              <p className="text-gray-600 mb-6">
                ขออภัย เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่ภายหลัง
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                โหลดหน้าใหม่
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * API Error Handler
 * จัดการ error จาก API calls
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Response) {
    return 'เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลัง'
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'เกิดข้อผิดพลาดที่ไม่ทราบ'
}
