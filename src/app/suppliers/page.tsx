import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import SupplierTable from '@/components/SupplierTable';

export default function SuppliersPage() {
  return (
    <DashboardLayout>
      <PageHeader title="Suppliers" subtitle="Manage your suppliers here." />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Supplier List</h2>
          <SupplierTable />
        </div>
      </div>
    </DashboardLayout>
  );
}
