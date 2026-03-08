/**
 * ============================================================
 * SEO Configuration - ตั้งค่า SEO สำหรับเว็บไซต์
 * ============================================================
 */

import type { Metadata } from 'next'

// ============================================================
// Site Configuration
// ============================================================

export const siteConfig = {
  name: 'Got Journey Thailand',
  description: 'Book premium cars with exclusive villa packages. Experience luxury travel in Chiang Rai, Thailand.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://gotjourneythailand.com',
  ogImage: 'https://gotjourneythailand.com/og-image.jpg',
  keywords: [
    'travel',
    'booking',
    'hotel',
    'car rental',
    'chiang rai',
    'thailand',
    'vacation',
    'tour',
    'accommodation',
    'luxury travel',
  ],
  authors: [{ name: 'Got Journey Thailand' }],
  creator: 'Got Journey Thailand',
  publisher: 'Got Journey Thailand',
}

// ============================================================
// Default Metadata
// ============================================================

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Premium Travel Booking`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@gotjourney',
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
}

// ============================================================
// Page-specific Metadata
// ============================================================

export const pageMetadata = {
  home: {
    title: `${siteConfig.name} | Premium Travel Booking Platform`,
    description: 'Book premium cars with exclusive villa packages. Experience luxury travel in Chiang Rai, Thailand.',
  },
  hotels: {
    title: 'จองโรงแรม & แพ็คเกจที่พัก | Got Journey Thailand',
    description: 'จองโรงแรมและแพ็คเกจที่พักหรูในเชียงราย ราคาพิเศษ พร้อมรถเช่า',
  },
  cars: {
    title: 'เช่ารถเชียงราย | Got Journey Thailand',
    description: 'เช่ารถหรูและรถยนต์ทั่วไปในเชียงราย บริการดี ราคาคุ้ม',
  },
  booking: {
    title: 'จองทัวร์และที่พัก | Got Journey Thailand',
    description: 'จองแพ็คเกจท่องเที่ยว โรงแรม รถเช่า ง่ายๆ สะดวก รวดเร็ว',
  },
  contact: {
    title: 'ติดต่อเรา | Got Journey Thailand',
    description: 'ติดต่อ Got Journey Thailand สอบถามข้อมูลการจอง หรือร่วมงานกับเรา',
  },
  login: {
    title: 'เข้าสู่ระบบ | Got Journey Thailand',
    description: 'เข้าสู่ระบบเพื่อจองแพ็คเกจและดูประวัติการจอง',
  },
  register: {
    title: 'สมัครสมาชิก | Got Journey Thailand',
    description: 'สมัครสมาชิก Got Journey Thailand เพื่อรับสิทธิพิเศษและโปรโมชั่น',
  },
  admin: {
    title: 'Admin Dashboard | Got Journey Thailand',
    description: 'ระบบจัดการหลังบ้าน',
  },
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Generate metadata for a specific page
 */
export function generatePageMetadata(page: keyof typeof pageMetadata): Metadata {
  const config = pageMetadata[page]
  
  return {
    title: config.title,
    description: config.description,
    openGraph: {
      ...defaultMetadata.openGraph,
      title: config.title,
      description: config.description,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: config.title,
      description: config.description,
    },
  }
}
