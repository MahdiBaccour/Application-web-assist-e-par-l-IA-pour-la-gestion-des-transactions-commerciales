"use client";
import { useEffect, useState, useRef } from "react";
import { getEmailLogs } from "@/services/logs/emailLogService";
import { FaSpinner, FaEnvelope, FaCheckCircle, FaTimesCircle, FaSearch } from "react-icons/fa";
import { showErrorAlert } from "@/utils/swalConfig";
import { useSession } from "next-auth/react";

export default function EmailLogsTable({ limit = 5 }) {
  const { data: session } = useSession();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const searchInputRef = useRef(null);
  const debounceTimer = useRef(null);

  const logsPerPage = limit;
  const totalPages = Math.ceil(totalLogs / logsPerPage);

  const statusIcons = {
    sent: <FaCheckCircle className="text-green-500" />,
    failed: <FaTimesCircle className="text-red-500" />,
    all: <FaEnvelope className="text-blue-500" />
  };

  // Fonction de debounce pour optimiser les requêtes
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setIsTyping(true);
    
    // Annule le timer précédent s'il existe
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Démarre un nouveau timer
    debounceTimer.current = setTimeout(() => {
      setIsTyping(false);
      setCurrentPage(1);
    }, 500);
  };

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await getEmailLogs(
          {
            status: statusFilter === "all" ? null : statusFilter,
            email: searchTerm,
            username: searchTerm,
            limit: logsPerPage,
            page: currentPage
          },
          session?.user.accessToken
        );

        if (data.success) {
          setLogs(data.logs);
          setTotalLogs(data.count || data.logs.length);
          setError(null);
        } else {
          setError(data.message);
          showErrorAlert(session?.user?.theme || "light", data.message);
        }
      } catch (err) {
        console.error("Error fetching email logs:", err);
        setError("Erreur de chargement des logs emails");
        showErrorAlert(session?.user?.theme || "light", "Erreur de chargement des logs emails");
      }
      setLoading(false);
    };

    if (session?.user?.accessToken && !isTyping) {
      fetchLogs();
    }
  }, [session?.user?.accessToken, statusFilter, currentPage, searchTerm, isTyping]);

  useEffect(() => {
    // Restaurer le focus après un rendu si l'utilisateur était en train de taper
    if (searchInputRef.current && isTyping) {
      searchInputRef.current.focus();
    }
  }, [logs, isTyping]);

  const handleStatusFilter = (status) => {
    setStatusFilter(status === "all" ? null : status);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
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

  if (loading && !isTyping) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-primary mb-4" />
        <p className="text-gray-500">Chargement des logs emails...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        {/* Status filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FaSearch className="text-gray-500" /> Filtres :
          </div>
          {Object.entries({
            all: "Tous",
            sent: "Envoyés",
            failed: "Échecs"
          }).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleStatusFilter(key)}
              className={`btn btn-sm flex items-center gap-2 ${
                statusFilter === (key === "all" ? null : key) ? "btn-primary" : "btn-outline"
              }`}
            >
              {statusIcons[key]}
              {value}
            </button>
          ))}
        </div>
        
        {/* Search input - plus large avec gestion du focus */}
        <div className="relative flex-1 min-w-[300px] max-w-xl">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Rechercher par email ou nom d'utilisateur..."
            className="input input-bordered w-full pl-10 pr-4"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onBlur={() => setIsTyping(false)}
            onFocus={() => setIsTyping(true)}
          />
          <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
          
          {isTyping && (
            <div className="absolute right-3 top-3.5">
              <FaSpinner className="animate-spin text-gray-400" />
            </div>
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">
        Journal des Emails ({totalLogs})
      </h2>

      {(loading && isTyping) ? (
        <div className="flex flex-col items-center justify-center h-48">
          <FaSpinner className="animate-spin text-3xl text-primary mb-3" />
          <p className="text-gray-500">Recherche en cours...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error shadow-lg mb-4">
          <div>
            <span>{error}</span>
          </div>
        </div>
      ) : (
        <>
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200">
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Sujet</th>
                <th>Statut</th>
                <th>Envoyé le</th>
                <th>Erreur</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="font-medium">{log.username || '-'}</td>
                    <td>{log.user_email || '-'}</td>
                    <td className="max-w-xs truncate">{log.subject}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {statusIcons[log.status]}
                        <span className={`badge ${log.status === 'sent' ? 'badge-success' : 'badge-error'}`}>
                          {log.status === 'sent' ? 'Envoyé' : 'Échec'}
                        </span>
                      </div>
                    </td>
                    <td>{formatDateTime(log.sent_at)}</td>
                    <td className="max-w-xs truncate">{log.error || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    {searchTerm ? 
                      "Aucun log trouvé avec ce critère" : 
                      "Aucun log email trouvé"}
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
        </>
      )}
    </div>
  );
}