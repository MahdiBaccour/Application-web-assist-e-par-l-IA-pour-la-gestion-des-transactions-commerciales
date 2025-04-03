import PageHeader from '@/components/PageHeader';
import ProductsTable from '@/components/products/ProductsTable';

export default function ProductsPage() {
  return (
    <>
      <PageHeader title="Products" subtitle="Manage your products here." />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Product List</h2>
          <ProductsTable />
        </div>
      </div>
    </>
  );
}