'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, Filter } from 'lucide-react'
import AdminSidebar from '@/components/admin/Sidebar'

type ReportType = 'revenue' | 'bookings' | 'customers'

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('revenue')

  const revenueData = [
    { month: 'January', revenue: 45000, bookings: 45 },
    { month: 'February', revenue: 52000, bookings: 52 },
    { month: 'March', revenue: 48000, bookings: 48 },
    { month: 'April', revenue: 61000, bookings: 61 },
    { month: 'May', revenue: 55000, bookings: 55 },
    { month: 'June', revenue: 67000, bookings: 67 },
  ]

  const handleExportExcel = () => {
    alert('Exporting Excel... (Demo)')
  }

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalBookings = revenueData.reduce((sum, item) => sum + item.bookings, 0)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Export various reports</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Report Type:</span>
            </div>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="revenue">Revenue Report</option>
              <option value="bookings">Bookings Report</option>
              <option value="customers">Customers Report</option>
            </select>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Export Excel
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Download className="w-5 h-5" />
                Export PDF
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {totalRevenue.toLocaleString()} THB
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Total Bookings</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {totalBookings} bookings
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-600 text-sm">Average per Booking</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {Math.round(totalRevenue / totalBookings).toLocaleString()} THB
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {reportType === 'revenue' && 'Monthly Revenue Report'}
              {reportType === 'bookings' && 'Monthly Bookings Report'}
              {reportType === 'customers' && 'Customers Report'}
            </h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Month</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">Revenue</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">Bookings</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">Average</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.map((item, index) => (
                <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-6">{item.month}</td>
                  <td className="py-3 px-6 text-right text-green-600 font-medium">
                    {item.revenue.toLocaleString()} THB
                  </td>
                  <td className="py-3 px-6 text-right">{item.bookings} bookings</td>
                  <td className="py-3 px-6 text-right text-gray-600">
                    {Math.round(item.revenue / item.bookings).toLocaleString()} THB
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold">
              <tr>
                <td className="py-3 px-6">Total</td>
                <td className="py-3 px-6 text-right text-green-600">
                  {totalRevenue.toLocaleString()} THB
                </td>
                <td className="py-3 px-6 text-right">{totalBookings} bookings</td>
                <td className="py-3 px-6 text-right">
                  {Math.round(totalRevenue / totalBookings).toLocaleString()} THB
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </main>
    </div>
  )
}
