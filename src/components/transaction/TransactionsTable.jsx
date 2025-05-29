"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getTransactions, getTransactionsClientOrSupplier } from "@/services/transactions/transactionService";
import useTransactionFilters from "@/utils/useTransactionFilters";
import { ImSpinner2 } from "react-icons/im";
import { FaPlus, FaSearch, FaFilter, FaCalendarAlt, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import TransactionCard from "./TransactionCard";
import { useSession } from 'next-auth/react';

export default function TransactionsTable({
  startDate,
  endDate,
  onTotalChange = () => {},
  onDataCapture = () => {},
  disableAdd = false,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("credit");
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;
  const { data: session } = useSession();

  useEffect(() => {
    if ( !session) {
      router.push("/home/forbidden");
    }
  }, []);

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      try {
        let response;

        if (session?.user.role === "client") {
          response = await getTransactionsClientOrSupplier(
            typeFilter,
            startDate || undefined,
            endDate || undefined,
            session.user.id,
            undefined,
            session?.user.accessToken
          );
        } else if (session?.user.role === "supplier") {
          response = await getTransactionsClientOrSupplier(
            typeFilter,
            startDate || undefined,
            endDate || undefined,
            undefined,
            session.user.id,
            session?.user.accessToken
          );
        } else {
          response = await getTransactions(
            typeFilter,
            startDate || undefined,
            endDate || undefined,
            session?.user.accessToken
          );
        }

        const filteredByDate = (response.transactions || []).filter(transaction => {
          const transactionDate = new Date(transaction.date);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;

          if (start && end) return transactionDate >= start && transactionDate <= end;
          if (start) return transactionDate >= start;
          if (end) return transactionDate <= end;
          return true;
        });

        setTransactions(filteredByDate);

        const total = filteredByDate.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
        onTotalChange(total);
        onDataCapture(filteredByDate);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
      setLoading(false);
    };

    loadTransactions();
  }, [typeFilter, startDate, endDate]);

  const {
    filteredTransactions,
    searchReference,
    setSearchReference,
    statusFilter,
    setStatusFilter,
    filterDate,
    setFilterDate
  } = useTransactionFilters(transactions, typeFilter);

  const handleCreateClick = () => {
  const basePath = pathname.includes("transactions") ? pathname : `${pathname}/transactions`;
  router.push(`${basePath}/create`);
  };

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  if (loading)
    return (
      <div className="flex justify-center items-center mt-10">
        <ImSpinner2 className="animate-spin text-4xl text-primary" />
      </div>
    );

  return (
    <div className="overflow-x-auto">
    {!disableAdd && (session?.user.role === "owner" || session?.user.role === "employee") && (
  <div className="mb-6 flex justify-between items-center">
    <button  onClick={handleCreateClick} className="btn btn-primary flex items-center gap-2">
      <FaPlus /> Créer une transaction
    </button>
  </div>
)}

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setTypeFilter("credit")}
            className={`btn btn-sm flex items-center gap-1 ${typeFilter === "credit" ? "btn-error" : "btn-outline"}`}
          >
            <FaArrowRight className="text-sm" /> Crédit
          </button>
          <button
            onClick={() => setTypeFilter("debit")}
            className={`btn btn-sm flex items-center gap-1 ${typeFilter === "debit" ? "btn-success" : "btn-outline"}`}
          >
            <FaArrowLeft className="text-sm" /> Débit
          </button>
        </div>

        <div className="flex flex-col gap-3 flex-1 max-w-xl">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm" />
            <input
              type="text"
              placeholder="Recherche de référence"
              className="input input-sm input-bordered pl-8"
              value={searchReference}
              onChange={(e) => setSearchReference(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm" />
              <input
                type="date"
                className="input input-sm input-bordered pl-8 w-full"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            <div className="relative flex-1">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm" />
              <select
                className="select select-sm select-bordered pl-8 w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="paid">Payé</option>
                <option value="pending">En attente</option>
                <option value="overdue">En retard</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <table className="table w-full rounded-lg overflow-hidden">
        <thead>
          <tr>
            <th>Date</th>
            <th>Référence</th>
            <th>Montant</th>
            <th>Statut</th>
            <th>{typeFilter === "credit" ? "Client" : "Supplier"}</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentTransactions.length > 0 ? (
            currentTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} isCredit={typeFilter === "credit"} />
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center text-gray-400">
                Aucune transaction disponible
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-center mt-6">
        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="btn btn-sm">Première</button>
        <button onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} className="btn btn-sm mx-2">Précédente</button>
        <span className="text-center mx-2">Page {currentPage} de {totalPages}</span>
        <button onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="btn btn-sm mx-2">Suivant</button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="btn btn-sm">Dernière</button>
      </div>
    </div>
  );
}

// ➕ Minimal export version (no filters/add)
export function TransactionsTableSimple({ startDate, endDate, onTotalChange = () => {}, onDataCapture = () => {} }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      try {
        const response = await getTransactions(
          undefined,
          startDate || undefined,
          endDate || undefined,
          session?.user.accessToken
        );
        const filteredByDate = (response.transactions || []).filter((transaction) => {
          const transactionDate = new Date(transaction.date);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          if (start && end) return transactionDate >= start && transactionDate <= end;
          if (start) return transactionDate >= start;
          if (end) return transactionDate <= end;
          return true;
        });
        setTransactions(filteredByDate);
        const total = filteredByDate.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
        onTotalChange(total);
        onDataCapture(filteredByDate);
      } catch (err) {
        console.error("Error fetching simple transactions:", err);
      }
      setLoading(false);
    };

    loadTransactions();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <ImSpinner2 className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full rounded-lg overflow-hidden">
        <thead>
          <tr>
            <th>Date</th>
            <th>Référence</th>
            <th>Amount</th>
            <th>Montant</th>
            <th>Client/Fournisseur</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} isCredit={transaction.type === "credit"} hideActions />
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-gray-400">
                Pas de transactions disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
