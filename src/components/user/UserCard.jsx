"use client";
import { FaEdit, FaToggleOff, FaToggleOn } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";

export default function UserCard({
  user,
  onEdit,
  onToggleStatus,
  isLoadingDelete,
}) {
  return (
    <div className="card bg-base-100 shadow-xl hover:scale-105 transition-transform">
      <div className="card-body">
        <h2 className="card-title">{user.username}</h2>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <p>Status: {user.verified_status}</p>

        <div className="flex gap-2 mt-4">
          {/* Edit Button */}
          <button
            onClick={() => onEdit(user.id)}
            className="btn btn-primary btn-xs flex items-center gap-2"
          >
            <FaEdit /> Edit
          </button>

          {/* Toggle Status Button */}
          <button
            onClick={() => onToggleStatus(user.id, user.verified_status)}
            className={`btn btn-xs flex items-center gap-2 ${
              user.verified_status === "verified" ? "btn-error" : "btn-success"
            }`}
            disabled={isLoadingDelete === user.id}
          >
            {isLoadingDelete === user.id ? (
              <ImSpinner2 className="animate-spin" />
            ) : user.verified_status === "verified" ? (
              <>
                <FaToggleOff /> Set Not Verified
              </>
            ) : (
              <>
                <FaToggleOn /> Set Verified
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
