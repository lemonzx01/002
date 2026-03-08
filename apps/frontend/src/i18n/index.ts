/**
 * ============================================================
 * i18n Configuration - การตั้งค่าระบบหลายภาษา
 * ============================================================
 *
 * วัตถุประสงค์:
 *   - กำหนดค่าเริ่มต้นสำหรับ i18next
 *   - โหลด resource files สำหรับแต่ละภาษา
 *   - ตั้งค่าภาษาเริ่มต้นและ fallback
 *
 * ภาษาที่รองรับ:
 *   - th: ภาษาไทย (ค่าเริ่มต้น)
 *   - en: ภาษาอังกฤษ
 *
 * ============================================================
 */

// ============================================================
// Imports
// ============================================================

/** i18next - ไลบรารีหลักสำหรับจัดการหลายภาษา */
import i18n from 'i18next'

/** React integration สำหรับ i18next */
import { initReactI18next } from 'react-i18next'

// ----------------------------------------------------------
// Language Resources (ไฟล์ภาษา)
// ----------------------------------------------------------

/** ไฟล์คำแปลภาษาไทย */
import thCommon from './locales/th/common.json'

/** ไฟล์คำแปลภาษาอังกฤษ */
import enCommon from './locales/en/common.json'

/** ไฟล์คำแปลภาษาเยอรมัน */
import deCommon from './locales/de/common.json'

/** ไฟล์คำแปลภาษาฝรั่งเศส */
import frCommon from './locales/fr/common.json'

/** ไฟล์คำแปลภาษาอิตาลี */
import itCommon from './locales/it/common.json'

/** ไฟล์คำแปลภาษาสเปน */
import esCommon from './locales/es/common.json'

/** ไฟล์คำแปลภาษาโปรตุกีส */
import ptCommon from './locales/pt/common.json'

/** ไฟล์คำแปลภาษาดัตช์ */
import nlCommon from './locales/nl/common.json'

/** ไฟล์คำแปลภาษารัสเซีย */
import ruCommon from './locales/ru/common.json'

/** ไฟล์คำแปลภาษาโปแลนด์ */
import plCommon from './locales/pl/common.json'

// ============================================================
// Resources Configuration (การกำหนดค่า Resources)
// ============================================================

/**
 * กำหนด resources สำหรับแต่ละภาษา
 *
 * โครงสร้าง:
 *   - ระดับแรก: รหัสภาษา (th, en, de, fr...)
 *   - ระดับที่สอง: namespace (common)
 *   - ระดับที่สาม: ข้อความแปลจากไฟล์ JSON
 */
const resources = {
  /** ภาษาไทย */
  th: {
    common: thCommon,
  },
  /** ภาษาอังกฤษ */
  en: {
    common: enCommon,
  },
  /** ภาษาเยอรมัน */
  de: {
    common: deCommon,
  },
  /** ภาษาฝรั่งเศส */
  fr: {
    common: frCommon,
  },
  /** ภาษาอิตาลี */
  it: {
    common: itCommon,
  },
  /** ภาษาสเปน */
  es: {
    common: esCommon,
  },
  /** ภาษาโปรตุกีส */
  pt: {
    common: ptCommon,
  },
  /** ภาษาดัตช์ */
  nl: {
    common: nlCommon,
  },
  /** ภาษารัสเซีย */
  ru: {
    common: ruCommon,
  },
  /** ภาษาโปแลนด์ */
  pl: {
    common: plCommon,
  },
}

// ============================================================
// i18n Initialization (การเริ่มต้น i18n)
// ============================================================

/**
 * เริ่มต้น i18next พร้อม React integration
 *
 * การตั้งค่า:
 *   - resources: ไฟล์ภาษาที่กำหนดไว้ข้างต้น
 *   - lng: ภาษาเริ่มต้น (ไทย) - ป้องกัน hydration mismatch
 *   - fallbackLng: ภาษาสำรองเมื่อไม่พบคำแปล
 *   - defaultNS: namespace เริ่มต้น
 *   - interpolation.escapeValue: ปิด HTML escaping (React จัดการเอง)
 */
i18n.use(initReactI18next).init({
  /** ไฟล์ภาษาทั้งหมด */
  resources,

  /**
   * ภาษาเริ่มต้น
   * ใช้ภาษาไทยเสมอตอนเริ่มต้นเพื่อป้องกัน hydration mismatch
   * ภาษาจะถูกเปลี่ยนจาก localStorage ใน I18nProvider
   */
  lng: 'th',

  /** ภาษาสำรองเมื่อไม่พบคำแปล */
  fallbackLng: 'th',

  /** namespace เริ่มต้นสำหรับการแปล */
  defaultNS: 'common',

  /** การตั้งค่า interpolation */
  interpolation: {
    /**
     * ปิด HTML escaping
     * React จัดการ XSS protection เองแล้ว
     */
    escapeValue: false,
  },
})

// ============================================================
// Export
// ============================================================

export default i18n
