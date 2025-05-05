'use client'
import { useState, useEffect,useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { getTopProducts } from '@/services/dashboardStats/dashboardStatsService'

const COLORS = ['#8884d8', '#82ca9d']

const TopProductsChart = ({ token,onCapture }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const chartRef = useRef()

  useEffect(() => {
    const fetchData = async () => {
      const response = await getTopProducts(token)
      if (response.success) {
        setData(response.data.map(product => ({
          name: product.name,
          units: product.total_sold,
          revenue: product.total_revenue
        })))
        setError(null)
      } else {
        setError(response.message)
      }
      setLoading(false)
    }

    fetchData()
  }, [token])

  useEffect(() => {
    if (onCapture && chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const base64 = canvas.toDataURL("image/png");
        onCapture(base64); // Pass it up to parent
      });
    }
  }, [onCapture]);

  if (loading) return <div className="skeleton h-96 w-full"></div>

  if (error) {
    return (
      <div className="alert alert-error mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span>Erreur : {error}</span>
      </div>
    )
  }

  return (
    <div ref={chartRef} className="card bg-base-100 shadow-xl mt-8">
      <div className="card-body">
        <h2 className="card-title">Top produits vendus</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip 
                formatter={(value, name) => 
                  name === 'Unités vendues'
                    ? [`${value} unités`, name]
                    : [`${value.toLocaleString()} TND`, name]
                }
              />
              <Legend />
              <Bar yAxisId="left" dataKey="units" fill={COLORS[0]} name="Unités vendues" />
              <Bar yAxisId="right" dataKey="revenue" fill={COLORS[1]} name="Revenu généré" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default TopProductsChart;