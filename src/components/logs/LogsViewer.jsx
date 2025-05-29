"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaSpinner, FaClipboardList, FaSearch } from "react-icons/fa";
import LogsTable from "./LogsTable";
import AuditTrail from "@/components/audit/AuditTrail"; // Assuming you have an AuditTrail component

export default function LogsViewer() {
  const { data: session } = useSession();
  const router = useRouter();
  const [viewType, setViewType] = useState("logs");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session?.user.role !== "owner") {
      router.push("/forbidden");
    }
  }, [session, router]);

  const handleViewChange = (type) => {
    setViewType(type);
    setError(null);
  };

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
        <button
          className={`btn ${viewType === "logs" ? "btn-primary" : "btn-outline"}`}
          onClick={() => handleViewChange("logs")}
        >
          <FaClipboardList className="mr-2" /> Logs Utilisateurs
        </button>
        <button
          className={`btn ${viewType === "audit" ? "btn-primary" : "btn-outline"}`}
          onClick={() => handleViewChange("audit")}
        >
          <FaSearch className="mr-2" /> Audit Trail
        </button>
      </div>

      {error && (
        <div className="alert alert-error shadow-lg mb-4">
          <div>
            <span>{error}</span>
          </div>
        </div>
      )}

      {viewType === "logs" && <LogsTable limit={10} />}
      
      {viewType === "audit" && (
        // <div className="alert alert-info">
        //   <span>Module Audit Trail en cours d’implémentation...</span>
        // </div>
<AuditTrail limit={10} />
      )}
    </div>
  );
}