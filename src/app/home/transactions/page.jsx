'use client';
import PageHeader from '@/components/PageHeader';
import TransactionsTable from '@/components/transaction/TransactionsTable';

export default function TransactionsPage() {
  // Optional: track total in this page
  const handleTotalChange = (total) => {
    console.log("Total transactions amount:", total.toFixed(2));
  };

  return (
    <>
      <PageHeader title="Transactions" subtitle="Gérez les transactions ici." />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Liste des transactions</h2>
          <TransactionsTable onTotalChange={handleTotalChange} />
        </div>
      </div>
    </>
  );
}