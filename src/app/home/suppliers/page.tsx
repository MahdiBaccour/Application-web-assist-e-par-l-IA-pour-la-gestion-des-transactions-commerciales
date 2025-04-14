
import PageHeader from '@/components/PageHeader';
import SupplierTable from '@/components/supplier/SupplierTable';

export default function SuppliersPage() {
  return (
<>

      <PageHeader title="Fournisseurs" subtitle="Gérez vos fournisseurs ici." />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Liste des fournisseurs</h2>
          <SupplierTable />
        </div>
      </div>
      </>
  );
}
