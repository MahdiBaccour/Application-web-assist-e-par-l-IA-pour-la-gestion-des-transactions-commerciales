"use client";
import { FaEdit, FaToggleOff, FaToggleOn, FaEye } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";

export default function ProductCard({ product, onEdit, onToggleStatus, isLoadingStatus, onViewDetails }) {
  const getStatusBadge = (status) => {
    return status === "active" ? "badge-success" : "badge-error";
  };

  return (
    <tr className="hover">
      <td>{product.name}</td>
      <td>{product.category_name || "Uncategorized"}</td>
      <td>${product.selling_price}</td>
      <td>{product.stock_quantity}</td>
      <td>
        <span className={`badge ${getStatusBadge(product.status)}`}>
          {product.status}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {/* ✅ Fix: Ensure Edit triggers update mode */}
          <button
            onClick={() => onEdit(product.id)}
            className="btn btn-xs btn-primary flex items-center gap-1"
          >
            <FaEdit /> Edit
          </button>

          {/* ✅ View Details Button */}
          <button
            onClick={() => onViewDetails(product.id)}
            className="btn btn-xs btn-info flex items-center gap-1"
          >
            <FaEye /> View
          </button>

          <button
            onClick={() => onToggleStatus(product.id, product.status)}
            className={`btn btn-xs ${product.status === "active" ? "btn-error" : "btn-success"}`}
            disabled={isLoadingStatus === product.id}
          >
            {isLoadingStatus === product.id ? (
              <ImSpinner2 className="animate-spin" />
            ) : product.status === "active" ? (
              <>
                <FaToggleOff /> Deactivate
              </>
            ) : (
              <>
                <FaToggleOn /> Activate
              </>
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}