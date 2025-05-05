'use client';
import { FaEdit, FaToggleOff, FaToggleOn } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';

export default function CategoryCard({ category, onEdit, onToggleStatus, isLoadingStatus }) {
  const getStatusBadge = (status) => {
    return status === 'active' ? 'badge-success' : 'badge-error';
  };

  return (
    <tr className="hover">
      <td>{category.name}</td>
      <td>
        <span className={`badge ${getStatusBadge(category.status)}`}>
          {category.status}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(category.id)}
            className="btn btn-xs btn-primary flex items-center gap-1"
          >
            <FaEdit /> Éditer
          </button>

          <button
            onClick={() => onToggleStatus(category.id, category.status)}
            className={`btn btn-xs ${category.status === 'active' ? 'btn-error' : 'btn-success'}`}
            disabled={isLoadingStatus === category.id}
          >
            {isLoadingStatus === category.id ? (
              <ImSpinner2 className="animate-spin" />
            ) : category.status === 'active' ? (
              <>
                <FaToggleOff /> Désactiver
              </>
            ) : (
              <>
                <FaToggleOn /> Activer
              </>
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}
