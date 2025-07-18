'use client';
import { usePathname } from "next/navigation";
import PageHeader from '@/components/PageHeader';
import Payments from '@/components/transaction/PaymentsList';

export default function TransactionPaymentsPage() {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const transactionId = Number.parseInt(segments[segments.indexOf('transactions') + 1]);

  console.log("Transaction ID:", transactionId);

  return (
    <>
      <PageHeader 
        title="Transaction Payments" 
        subtitle={`Payment history for transaction ${transactionId}`}
      />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          {transactionId ? (
            <Payments transactionId={transactionId} />
          ) : (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>ID de transaction invalide</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}