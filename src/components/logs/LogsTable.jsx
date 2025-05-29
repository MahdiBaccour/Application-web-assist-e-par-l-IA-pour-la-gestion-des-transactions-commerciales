"use client";
import { useEffect, useState } from "react";
import { getLogs } from "@/services/logs/logService";
import { FaSpinner, FaUser, FaUserShield, FaUserTie, FaList, FaFilter, FaSearch } from "react-icons/fa";
import { showErrorAlert } from "@/utils/swalConfig";
import { useSession } from "next-auth/react";

export default function LogsTable({ limit = 5 }) {
  const { data: session } = useSession();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const logsPerPage = limit;
  const totalPages = Math.ceil(totalLogs / logsPerPage);

  const roleIcons = {
    owner: <FaUserShield className="text-purple-500" />,
    employee: <FaUserTie className="text-blue-500" />,
    client: <FaUser className="text-green-500" />,
    supplier: <FaUser className="text-orange-500" />,
    all: <FaList className="text-gray-500" />
  };

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await getLogs(
          roleFilter || null,
          logsPerPage,
          currentPage,
          session?.user.accessToken
        );

        if (data.success) {
          setLogs(data.logs);
          setTotalLogs(data.total || data.logs.length);
          setError(null);
        } else {
          setError(data.message);
          showErrorAlert(session?.user?.theme || "light", data.message);
        }
      } catch (err) {
        console.error("Error fetching logs:", err);
        setError("Erreur de chargement des logs");
        showErrorAlert(session?.user?.theme || "light", "Erreur de chargement des logs");
      }
      setLoading(false);
    };

    if (session?.user?.accessToken) {
      fetchLogs();
    }
  }, [session?.user?.accessToken, roleFilter, currentPage]);

  const handleRoleFilter = (role) => {
    setRoleFilter(role === "all" ? null : role);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  const getPageNumbers = () => {
    const delta = 2;
    const pages = [];
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      pages.push(i);
    }
    return pages;
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return (
      date.toLocaleDateString('fr-FR') + 
      ' ' + 
      date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    );
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return '-';
    
    const units = [
      { label: 'mo', value: 2592000 }, // 30 days
      { label: 'w', value: 604800 },
      { label: 'd', value: 86400 },
      { label: 'h', value: 3600 },
      { label: 'm', value: 60 },
      { label: 's', value: 1 }
    ];

    let remaining = seconds;
    const parts = [];

    for (const unit of units) {
      const count = Math.floor(remaining / unit.value);
      if (count > 0) {
        parts.push(`${count}${unit.label}`);
        remaining -= count * unit.value;
      }
      // Show max 2 units for readability
      if (parts.length >= 2) break;
    }

    return parts.join(' ') || `${seconds.toFixed(2)}s`;
  };

  // Filter logs by username based on search term
  const filteredLogs = logs.filter(log => 
    log.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-primary mb-4" />
        <p className="text-gray-500">Chargement des logs...</p>
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
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        {/* Role filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FaFilter className="text-gray-500" /> Filtres :
          </div>
          {Object.entries({
            all: "Tous",
            owner: "Propriétaire",
            employee: "Employé",
            client: "Client",
            supplier: "Fournisseur"
          }).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleRoleFilter(key)}
              className={`btn btn-sm flex items-center gap-2 ${
                roleFilter === (key === "all" ? null : key) ? "btn-primary" : "btn-outline"
              }`}
            >
              {roleIcons[key]}
              {value}
            </button>
          ))}
        </div>
        
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher par nom"
            className="input input-bordered pl-10 pr-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">
        Journaux d'activité ({totalLogs})
      </h2>

      <table className="table table-zebra w-full">
        <thead>
          <tr className="bg-base-200">
            <th>Utilisateur</th>
            <th>Rôle</th>
            <th>Action</th>
            <th>Connexion</th>
            <th>Déconnexion</th>
            <th>Durée Session</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <tr key={log.id}>
                <td className="font-medium">{log.username}</td>
                <td>
                  <div className="flex items-center gap-2">
                    {roleIcons[log.role]}
                    {log.role}
                  </div>
                </td>
                <td>{log.log_data?.action || "-"}</td>
                <td>{formatDateTime(log.log_data?.login_time)}</td>
                <td>{formatDateTime(log.log_data?.logout_time)}</td>
                <td>{formatDuration(log.log_data?.session_duration)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-4">
                {searchTerm ? 
                  "Aucun log trouvé avec ce nom d'utilisateur" : 
                  "Aucun log trouvé"}
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