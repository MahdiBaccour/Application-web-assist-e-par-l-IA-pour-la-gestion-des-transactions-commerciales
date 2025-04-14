import PageHeader from '@/components/PageHeader';
import TransactionsTable from '@/components/transaction/TransactionsTable';
export default function TransactionsPage() {
    return (
      <>
    <PageHeader title="Transactions" subtitle="gérer les transactions"/>
     <div className="card bg-base-100 shadow-xl mt-8">
            <div className="card-body">
              <h2 className="card-title">Liste des transactions</h2>
          <TransactionsTable />
            </div>
          </div>
      </>
    );
  }