'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    type: 'general'
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        setFormData({ name: '', email: '', phone: '', subject: '', message: '', type: 'general' })
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Failed to submit form')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ติดต่อเรา</h1>
          <p className="text-gray-600 mb-8">มีคำถามหรือต้องการความช่วยเหลือ? ติดต่อเราได้เลย</p>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6">
              ✅ ขอบคุณที่ติดต่อเรา! เราจะติดต่อกลับภายใน 24 ชั่วโมง
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประเภทการติดต่อ *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="general">ทั่วไป</option>
                <option value="booking">เกี่ยวกับการจอง</option>
                <option value="support">ต้องการความช่วยเหลือ</option>
                <option value="partnership">ร่วมงานกับเรา</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อ-นามสกุล *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="กรอกชื่อของคุณ"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมล *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เบอร์โทรศัพท์
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0812345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หัวข้อ *
              </label>
              <Input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="หัวข้อที่ต้องการติดต่อ"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ข้อความ *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="รายละเอียด..."
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'กำลังส่ง...' : 'ส่งข้อความ'}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">ข้อมูลติดต่อ</h3>
            <div className="space-y-2 text-gray-600">
              <p>📧 อีเมล: hello@gotjourneythailand.com</p>
              <p>📞 โทร: +66 2 123 4567</p>
              <p>💬 LINE: @gotjourney</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
