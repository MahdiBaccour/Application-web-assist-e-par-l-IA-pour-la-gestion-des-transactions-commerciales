import PageHeader from '@/components/PageHeader';
import ProductsTable from '@/components/products/ProductsTable';

export default function ProductsPage() {
  return (
    <>
      <PageHeader title="Produits" subtitle="Gérez vos produits ici." />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Liste de produits</h2>
          <ProductsTable />
        </div>
      </div>
    </>
  );
}