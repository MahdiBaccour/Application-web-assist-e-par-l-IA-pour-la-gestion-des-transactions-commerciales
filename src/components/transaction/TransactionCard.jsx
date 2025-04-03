"use client";
import { FaEye } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";

export default function TransactionCard({ transaction, isCredit }) {
  const router = useRouter();
  const pathname = usePathname(); // Get the current route

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return "badge-success";
      case "pending":
        return "badge-warning"; // Yellow
      case "overdue":
        return "badge-error"; // Red
      default:
        return "badge-neutral";
    }
  };

  return (
    <tr className="hover">
      <td>{new Date(transaction.date).toLocaleDateString()}</td>
      <td>{transaction.reference_number}</td>
      <td>{transaction.amount} $</td>
      <td>
        <span className={`badge ${getStatusBadge(transaction.status)}`}>
          {transaction.status}
        </span>
      </td>
      <td>{isCredit ? transaction.client_name || "N/A" : transaction.supplier_name || "N/A"}</td>
      <td>
        <button
          onClick={() => router.push(`${pathname}/${transaction.id}`)} // Correctly append the transaction ID
          className="btn btn-xs btn-info flex items-center gap-1"
        >
          <FaEye /> Details
        </button>
      </td>
    </tr>
  );
}