"use client";

import { FaEdit, FaToggleOff, FaToggleOn } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";

export default function SupplierCard({ supplier, onEdit, onToggleStatus, isLoadingStatus }) {
  return (
    <tr className="hover">
      <td>{supplier.name}</td>
      <td>{supplier.email}</td>
      <td>{supplier.phone}</td>
      <td>{supplier.address}</td>
      <td>
        <span className={`badge ${supplier.status_supplier === "active" ? "badge-success" : "badge-error"}`}>
          {supplier.status_supplier}
        </span>
      </td>
      <td>
        <button onClick={() => onEdit(supplier.id)} className="btn btn-primary btn-xs mr-2">
          <FaEdit />
        </button>
        <button
          onClick={() => onToggleStatus(supplier.id, supplier.status_supplier)}
          className={`btn btn-xs ${supplier.status_supplier === "active" ? "btn-error" : "btn-success"}`}
          disabled={isLoadingStatus === supplier.id}
        >
          {isLoadingStatus === supplier.id ? (
            <ImSpinner2 className="animate-spin" />
          ) : supplier.status_supplier === "active" ? (
            <>
              <FaToggleOff /> Définir inactif
            </>
          ) : (
            <>
              <FaToggleOn /> Définir actif
            </>
          )}
        </button>
      </td>
    </tr>
  );
}