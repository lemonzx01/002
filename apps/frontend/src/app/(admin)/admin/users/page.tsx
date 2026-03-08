'use client'

import { useState } from 'react'
import { User, Search, Edit, Trash2, Mail, Phone } from 'lucide-react'
import AdminSidebar from '@/components/admin/Sidebar'

const MOCK_USERS = [
  { id: 1, name: 'Somchai Jai', email: 'somchai@example.com', phone: '081-234-5678', bookings: 5, totalSpent: 45000, status: 'active', joined: '2025-06-15' },
  { id: 2, name: 'Wana Swangnam', email: 'wana@example.com', phone: '089-123-4567', bookings: 3, totalSpent: 28000, status: 'active', joined: '2025-08-20' },
  { id: 3, name: 'Thanawat Rakngern', email: 'thanawat@example.com', phone: '087-987-6543', bookings: 8, totalSpent: 72000, status: 'active', joined: '2025-03-10' },
  { id: 4, name: 'Pimpachol Jaingam', email: 'pimpachol@example.com', phone: '086-456-7890', bookings: 2, totalSpent: 15000, status: 'inactive', joined: '2025-11-05' },
  { id: 5, name: 'Supaporn Mongkol', email: 'supaporn@example.com', phone: '085-678-9012', bookings: 1, totalSpent: 8000, status: 'active', joined: '2026-01-20' },
]

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  banned: 'bg-red-100 text-red-800',
}

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState(MOCK_USERS)

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = (id: number) => {
    if (confirm('Delete this user?')) {
      setUsers(users.filter(u => u.id !== id))
    }
  }

  const toggleStatus = (id: number) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
      }
      return u
    }))
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="text-sm text-gray-600">
              Total: {filteredUsers.length} users
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">User</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Contact</th>
                <th className="text-center py-4 px-6 text-sm font-medium text-gray-600">Bookings</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-gray-600">Total Spent</th>
                <th className="text-center py-4 px-6 text-sm font-medium text-gray-600">Status</th>
                <th className="text-center py-4 px-6 text-sm font-medium text-gray-600">Joined</th>
                <th className="text-center py-4 px-6 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-600">{user.phone}</p>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-medium text-blue-600">{user.bookings}</span> times
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="font-medium text-green-600">
                      {user.totalSpent.toLocaleString()} THB
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[user.status]}`}
                    >
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-center text-sm text-gray-600">
                    {user.joined}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No users found
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
