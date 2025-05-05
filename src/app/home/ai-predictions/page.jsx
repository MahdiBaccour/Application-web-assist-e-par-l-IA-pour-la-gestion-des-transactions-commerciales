"use client";
import { useState } from "react";
import ClientClassification from "@/components/client/ClientClassification";
import SupplierClassification from "@/components/supplier/SupplierClassification";
import BudgetPrediction from "@/components/budget/BudgetPrediction";

export default function HomePage() {
  const [view, setView] = useState("client");

  return (
    <>
      <div className="flex justify-end p-4">
        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
          className="select select-bordered"
        >
          <option value="client">Classification des Clients</option>
          <option value="supplier">Classification des Fournisseurs</option>
        </select>
      </div>

      {view === "client" && <ClientClassification />}
      {view === "supplier" && <SupplierClassification />}
      <BudgetPrediction />
    </>
  );
}