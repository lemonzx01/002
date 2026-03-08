'use client'

import { useState } from 'react'
import { User, Search, Edit, Trash2, Bell, Calendar, CreditCard, AlertCircle, CheckCircle, XCircle, Mail } from 'lucide-react'
import AdminSidebar from '@/components/admin/Sidebar'

type NotificationType = 'booking' | 'payment' | 'system' | 'user'

interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  time: string
  read: boolean
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, type: 'booking', title: 'New Booking', message: 'New booking from Somchai Jai', time: '2 min ago', read: false },
  { id: 2, type: 'payment', title: 'Payment Success', message: 'Payment for Booking #BK001 successful', time: '15 min ago', read: false },
  { id: 3, type: 'booking', title: 'Booking Cancelled', message: 'Customer cancelled Booking #BK002', time: '1 hour ago', read: true },
  { id: 4, type: 'system', title: 'System Update', message: 'System will be maintenance at midnight', time: '3 hours ago', read: true },
  { id: 5, type: 'user', title: 'New User', message: 'New user registered: Wana Swangngam', time: '5 hours ago', read: true },
]

const TYPE_ICONS: Record<string, any> = {
  booking: Calendar,
  payment: CreditCard,
  system: AlertCircle,
  user: Mail,
}

const TYPE_COLORS: Record<string, string> = {
  booking: 'bg-blue-100 text-blue-600',
  payment: 'bg-green-100 text-green-600',
  system: 'bg-yellow-100 text-yellow-600',
  user: 'bg-purple-100 text-purple-600',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const clearAll = () => {
    if (confirm('Delete all notifications?')) {
      setNotifications([])
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">View all notifications</p>
            </div>
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <CheckCircle className="w-5 h-5" />
              Mark All Read
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${filter === 'unread' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Bell className="w-4 h-4" />
                Unread ({unreadCount})
              </button>
            </div>
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-5 h-5" />
              Clear All
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm divide-y">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No notifications</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = TYPE_ICONS[notification.type]
              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${TYPE_COLORS[notification.type]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                              title="Mark as read"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
