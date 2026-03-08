/**
 * ============================================================
 * Google Analytics - ติดตามการใช้งานเว็บไซต์
 * ============================================================
 */

'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

// Google Analytics ID
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'

/**
 * Google Analytics Component
 * ใส่ใน layout หลัก
 */
export function GoogleAnalytics() {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_title: document.title,
              page_location: window.location.href
            });
          `
        }}
      />
    </>
  )
}

/**
 * Analytics helper functions
 */
export const analytics = {
  /**
   * Track page view
   */
  pageView: (path: string, title?: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title
      })
    }
  },

  /**
   * Track event
   */
  event: (eventName: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, params)
    }
  },

  /**
   * Track booking
   */
  booking: (bookingId: string, value: number, currency: string = 'THB') => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'purchase', {
        transaction_id: bookingId,
        value: value,
        currency: currency,
        items: [{
          item_id: bookingId,
          item_name: 'Booking',
          price: value,
          quantity: 1
        }]
      })
    }
  },

  /**
   * Track search
   */
  search: (searchTerm: string, resultsCount: number) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'search', {
        search_term: searchTerm,
        results_count: resultsCount
      })
    }
  },

  /**
   * Track CTA click
   */
  ctaClick: (ctaName: string, location: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_click', {
        cta_name: ctaName,
        cta_location: location
      })
    }
  }
}

/**
 * Auto-track page views
 * ใส่ใน component ที่ต้องการ track
 */
export function useTrackPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : '')
    analytics.pageView(url)
  }, [pathname, searchParams])
}
