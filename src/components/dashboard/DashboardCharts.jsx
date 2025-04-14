'use client'
import { useEffect, useState } from 'react'
import { 
  LineChart, ComposedChart, PieChart, AreaChart, 
  Line, Bar, Pie, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, Cell,ResponsiveContainer
} from 'recharts'
import { getChartData } from '@/services/dashboardStats/dashboardStatsService'
import NetBalanceChart from './NetBalanceChart'
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF']

const DashboardCharts = ({ token }) => {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getChartData(token)
        if (response.success) {
          const parsed = {
            ...response.data,
            paymentMethods: response.data.paymentMethods.map(method => ({
              ...method,
              value: Number(method.value)
            }))
          }
          setChartData(parsed)
        }
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [token])

  if (loading) return <div className="skeleton h-96 w-full"></div>
  if (!chartData) return <div>Pas de données disponibles</div>
 
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Sales vs Purchases Trend */}
      <div className="p-6  rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Ventes et achats</h3>
        <LineChart 
          width={500} 
          height={300} 
          data={chartData.salesTrend}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="sales" 
            stroke="#8884d8" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="purchases" 
            stroke="#82ca9d" 
            strokeWidth={2}
          />
        </LineChart>
      </div>

      {/* Income vs Expenses */}
      <div className="p-6  rounded-lg shadow">
  <h3 className="text-lg font-semibold mb-4">Revenus et dépenses</h3>
  <div className="h-96">
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={chartData.incomeExpense}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="income" fill="#8884d8" name="Revenu total" barSize={30} />
        <Line type="monotone" dataKey="total_expenses" stroke="#ff7300" name="Dépenses totales" strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  </div>
</div>

      {/* Payment Methods Distribution */}
      <div className="p-6  rounded-lg shadow" style={{ minHeight: 350 }}>
      <h3 className="text-lg font-semibold mb-4">Modes de paiement</h3>
      <PieChart width={500} height={300}>
              <Pie
          data={chartData.paymentMethods}
          dataKey="value"
          nameKey="name"
          cx={190} // shifted slightly left
          cy={150}
          outerRadius={100}
          fill="#8884d8"
          label
        >
          {chartData.paymentMethods.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend layout="vertical" align="right" verticalAlign="middle" />
      </PieChart>
    </div>

      {/* Net Balance Trend */}
      <NetBalanceChart chartData={chartData} />
    </div>
  )
}

export default DashboardCharts