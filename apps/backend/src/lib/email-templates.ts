/**
 * ============================================================
 * Email Templates - เทมเพลตอีเมล
 * ============================================================
 */

interface BookingEmailData {
  booking_code: string
  customer_name: string
  customer_email: string
  booking_type: string
  check_in_date: string
  check_out_date: string
  total_price: number
  currency: string
  hotel_name?: string
  car_name?: string
}

/**
 * เทมเพลตอีเมลยืนยันการจอง
 */
export function getBookingConfirmationEmail(data: BookingEmailData): {
  subject: string
  html: string
  text: string
} {
  const { booking_code, customer_name, booking_type, check_in_date, check_out_date, total_price, currency, hotel_name, car_name } = data
  
  const itemName = hotel_name || car_name || booking_type
  const subject = `🎉 ยืนยันการจอง ${booking_code} - Got Journey Thailand`
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ยืนยันการจอง</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🎉 ยืนยันการจอง</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Got Journey Thailand</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">สวัสดีคุณ ${customer_name} 👋</h2>
              
              <p style="color: #6b7280; margin: 0 0 20px 0; font-size: 16px;">
                ขอบคุณที่ใช้บริการ Got Journey Thailand ค่ะ/ครับ<br>
                การจองของคุณได้รับการยืนยันแล้ว!
              </p>
              
              <!-- Booking Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <strong style="color: #6b7280;">รหัสการจอง</strong>
                        </td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                          <strong style="color: #4f46e5; font-size: 18px;">${booking_code}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <strong style="color: #6b7280;">รายการ</strong>
                        </td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                          ${itemName}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <strong style="color: #6b7280;">วันที่</strong>
                        </td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                          ${check_in_date} - ${check_out_date}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong style="color: #6b7280;">ราคารวม</strong>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <strong style="color: #059669; font-size: 20px;">${total_price.toLocaleString()} ${currency}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Next Steps -->
              <h3 style="color: #1f2937; margin: 20px 0 10px 0; font-size: 16px;">📋 ขั้นตอนถัดไป</h3>
              <ul style="color: #6b7280; padding-left: 20px; margin: 0;">
                <li style="margin-bottom: 8px;">ชำระเงินผ่านลิงก์ที่ส่งให้ทางอีเมล</li>
                <li style="margin-bottom: 8px;">รอรับอีเมลยืนยันการชำระเงิน</li>
                <li style="margin-bottom: 8px;">รับ Voucher ที่พัก/รถ ทางอีเมล</li>
              </ul>
              
              <!-- Contact -->
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; margin: 0; font-size: 14px;">
                  หากมีข้อสงสัย ติดต่อเราได้ที่<br>
                  📧 hello@gotjourneythailand.com<br>
                  📞 +66 2 123 4567<br>
                  💬 LINE: @gotjourney
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                © 2024 Got Journey Thailand. All rights reserved.<br>
                This email was sent to ${data.customer_email}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
  
  const text = `
🎉 ยืนยันการจอง - Got Journey Thailand

สวัสดีคุณ ${customer_name},

ขอบคุณที่ใช้บริการ Got Journey Thailand
การจองของคุณได้รับการยืนยันแล้ว!

รหัสการจอง: ${booking_code}
รายการ: ${itemName}
วันที่: ${check_in_date} - ${check_out_date}
ราคารวม: ${total_price.toLocaleString()} ${currency}

ขั้นตอนถัดไป:
1. ชำระเงินผ่านลิงก์ที่ส่งให้ทางอีเมล
2. รอรับอีเมลยืนยันการชำระเงิน
3. รับ Voucher ที่พัก/รถ ทางอีเมล

หากมีข้อสงสัย ติดต่อเราได้ที่:
- อีเมล: hello@gotjourneythailand.com
- โทร: +66 2 123 4567
- LINE: @gotjourney

© 2024 Got Journey Thailand
  `.trim()
  
  return { subject, html, text }
}

/**
 * เทมเพลตอีเมลแจ้งชำระเงินสำเร็จ
 */
export function getPaymentSuccessEmail(data: BookingEmailData): {
  subject: string
  html: string
  text: string
} {
  const { booking_code, customer_name, total_price, currency } = data
  
  return {
    subject: `✅ ชำระเงินสำเร็จ - ${booking_code}`,
    html: `
      <h1>✅ ชำระเงินสำเร็จ!</h1>
      <p>สวัสดีคุณ ${customer_name},</p>
      <p>การชำระเงินสำเร็จแล้ว!</p>
      <p>รหัสการจอง: <strong>${booking_code}</strong></p>
      <p>จำนวนเงิน: ${total_price.toLocaleString()} ${currency}</p>
    `,
    text: `✅ ชำระเงินสำเร็จ! - ${booking_code} - ${total_price.toLocaleString()} ${currency}`
  }
}

/**
 * เทมเพลตอีเมลยกเลิกการจอง
 */
export function getBookingCancelledEmail(data: BookingEmailData & { reason?: string }): {
  subject: string
  html: string
  text: string
} {
  const { booking_code, customer_name, reason } = data
  
  return {
    subject: `❌ ยกเลิกการจอง - ${booking_code}`,
    html: `
      <h1>❌ การจองถูกยกเลิก</h1>
      <p>สวัสดีคุณ ${customer_name},</p>
      <p>การจอง ${booking_code} ถูกยกเลิกแล้ว</p>
      ${reason ? `<p>เหตุผล: ${reason}</p>` : ''}
    `,
    text: `❌ การจอง ${booking_code} ถูกยกเลิก - ${reason || ''}`
  }
}
