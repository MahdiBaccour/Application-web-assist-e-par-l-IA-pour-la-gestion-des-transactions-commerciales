import PageHeader from '@/components/PageHeader';
import TransactionForm from "@/components/transaction/CreateTransaction/TransactionForm";

export default function CreateTransactionPage() {
  return (
    <>
      <PageHeader 
        title="Créer une nouvelle transaction" 
        subtitle="Enregistrer les nouvelles transactions financières"
      />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Détails de la transaction</h2>
          <TransactionForm />
        </div>
      </div>
    </>
  );
}