import PageHeader from '@/components/PageHeader';
import PaymentTable from '@/components/payment/PaymentTable';

export default function PaymentsPage() {
  return (
  <>
     <PageHeader title="Paiements" subtitle="Gérez tous vos paiements ici." />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Liste de Paiements</h2>
          <PaymentTable refreshTrigger={undefined} />
        </div>
      </div>
  </>
   

  );
}
