// components/PerformanceIndicators.jsx
'use client'

const performanceData = [
  { metric: 'Sales', value: '+12%', trend: 'up' },
  { metric: 'Revenue', value: '+8%', trend: 'up' },
  { metric: 'Units Sold', value: '-5%', trend: 'down' },
];

export default function PerformanceIndicators() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {performanceData.map((item, index) => (
        <div
          key={index}
          className={`p-6 rounded-lg shadow ${
            item.trend === 'up' ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <h3
            className="text-lg font-semibold"
            style={{ color:  '#2F4F4F' }}
          >
            {item.metric}
          </h3>
          <p
            className={`text-2xl font-bold ${
              item.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {item.value}
          </p>
          <p className="text-sm text-gray-500">Compared to last month</p>
        </div>
      ))}
    </div>
  );
}