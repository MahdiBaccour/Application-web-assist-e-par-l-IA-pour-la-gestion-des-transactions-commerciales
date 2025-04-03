"use client";
import { FaEdit, FaToggleOff, FaToggleOn } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";

export default function ClientCard({
  client,
  onEdit,
  onToggleStatus,
  isLoadingDelete,
}) {
  return (
    <tr className="hover">
      <td>{client.name}</td>
      <td>{client.email}</td>
      <td>{client.phone}</td>
      <td>{client.address}</td>
      <td>
        <button
          onClick={() => onEdit(client.id)}
          className="btn btn-primary btn-xs mr-2"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => onToggleStatus(client.id, client.status_client)}
          className={`btn btn-xs ${
            client.status_client === "active" ? "btn-error" : "btn-success"
          }`}
          disabled={isLoadingDelete === client.id}
        >
          {isLoadingDelete === client.id ? (
            <ImSpinner2 className="animate-spin" />
          ) : client.status_client === "active" ? (
            <>
              <FaToggleOff /> Set Inactive
            </>
          ) : (
            <>
              <FaToggleOn /> Set Active
            </>
          )}
        </button>
      </td>
    </tr>
  );
}