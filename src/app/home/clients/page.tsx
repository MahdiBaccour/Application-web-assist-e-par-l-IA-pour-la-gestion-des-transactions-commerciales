import PageHeader from '@/components/PageHeader';
import ClientTable from '@/components/client/ClientTable';

export default function ClientsPage() {
  return (
    <>
      <PageHeader title="Clients" subtitle="Gérez vos clients ici." />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Liste de Clients</h2>
          <ClientTable />
        </div>
      </div>
    </>
  );
}