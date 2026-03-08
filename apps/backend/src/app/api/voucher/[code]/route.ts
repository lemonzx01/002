/**
 * ============================================================
 * Voucher API - สร้าง PDF Voucher สำหรับการจอง
 * ============================================================
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isMockMode } from '@/lib/auth'
import { findMockBookingByCode, findMockHotel, findMockCar } from '@/lib/mock-data'
import { jsPDF } from 'jspdf'

/**
 * GET /api/voucher/[code] - สร้าง PDF Voucher
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'pdf'
  
  // Mock Mode
  if (isMockMode()) {
    const booking = findMockBookingByCode(code)
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    let itemName = ''
    let itemDetails = ''
    
    if (booking.hotel_id) {
      const hotel = findMockHotel(booking.hotel_id)
      itemName = hotel?.name_th || ''
      itemDetails = `ห้อง: ${hotel?.room_type_th || '-'}`
    } else if (booking.car_id) {
      const car = findMockCar(booking.car_id)
      itemName = car?.name_th || ''
      itemDetails = `ประเภท: ${car?.car_type_th || '-'}`
    }
    
    const voucherData = {
      booking_code: booking.booking_code,
      customer_name: booking.customer_name,
      customer_email: booking.customer_email,
      customer_phone: booking.customer_phone,
      item_name: itemName,
      item_details: itemDetails,
      check_in: booking.check_in_date,
      check_out: booking.check_out_date,
      guests: booking.number_of_guests,
      total_price: booking.total_price,
      currency: booking.currency,
      status: booking.status,
      created_at: booking.created_at
    }
    
    if (format === 'json') {
      return NextResponse.json({ voucher: voucherData })
    }
    
    // Generate PDF
    const doc = new jsPDF()
    
    // Header
    doc.setFillColor(79, 70, 229) // Indigo
    doc.rect(0, 0, 210, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.text('Got Journey Thailand', 105, 20, { align: 'center' })
    doc.setFontSize(12)
    doc.text('VOUCHER', 105, 32, { align: 'center' })
    
    // Booking Code
    doc.setTextColor(79, 70, 229)
    doc.setFontSize(28)
    doc.text(code, 105, 55, { align: 'center' })
    
    // Status
    const statusColors: Record<string, number[]> = {
      PENDING: [245, 158, 11],
      CONFIRMED: [34, 197, 94],
      PAID: [59, 130, 246],
      CANCELLED: [239, 68, 68]
    }
    const statusColor = statusColors[booking.status as string] || [100, 100, 100]
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2])
    doc.roundedRect(80, 60, 50, 10, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text(booking.status, 105, 67, { align: 'center' })
    
    // Customer Details
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.text('รายละเอียดการจอง', 20, 85)
    
    doc.setFontSize(10)
    doc.text(`ชื่อลูกค้า: ${booking.customer_name}`, 20, 95)
    doc.text(`อีเมล: ${booking.customer_email}`, 20, 102)
    doc.text(`เบอร์โทร: ${booking.customer_phone}`, 20, 109)
    
    doc.text(`รายการ: ${itemName}`, 20, 120)
    doc.text(itemDetails, 20, 127)
    doc.text(`วันที่: ${booking.check_in_date} - ${booking.check_out_date}`, 20, 134)
    doc.text(`จำนวนผู้เข้าพัก: ${booking.number_of_guests}`, 20, 141)
    
    // Price
    doc.setFillColor(249, 250, 251)
    doc.rect(20, 150, 170, 30, 'F')
    doc.setFontSize(14)
    doc.text('ราคารวม:', 30, 162)
    doc.setFontSize(18)
    doc.setTextColor(34, 197, 94)
    doc.text(`${booking.total_price.toLocaleString()} ${booking.currency}`, 120, 165)
    
    // Footer
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(8)
    doc.text('ขอบคุณที่ใช้บริการ Got Journey Thailand', 105, 185, { align: 'center' })
    doc.text('ติดต่อ: hello@gotjourneythailand.com | +66 2 123 4567', 105, 190, { align: 'center' })
    doc.text(`วันที่ออก voucher: ${new Date().toLocaleDateString('th-TH')}`, 105, 280, { align: 'center' })
    
    // Return PDF
    const pdfBuffer = doc.output('arraybuffer')
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="voucher-${code}.pdf"`
      }
    })
  }
  
  // Real Supabase Mode
  try {
    const supabase = await createAdminClient()
    
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, hotels(name_th, room_type_th), cars(name_th, car_type_th)')
      .eq('booking_code', code)
      .single()
    
    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    if (format === 'json') {
      return NextResponse.json({ voucher: booking })
    }
    
    // Generate PDF with real data
    const doc = new jsPDF()
    
    doc.setFillColor(79, 70, 229)
    doc.rect(0, 0, 210, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.text('Got Journey Thailand', 105, 20, { align: 'center' })
    doc.setFontSize(12)
    doc.text('VOUCHER', 105, 32, { align: 'center' })
    
    doc.setTextColor(79, 70, 229)
    doc.setFontSize(28)
    doc.text(code, 105, 55, { align: 'center' })
    
    const pdfBuffer = doc.output('arraybuffer')
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="voucher-${code}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generating voucher:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
