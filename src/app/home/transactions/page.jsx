import PageHeader from '@/components/PageHeader';
import TransactionsTable from '@/components/transaction/TransactionsTable';
export default function TransactionsPage() {
    return (
      <>
    <PageHeader title="Transactions" subtitle="manage Transactions"/>
     <div className="card bg-base-100 shadow-xl mt-8">
            <div className="card-body">
              <h2 className="card-title">Transactions List</h2>
          <TransactionsTable />
            </div>
          </div>
      </>
    );
  }