// components/logs/LogsViewer.jsx
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaSpinner, FaClipboardList, FaSearch, FaEnvelope, FaHistory } from "react-icons/fa";
import LogsTable from "./LogsTable";
import AuditTrail from "@/components/audit/AuditTrail";
import EmailLogsTable from "./EmailLogsTable";

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
      <div className="flex flex-wrap gap-4 mb-4">
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
        <button
          className={`btn ${viewType === "emailLogs" ? "btn-primary" : "btn-outline"}`}
          onClick={() => handleViewChange("emailLogs")}
        >
          <FaEnvelope className="mr-2" /> Journal des Emails
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
      {viewType === "audit" && <AuditTrail limit={10} />}
      {viewType === "emailLogs" && <EmailLogsTable limit={10} />}
    </div>
  );
}