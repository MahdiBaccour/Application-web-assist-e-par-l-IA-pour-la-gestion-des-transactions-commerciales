'use client';
import { useEffect, useState } from "react";
import { FaSpinner, FaFilter, FaTable, FaUserEdit, FaCalendarAlt, FaUndo } from "react-icons/fa";
import { showErrorAlert } from "@/utils/swalConfig";
import { useSession } from "next-auth/react";
import { getAuditTrail } from "@/services/audit/auditService";

export default function AuditTrail({ limit = 10 }) {
  const { data: session } = useSession();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    userId: '',
    tableName: '',
    action: '',
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAudits, setTotalAudits] = useState(0);
  const [availableActions, setAvailableActions] = useState(['INSERT', 'UPDATE', 'DELETE']);

  const auditsPerPage = limit;
  const totalPages = Math.ceil(totalAudits / auditsPerPage);

  const actionIcons = {
    INSERT: '🟢',
    UPDATE: '🔵',
    DELETE: '🔴'
  };

useEffect(() => {
    const fetchAudits = async () => {
      setLoading(true);
      try {
        const apiFilters = {
          user_id: filters.userId,
          table_name: filters.tableName === 'all' ? '' : filters.tableName,
          action: filters.action,
          start_date: filters.startDate,
          end_date: filters.endDate,
          limit: auditsPerPage,
          page: currentPage
        };

        const data = await getAuditTrail(apiFilters, session?.user.accessToken);

        if (data.success) {
          setAudits(data.audits);
          setTotalAudits(data.count);
          setError(null);
        } else {
          setError(data.message || "Erreur de chargement des audits");
          showErrorAlert(session?.user?.theme || "light", data.message);
        }
      } catch (err) {
        console.error("Error fetching audits:", err);
        setError("Erreur de connexion au serveur");
        showErrorAlert(session?.user?.theme || "light", "Erreur de connexion au serveur");
      }
      setLoading(false);
    };

    if (session?.user?.accessToken) {
      fetchAudits();
    }
  }, [session, filters, currentPage]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

 const resetFilters = () => {
    setFilters({
      userId: '',
      tableName: 'all',
      action: '',
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-primary mb-4" />
        <p className="text-gray-500">Chargement des audits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg mb-4">
        <div>
          <span>{error}</span>
        </div>
      </div>
    );
  }

 return (
    <div className="overflow-x-auto">
      {/* Modified filters section */}
      <div className="bg-base-200 p-4 rounded-lg mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Historique des modifications ({totalAudits})
          </h2>
          <button 
            onClick={resetFilters} 
            className="btn btn-outline btn-sm"
          >
            <FaUndo className="mr-2" />
            Réinitialiser
          </button>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="ID Utilisateur"
                className="input input-bordered w-full"
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
              />
              
              <select
                className="select select-bordered w-full"
                value={filters.tableName}
                onChange={(e) => handleFilterChange('tableName', e.target.value)}
              >
                <option value="all">Toutes les tables</option>
                <option value="products">Produits</option>
                <option value="suppliers">Fournisseurs</option>
                <option value="clients">Clients</option>
              </select>

              {/* Restored Action filter */}
              <select
                className="select select-bordered w-full"
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
              >
                <option value="">Toutes les actions</option>
                {availableActions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>

              {/* Restored Date filters */}
              <div className="flex gap-2">
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Modified table - removed record_id column */}
      <table className="table table-zebra w-full">
        <thead>
          <tr className="bg-base-200">
            <th>Action</th>
            <th>Utilisateur</th>
            <th>Table</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {audits.length > 0 ? (
            audits.map(audit => (
              <tr key={audit.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{actionIcons[audit.action]}</span>
                    {audit.action}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <FaUserEdit />
                    {audit.username} (ID: {audit.user_id})
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <FaTable />
                    {audit.table_name}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt />
                    {new Date(audit.timestamp).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4">
                Aucun audit trouvé
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2 flex-wrap">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="btn btn-sm"
          >
            Première
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-sm"
          >
            Précédent
          </button>
          
          <span className="flex items-center px-4">
            Page {currentPage} sur {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn btn-sm"
          >
            Suivant
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="btn btn-sm"
          >
            Dernière
          </button>
        </div>
      )}
    </div>
  );
}