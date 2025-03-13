import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import ClientTable from '@/components/ClientTable';

export default function ClientsPage() {
  return (
    <DashboardLayout>
      <PageHeader title="Clients" subtitle="Manage your clients here." />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Client List</h2>
          <ClientTable />
        </div>
      </div>
    </DashboardLayout>
  );
}
