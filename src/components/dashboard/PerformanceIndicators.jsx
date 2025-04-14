'use client'
import { useEffect, useState } from 'react'
import { getPerformanceData } from '@/services/dashboardStats/dashboardStatsService'
import { FaShoppingCart, FaMoneyBillWave, FaBalanceScale, FaCubes } from 'react-icons/fa'
import { BiLineChart } from 'react-icons/bi'

const PerformanceIndicators = ({ token }) => {
  const [metrics, setMetrics] = useState({
    sales: { value: '0%', absolute: 0, trend: 'neutral' },
    expenses: { value: '0%', absolute: 0, trend: 'neutral' },
    net: { value: '0%', absolute: 0, trend: 'neutral' },
    units: { value: '0%', absolute: 0, trend: 'neutral' },
    margin: { value: '0%', absolute: 0, trend: 'neutral' }
  });

  const [loading, setLoading] = useState(true);

  const labelsFr = {
    sales: 'Ventes',
    expenses: 'Dépenses',
    net: 'Revenu net',
    units: 'Unités vendues',
    margin: 'Marge bénéficiaire'
  };

  const icons = {
    sales: <FaShoppingCart className="text-2xl" />,
    expenses: <FaMoneyBillWave className="text-2xl" />,
    net: <FaBalanceScale className="text-2xl" />,
    units: <FaCubes className="text-2xl" />,
    margin: <BiLineChart className="text-2xl" />
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getPerformanceData(token);
        if (response.success) setMetrics(response.data);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  if (loading) return <div className="skeleton h-32 w-full"></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      {Object.entries(metrics).map(([key, metric]) => (
        <div
          key={key}
          className={`card shadow-sm ${
            metric.trend === 'up' ? 'bg-success/90' : 'bg-error/90'
          } text-base-content`}
        >
          <div className="card-body p-4">
            <div className="flex items-center gap-2">
              {icons[key]}
              <h3 className="card-title capitalize text-lg">{labelsFr[key]}</h3>
            </div>
            <p className="text-2xl font-bold">{metric.value}</p>
            <p className="text-sm">
              {['sales', 'expenses', 'net', 'margin'].includes(key) ? 'DT ' : ''}
              {metric.absolute.toLocaleString()}
              {key === 'units' ? ' unités' : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PerformanceIndicators;