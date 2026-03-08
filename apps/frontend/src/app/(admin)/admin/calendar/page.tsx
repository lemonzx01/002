'use client'

import { useState } from 'react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths 
} from 'date-fns'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import AdminSidebar from '@/components/admin/Sidebar'

// Mock data
const MOCK_BOOKINGS = [
  { id: '1', code: 'BK001', customer_name: 'Somchai Jai', checkin: '2026-03-05', checkout: '2026-03-08', status: 'confirmed', total: 15000 },
  { id: '2', code: 'BK002', customer_name: 'Wana Swangnam', checkin: '2026-03-10', checkout: '2026-03-12', status: 'pending', total: 8500 },
  { id: '3', code: 'BK003', customer_name: 'Thanawat Rakngern', checkin: '2026-03-15', checkout: '2026-03-18', status: 'confirmed', total: 22000 },
  { id: '4', code: 'BK004', customer_name: 'Pimpachol Jaingam', checkin: '2026-03-20', checkout: '2026-03-22', status: 'confirmed', total: 12000 },
  { id: '5', code: 'BK005', customer_name: 'Supaporn Mongkol', checkin: '2026-03-25', checkout: '2026-03-28', status: 'pending', total: 9500 },
]

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-500',
  pending: 'bg-yellow-500',
  cancelled: 'bg-red-500',
  completed: 'bg-blue-500',
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  cancelled: 'Cancelled',
  completed: 'Completed',
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const getBookingsForDay = (day: Date) => {
    return MOCK_BOOKINGS.filter(booking => {
      const checkin = new Date(booking.checkin)
      const checkout = new Date(booking.checkout)
      return day >= checkin && day <= checkout
    })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking Calendar</h1>
          <p className="text-gray-600 mt-1">View bookings in calendar format</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-gray-50 p-3 text-center font-medium text-gray-600">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month start */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white p-2 min-h-[100px]" />
            ))}

            {/* Days */}
            {days.map(day => {
              const bookings = getBookingsForDay(day)
              const isToday = isSameDay(day, new Date())
              
              return (
                <div 
                  key={day.toISOString()} 
                  className={`bg-white p-2 min-h-[100px] ${isToday ? 'bg-blue-50' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {bookings.slice(0, 3).map(booking => (
                      <button
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className={`w-full text-xs text-white px-2 py-1 rounded truncate ${STATUS_COLORS[booking.status]}`}
                      >
                        {booking.code}
                      </button>
                    ))}
                    {bookings.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{bookings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${STATUS_COLORS[key]}`} />
                <span className="text-sm text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Detail Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Booking Details</h3>
                <button onClick={() => setSelectedBooking(null)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Code:</span>
                  <span className="font-medium">{selectedBooking.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{selectedBooking.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">{selectedBooking.checkin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">{selectedBooking.checkout}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${STATUS_COLORS[selectedBooking.status]}`}>
                    {STATUS_LABELS[selectedBooking.status]}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-lg">{selectedBooking.total.toLocaleString()} THB</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
