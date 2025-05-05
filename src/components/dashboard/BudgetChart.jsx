'use clietnt'
import { useState, useEffect,useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getBudgetData } from '@/services/dashboardStats/dashboardStatsService'
import html2canvas from 'html2canvas';

const BudgetChart = ({ token ,onCapture}) => {
  const [data, setData] = useState([])
  const [years, setYears] = useState([])
  const [selectedYear, setSelectedYear] = useState('')
  const [error, setError] = useState(null)
  const chartRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const response = await getBudgetData(token, selectedYear)
      if (response.success) {
        setYears(response.data.years)
        setData(response.data.budgetData.map(d => ({
          period: d.period,
          gross: Number(d.total_income_brut),
          net: Number(d.total_income_net),
          expenses: Number(d.total_expenses)
        })))
        setError(null)
      } else {
        setError(response.message)
      }
    }
    fetchData()
  }, [token, selectedYear])

  useEffect(() => {
    if (onCapture && chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const base64 = canvas.toDataURL("image/png");
        onCapture(base64); // Pass it up to parent
      });
    }
  }, [onCapture]);

  return (
    <div ref={chartRef} className="card bg-base-100 shadow-xl mt-8">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">Aperçu du budget</h2>
          <select 
            className="select select-bordered w-40" 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Toutes les années</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Erreur dans la récupération du budget : {error}</span>
          </div>
        )}

        {!error && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }}
                />
                <Legend />
                <Bar dataKey="gross" fill="#8884d8" name="Revenu brut" />
                <Bar dataKey="net" fill="#82ca9d" name="Revenu net" />
                <Bar dataKey="expenses" fill="#ff8042" name="Dépenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

export default BudgetChart