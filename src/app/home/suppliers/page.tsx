
import PageHeader from '@/components/PageHeader';
import SupplierTable from '@/components/supplier/SupplierTable';

export default function SuppliersPage() {
  return (
<>

      <PageHeader title="Suppliers" subtitle="Manage your suppliers here." />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Supplier List</h2>
          <SupplierTable />
        </div>
      </div>
      </>
  );
}
