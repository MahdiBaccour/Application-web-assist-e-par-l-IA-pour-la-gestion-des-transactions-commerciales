"use client"
import {  usePathname } from "next/navigation";
import PageHeader from '@/components/PageHeader';
import TransactionDetails from '@/components/transaction/TransactionDetails';

export default function TransactionsPage() {
  const pathname = usePathname();
  const id = pathname.split("/").pop(); // Extract the transaction ID from URL
  console.log(id);

  return (
    <>
      <PageHeader title="Détails de la transaction" subtitle="Détails de la transaction sélectionnée" />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
     
          {id ? <TransactionDetails /> : <p className="text-center text-red-500">ID de transaction introuvable</p>}
        </div>
      </div>
    </>
  );
}