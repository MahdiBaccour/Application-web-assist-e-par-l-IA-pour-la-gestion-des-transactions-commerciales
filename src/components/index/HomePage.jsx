"use client"
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import PerformanceIndicators from "@/components/dashboard/PerformanceIndicators";
import TransactionsTable from "@/components/transaction/TransactionsTable";
import BudgetChart from '@/components/dashboard/BudgetChart';
import TopProductsChart from "@/components/dashboard/TopProductsChart";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();


  useEffect(() => {
    if ( session?.user.role !== "owner") {
      router.push("/forbidden");
    }
  }, [status, session, router]);
  if (status === "loading") {
    return <p>Chargement...</p>;
  }

  if (!session || session?.user.role !== "owner") {
    return null; // Avoid flickering
  }
  

  return (
    <>
      <PerformanceIndicators token={session?.user.accessToken} />
      <DashboardCharts token={session.user.accessToken} />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Transactions récentes</h2>
          <TransactionsTable />
          <BudgetChart token={session?.user.accessToken} />
          <TopProductsChart token={session?.user.accessToken} />
        </div>
      </div>
    </>
  );
}