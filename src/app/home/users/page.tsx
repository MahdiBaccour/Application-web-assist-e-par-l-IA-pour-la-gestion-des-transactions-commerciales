import PageHeader from '@/components/PageHeader';
import UserTable from '@/components/user/UserTable';

export default function UsersPage() {
  return (
    <>
      <PageHeader title="Utilisateurs" subtitle="Gérez vos utilisateurs ici." />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Liste des utilisateurs</h2>
          <UserTable />
        </div>
      </div>
    </>
  );
}
