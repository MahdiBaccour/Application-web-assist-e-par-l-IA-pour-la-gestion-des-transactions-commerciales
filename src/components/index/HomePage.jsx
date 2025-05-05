"use client"
import { useSession } from "next-auth/react";
import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import PerformanceIndicators from "@/components/dashboard/PerformanceIndicators";
import TransactionsTable from "@/components/transaction/TransactionsTable";
import BudgetChart from '@/components/dashboard/BudgetChart';
import TopProductsChart from "@/components/dashboard/TopProductsChart";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isTokenValid, setIsTokenValid] = useState(true); // Assume valid by default

  useEffect(() => {
    const checkAccess = async () => {
      if (status === "authenticated") {
        if (session?.user.role !== "owner") {
          router.push("/home/forbidden");
        }

        // ✅ Optional: Check token validity with a backend call
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate-token`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session?.user.accessToken}`,
            },
          });

          if (res.status !== 200) {
            setIsTokenValid(false);
            router.push("/login"); // Token expired or invalid
          }
        } catch (error) {
          setIsTokenValid(false);
          router.push("/login");
        }
      }
    };

    checkAccess();
  }, [session, status, router]);

  if (status === "loading" || !isTokenValid) {
    return <p>Chargement...</p>;
  }

  if (!session || session.user.role !== "owner") {
    return null;
  }

  const handleTotalChange = (total) => {
    console.log("Total transactions amount:", total.toFixed(2));
  };

  return (
    <>
      <PerformanceIndicators token={session?.user.accessToken} />
      <DashboardCharts token={session.user.accessToken} />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Transactions récentes</h2>
          <TransactionsTable  onTotalChange={handleTotalChange} onDataCapture={(data) => {
    // capture logic here
    console.log("Captured transactions for report:", data);
  }}/>
          <BudgetChart token={session?.user.accessToken} />
          <TopProductsChart token={session?.user.accessToken} />
        </div>
      </div>
    </>
  );
}