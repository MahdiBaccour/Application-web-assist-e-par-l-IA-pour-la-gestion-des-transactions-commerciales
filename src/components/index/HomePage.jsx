"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import PerformanceIndicators from "@/components/dashboard/PerformanceIndicators";
import TransactionsTable from "@/components/transaction/TransactionsTable";
import BudgetChart from '@/components/dashboard/BudgetChart';
import TopProductsChart from "@/components/dashboard/TopProductsChart";
import { ImSpinner2 } from "react-icons/im";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // ✅ Token validation (first priority once authenticated)
  useEffect(() => {
    if (status === "authenticated" && session) {
      const timeout = setTimeout(() => {
        const validateToken = async () => {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate-token`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
              },
            });

            if (res.status !== 200) {
              setIsTokenValid(false);
              sessionStorage.setItem("loginError", "Session expirée. Veuillez vous reconnecter.");
              router.push("/login");
            }
          } catch (error) {
            setIsTokenValid(false);
            sessionStorage.setItem("loginError", "Erreur de validation du token.");
            router.push("/login");
          } finally {
            setCheckingAccess(false);
          }
        };

        validateToken();
      }, 500); // Delay to ensure session is ready

      return () => clearTimeout(timeout);
    }
  }, [session, status, router]);

  // ✅ Handle redirect only after confirming NOT authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      sessionStorage.setItem("loginError", "Veuillez vous connecter d'abord.");
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || checkingAccess) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ImSpinner2 className="animate-spin text-primary text-4xl" />
      </div>
    );
  }

  if (!session || !isTokenValid) return null;

  const role = session.user.role;

  const handleTotalChange = (total) => {
    console.log("Total transactions amount:", total.toFixed(2));
  };

  return (
    <>
      {role === "owner" && (
        <>
          <PerformanceIndicators token={session.user.accessToken} />
          <DashboardCharts token={session.user.accessToken} />
        </>
      )}

      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">
            {["owner", "employee"].includes(role)
              ? "Transactions récentes"
              : "Historique de vos transactions"}
          </h2>

          <TransactionsTable
            onTotalChange={handleTotalChange}
            onDataCapture={(data) => {
              console.log("Captured transactions:", data);
            }}
          />

          {role === "owner" && (
            <>
              <BudgetChart token={session.user.accessToken} />
              <TopProductsChart token={session.user.accessToken} />
            </>
          )}
        </div>
      </div>
    </>
  );
}