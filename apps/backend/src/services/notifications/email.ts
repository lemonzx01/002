/**
 * ============================================================
 * Email Service - ส่งอีเมล
 * ============================================================
 */

interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
}

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * ส่งอีเมล (Mock/Resend)
 */
export async function sendEmail(options: EmailOptions): Promise<SendEmailResult> {
  const { to, subject, html, text } = options
  
  // Check if Resend is configured
  const resendApiKey = process.env.RESEND_API_KEY
  
  if (!resendApiKey) {
    // Mock mode - just log
    console.log('[MOCK EMAIL]')
    console.log(`To: ${Array.isArray(to) ? to.join(', ') : to}`)
    console.log(`Subject: ${subject}`)
    console.log(`HTML: ${html ? 'Yes' : 'No'}`)
    console.log(`Text: ${text ? 'Yes' : 'No'}`)
    
    return {
      success: true,
      messageId: `mock_${Date.now()}`
    }
  }
  
  // Use Resend
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(resendApiKey)
    
    const result = await resend.emails.send({
      from: 'Got Journey Thailand <noreply@gotjourneythailand.com>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text
    })
    
    if (result.error) {
      return {
        success: false,
        error: result.error.message
      }
    }
    
    return {
      success: true,
      messageId: result.data?.id
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * ส่งอีเมลยืนยันการจอง
 */
export async function sendBookingConfirmation(
  email: string,
  bookingCode: string,
  bookingDetails: Record<string, unknown>
): Promise<SendEmailResult> {
  const html = `
    <h1>ยืนยันการจอง</h1>
    <p>รหัสการจองของคุณ: <strong>${bookingCode}</strong></p>
    <h2>รายละเอียดการจอง</h2>
    <ul>
      <li>ประเภท: ${bookingDetails.booking_type}</li>
      <li>วันที่: ${bookingDetails.check_in_date} - ${bookingDetails.check_out_date}</li>
      <li>ราคารวม: ${bookingDetails.total_price} ${bookingDetails.currency}</li>
    </ul>
    <p>ขอบคุณที่ใช้บริการ Got Journey Thailand</p>
  `
  
  return sendEmail({
    to: email,
    subject: `ยืนยันการจอง ${bookingCode}`,
    html
  })
}

/**
 * ส่งอีเมลรีเซ็ตรหัสผ่าน
 */
export async function sendPasswordReset(
  email: string,
  resetToken: string
): Promise<SendEmailResult> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
  
  const html = `
    <h1>รีเซ็ตรหัสผ่าน</h1>
    <p>คลิกลิงก์ด้านล่างเพื่อรีเซ็ตรหัสผ่าน:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
  `
  
  return sendEmail({
    to: email,
    subject: 'รีเซ็ตรหัสผ่าน - Got Journey Thailand',
    html
  })
}
