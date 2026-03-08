'use client'

import { format } from 'date-fns'

interface RecentBookingsProps {
  bookings: any[]
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  cancelled: 'Cancelled',
  completed: 'Completed',
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  const displayBookings = bookings.length > 0 ? bookings : [
    { id: '1', code: 'BK001', customer_name: 'Somchai Jai', total: 15000, status: 'confirmed', created_at: new Date().toISOString() },
    { id: '2', code: 'BK002', customer_name: 'Wana Swangnam', total: 8500, status: 'pending', created_at: new Date().toISOString() },
    { id: '3', code: 'BK003', customer_name: 'Thanawat Rakngern', total: 22000, status: 'completed', created_at: new Date().toISOString() },
    { id: '4', code: 'BK004', customer_name: 'Pimpachol Jaingam', total: 12000, status: 'confirmed', created_at: new Date().toISOString() },
    { id: '5', code: 'BK005', customer_name: 'Supaporn Mongkol', total: 9500, status: 'cancelled', created_at: new Date().toISOString() },
  ]

  if (displayBookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent bookings
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Code</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
          </tr>
        </thead>
        <tbody>
          {displayBookings.map((booking) => (
            <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <span className="font-medium text-blue-600">{booking.code}</span>
              </td>
              <td className="py-3 px-4 text-gray-900">{booking.customer_name}</td>
              <td className="py-3 px-4 text-gray-900">
                {booking.total?.toLocaleString() || '0'} THB
              </td>
              <td className="py-3 px-4">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                  {STATUS_LABELS[booking.status] || booking.status}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-600 text-sm">
                {booking.created_at ? format(new Date(booking.created_at), 'dd MMM yyyy') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
