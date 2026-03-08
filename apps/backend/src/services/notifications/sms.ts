/**
 * ============================================================
 * SMS Service - ส่ง SMS แจ้งเตือน (Thai SMS API)
 * ============================================================
 */

interface SMSOptions {
  to: string
  message: string
}

interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * ส่ง SMS (Mock/Thai SMS API)
 */
export async function sendSMS(options: SMSOptions): Promise<SMSResult> {
  const { to, message } = options
  
  // Check if SMS API is configured
  const smsApiKey = process.env.SMS_API_KEY
  const smsApiUrl = process.env.SMS_API_URL || 'https://api.sms.co.th'
  
  // Format phone number (Thai format)
  let formattedPhone = to.replace(/\D/g, '')
  if (!formattedPhone.startsWith('66')) {
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '66' + formattedPhone.slice(1)
    } else {
      formattedPhone = '66' + formattedPhone
    }
  }
  
  // Mock mode - just log
  if (!smsApiKey) {
    console.log('[MOCK SMS]')
    console.log(`To: ${formattedPhone}`)
    console.log(`Message: ${message}`)
    
    return {
      success: true,
      messageId: `mock_${Date.now()}`
    }
  }
  
  // Use SMS API
  try {
    const response = await fetch(`${smsApiUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${smsApiKey}`
      },
      body: JSON.stringify({
        to: formattedPhone,
        message: message
      })
    })
    
    const result = await response.json()
    
    if (result.status === 'success') {
      return {
        success: true,
        messageId: result.message_id
      }
    } else {
      return {
        success: false,
        error: result.message || 'SMS sending failed'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * ส่ง SMS ยืนยันการจอง
 */
export async function sendBookingConfirmationSMS(
  phone: string,
  bookingCode: string
): Promise<SMSResult> {
  const message = `Got Journey Thailand\n✅ ยืนยันการจอง ${bookingCode}\nชำระเงินที่: https://gotjourneythailand.com/pay/${bookingCode}\nขอบคุณค่ะ/ครับ`
  
  return sendSMS({ to: phone, message })
}

/**
 * ส่ง SMS แจ้งชำระเงินสำเร็จ
 */
export async function sendPaymentSuccessSMS(
  phone: string,
  bookingCode: string
): Promise<SMSResult> {
  const message = `Got Journey Thailand\n✅ ชำระเงินสำเร็จ!\nรหัสการจอง: ${bookingCode}\nรอรับ Voucher ทางอีเมลภายใน 24 ชม.\nขอบคุณค่ะ/ครับ`
  
  return sendSMS({ to: phone, message })
}

/**
 * ส่ง SMS แจ้งเตือนก่อนเช็คอิน
 */
export async function sendCheckInReminderSMS(
  phone: string,
  bookingCode: string,
  checkInDate: string,
  hotelName: string
): Promise<SMSResult> {
  const message = `Got Journey Thailand\n📅 แจ้งเตือนวันเช็คอิน\nรหัวจอง: ${bookingCode}\nวันที่: ${checkInDate}\nที่พัก: ${hotelName}\nขอบคุณค่ะ/ครับ`
  
  return sendSMS({ to: phone, message })
}
