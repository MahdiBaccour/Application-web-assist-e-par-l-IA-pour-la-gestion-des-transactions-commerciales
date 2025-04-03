import PageHeader from '@/components/PageHeader';
import ClientTable from '@/components/client/ClientTable';

export default function ClientsPage() {
  return (
    <>
      <PageHeader title="Clients" subtitle="Manage your clients here." />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Client List</h2>
          <ClientTable />
        </div>
      </div>
    </>
  );
}