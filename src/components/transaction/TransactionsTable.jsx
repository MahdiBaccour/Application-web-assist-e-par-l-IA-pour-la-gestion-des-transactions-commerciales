"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getTransactions } from "@/services/transactions/transactionService";
import useTransactionFilters from "@/utils/useTransactionFilters";
import { ImSpinner2 } from "react-icons/im";
import { FaPlus, FaSearch, FaFilter, FaCalendarAlt, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import TransactionCard from "./TransactionCard";
import { useSession } from 'next-auth/react';
export default function TransactionsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("credit"); // Default filter
  const [currentPage, setCurrentPage] = useState(1); // Pagination
  const transactionsPerPage = 5;
  const { data: session } = useSession();

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      try {
        const data = await getTransactions(typeFilter,session.user.accessToken);
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
      setLoading(false);
    };
    loadTransactions();
  }, [typeFilter]);

  // Use the filtering hook
  const { filteredTransactions, searchReference, setSearchReference, statusFilter, setStatusFilter, filterDate, setFilterDate } =
    useTransactionFilters(transactions, typeFilter);

  // Pagination Logic
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
      {/* Header - Create Transaction Button */}
      <div className="mb-6 flex justify-between items-center">
        <button onClick={() => router.push(`${pathname}/create`)} className="btn btn-primary flex items-center gap-2">
          <FaPlus /> Create Transaction
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        {/* Transaction Type Filters */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setTypeFilter("credit")}
            className={`btn btn-sm flex items-center gap-1 ${
              typeFilter === "credit" ? "btn-error" : "btn-outline"
            }`}
          >
            <FaArrowRight className="text-sm" /> Credit
          </button>
          <button
            onClick={() => setTypeFilter("debit")}
            className={`btn btn-sm flex items-center gap-1 ${
              typeFilter === "debit" ? "btn-success" : "btn-outline"
            }`}
          >
            <FaArrowLeft className="text-sm" /> Debit
          </button>
        </div>

        {/* Right-side Filters */}
        <div className="flex flex-col gap-3 flex-1 max-w-xl">
          {/* Search Input */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm" />
            <input
              type="text"
              placeholder="Search Reference"
              className="input input-sm input-bordered pl-8"
              value={searchReference}
              onChange={(e) => setSearchReference(e.target.value)}
            />
          </div>

          {/* Date and Status Row */}
          <div className="flex gap-3">
            {/* Date Picker */}
            <div className="relative flex-1">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm" />
              <input
                type="date"
                className="input input-sm input-bordered pl-8 w-full"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative flex-1">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm" />
              <select
                className="select select-sm select-bordered pl-8 w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <table className="table w-full rounded-lg overflow-hidden">
        <thead>
          <tr>
            <th>Date</th>
            <th>Reference</th>
            <th>Amount</th>
            <th>Status</th>
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
                No transactions available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="btn btn-sm"
        >
          First
        </button>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="btn btn-sm mx-2"
        >
          Previous
        </button>
        <span className="text-center mx-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="btn btn-sm mx-2"
        >
          Next
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="btn btn-sm"
        >
          Last
        </button>
      </div>
    </div>
  );
}