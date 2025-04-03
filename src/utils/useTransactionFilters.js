"use client";
import { useState, useEffect } from "react";

export default function useTransactionFilters(transactions) {
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchReference, setSearchReference] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    let filteredData = transactions;

    // Filter by reference
    if (searchReference.trim() !== "") {
      filteredData = filteredData.filter(transaction =>
        transaction.reference_number.toLowerCase().includes(searchReference.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter) {
      filteredData = filteredData.filter(transaction => transaction.status === statusFilter);
    }

    // Filter by date
    if (filterDate) {
      filteredData = filteredData.filter(transaction =>
        new Date(transaction.date).toISOString().split("T")[0] === filterDate
      );
    }

    setFilteredTransactions(filteredData);
  }, [transactions, searchReference, statusFilter, filterDate]);

  return { filteredTransactions, searchReference, setSearchReference, statusFilter, setStatusFilter, filterDate, setFilterDate };
}