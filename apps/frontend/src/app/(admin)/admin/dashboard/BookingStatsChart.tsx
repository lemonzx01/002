'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

interface BookingStatsChartProps {
  data: { status: string; count: number }[]
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#10B981',
  pending: '#F59E0B',
  cancelled: '#EF4444',
  completed: '#3B82F6',
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  cancelled: 'Cancelled',
  completed: 'Completed',
}

export function BookingStatsChart({ data }: BookingStatsChartProps) {
  const chartData = data.map((item) => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    color: STATUS_COLORS[item.status] || '#6B7280',
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value) => <span className="text-gray-600 text-sm">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
