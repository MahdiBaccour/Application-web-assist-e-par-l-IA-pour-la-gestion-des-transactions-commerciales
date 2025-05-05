
import PageHeader from '@/components/PageHeader';
import CategoriesTable from '@/components/categories/CategoryTable';

export default function CategoriesPage() {
  return (
    <>
      <PageHeader title="Catégories" subtitle="Gérez vos catégories ici." />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Liste des catégories</h2>
          <CategoriesTable />
        </div>
      </div>
    </>
  );
}