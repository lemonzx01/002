/**
 * ============================================================
 * Currency Utilities - ฟังก์ชันแปลงสกุลเงิน
 * ============================================================
 */

// Exchange rates (base: THB)
const exchangeRates: Record<string, number> = {
  THB: 1,
  USD: 0.029,  // 1 THB = 0.029 USD
  EUR: 0.027,
  JPY: 4.5,
  CNY: 0.21,
  GBP: 0.023
}

/**
 * แปลงสกุลเงิน
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) return amount
  
  const fromRate = exchangeRates[fromCurrency] || 1
  const toRate = exchangeRates[toCurrency] || 1
  
  // Convert to THB first, then to target currency
  const inTHB = amount / fromRate
  return inTHB * toRate
}

/**
 * Format สกุลเงิน
 */
export function formatCurrency(
  amount: number,
  currency: string = 'THB',
  locale: string = 'th-TH'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * ดึงอัตราแลกเปลี่ยน
 */
export function getExchangeRate(from: string, to: string): number {
  const fromRate = exchangeRates[from] || 1
  const toRate = exchangeRates[to] || 1
  return toRate / fromRate
}

/**
 * รายการสกุลเงินที่รองรับ
 */
export const supportedCurrencies = ['THB', 'USD', 'EUR', 'JPY', 'CNY', 'GBP']

/**
 * สัญลักษณ์สกุลเงิน
 */
export const currencySymbols: Record<string, string> = {
  THB: '฿',
  USD: '$',
  EUR: '€',
  JPY: '¥',
  CNY: '¥',
  GBP: '£'
}
