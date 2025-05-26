import PageHeader from '@/components/PageHeader';
import BudgetTable from '@/components/budget/BudgetTable';

export default function BudgetPage() {
  return (
    <>
      <PageHeader title="Budget" subtitle="Voir les Bugets" />
      <div className="card bg-base-100 shadow-xl mt-8">
         <div className="card-body p-4">
          <BudgetTable />
        </div>
      </div>
    </>
  );
}
