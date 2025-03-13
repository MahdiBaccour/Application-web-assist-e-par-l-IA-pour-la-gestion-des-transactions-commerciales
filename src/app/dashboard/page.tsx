// pages/dashboard.jsx
import DashboardLayout from '@/components/DashboardLayout';
import DashboardCharts from '@/components/DashboardCharts';
import PerformanceIndicators from '@/components/PerformanceIndicators'; // Import the new component
import TransactionsTable from '@/components/TransactionsTable'; // Import the new component
export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Performance Indicators */}
      <PerformanceIndicators />

      {/* Charts Section */}
      <DashboardCharts />

      {/* Recent Transactions Table */}
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Recent Transactions</h2>
          {/* Render transactions table */}
          <TransactionsTable />
        </div>
      </div>
    </DashboardLayout>
  );
}