'use client'
import { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

const NetBalanceChart = ({ chartData }) => {
  const [offset, setOffset] = useState(50); // Default offset

  useEffect(() => {
    if (chartData?.budgetTrend?.length) {
      const values = chartData.budgetTrend.map(d => d.net_balance)
      const min = Math.min(...values)
      const max = Math.max(...values)

      // Avoid divide by zero
      if (max === min) return setOffset(50)

      const zeroOffset = ((max - 0) / (max - min)) * 100
      setOffset(zeroOffset)
    }
  }, [chartData])

  return (
    <div className="p-6  rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Solde net Évolution</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData.budgetTrend}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <defs>
              <linearGradient id="netColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset={`${offset}%`} stopColor="green" stopOpacity={0.7} />
                <stop offset={`${offset}%`} stopColor="red" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="net_balance"
              stroke="#000"
              fill="url(#netColor)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default NetBalanceChart;