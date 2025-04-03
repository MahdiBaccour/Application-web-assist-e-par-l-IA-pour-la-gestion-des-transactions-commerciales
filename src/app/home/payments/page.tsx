import PageHeader from '@/components/PageHeader';
import PaymentTable from '@/components/payment/PaymentTable';

export default function PaymentsPage() {
  return (
  <>
     <PageHeader title="Payments" subtitle="Manage all your payments here." />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Payment List</h2>
          <PaymentTable refreshTrigger={undefined} />
        </div>
      </div>
  </>
   

  );
}
