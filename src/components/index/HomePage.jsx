"use client"
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import PerformanceIndicators from "@/components/dashboard/PerformanceIndicators";
import TransactionsTable from "@/components/transaction/TransactionsTable";

export default function HomePage() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    async function loadSession() {
      const currentSession = await getSession();
      setSession(currentSession);
    }
    loadSession();
  }, []);

  if (!session) {
    return <p>Loading...</p>;
  }

  return session.user.role === "owner" ? (
    <>
      <PerformanceIndicators />
      <DashboardCharts />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Recent Transactions</h2>
          <TransactionsTable />
        </div>
      </div>
    </>
  ) : (
    <p className="text-lg font-semibold">Role: {session.user.role}</p>
  );
}