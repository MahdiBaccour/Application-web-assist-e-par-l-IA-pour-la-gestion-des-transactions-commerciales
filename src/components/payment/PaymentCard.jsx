"use client";
import { FaEdit, FaTrash } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";

export default function PaymentCard({
  payment,
  onEdit,
  onDelete,
  isLoadingDelete,
}) {
  return (
    <tr className="hover">
      <td>{payment.transaction_id}</td>
      <td>${payment.amount_paid}</td>
      <td className="capitalize">{payment.payment_method}</td>
      <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
      <td>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(payment.id)}
            className="btn btn-primary btn-xs"
          >
            <FaEdit />
          </button>
          
          <button
            onClick={() => onDelete(payment.id)}
            className="btn btn-error btn-xs"
            disabled={isLoadingDelete === payment.id}
          >
            {isLoadingDelete === payment.id ? (
              <ImSpinner2 className="animate-spin" />
            ) : (
              <FaTrash />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}