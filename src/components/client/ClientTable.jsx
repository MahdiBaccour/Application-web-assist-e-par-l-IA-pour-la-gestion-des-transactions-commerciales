"use client";
import { useEffect, useState } from "react";
import { getClients, updateClientStatus } from "@/services/clients/clientService";
import { FaSpinner,FaSearch } from "react-icons/fa";
import { FaUserPlus, FaUsers, FaUserCheck, FaUserTimes } from "react-icons/fa";
import UpdateClientForm from "./UpdateClientForm";
import ClientForm from "./ClientForm";
import ClientCard from "./ClientCard"; // Import the new component
import {
  showConfirmationDialog,
  showSuccessAlert,
  showErrorAlert,
} from "@/utils/swalConfig"; 
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";
export default function ClientTable() {
  const { data: session } = useSession();
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [clientsPerPage] = useState(5);

  useEffect(() => {
    if ( session?.user.role !== "owner" ) {
      router.push("/forbidden");
    }
  }, [ session, router]);

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);
      try {
        const data = await getClients("",session?.user.accessToken);
        if (!data.success) {
          setError(data.message); // Set error message
        }
        else{
        setClients(data.clients);
        setError(null); // Clear error if data is fetched successfully
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        setError(data.message); // Set error message
      }
      setLoading(false);
    };

    loadClients();
  }, [session?.user.accessToken]);

  const handleEdit = (id) => {
    setSelectedClientId(id);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const result = await showConfirmationDialog(session.user.theme, {
      title: `Définir l'état sur ${newStatus}?`,
      text: "Vous pouvez toujours modifier cela plus tard",
      confirmText: `Oui, réglé à ${newStatus}`,
    });

    if (result.isConfirmed) {
      setIsLoadingDelete(id);
      try {
        const success = await updateClientStatus(id, newStatus, session.user.accessToken);
        if (success) {
          setClients((prev) =>
            prev.map((client) =>
              client.id === id
                ? { ...client, status_client: newStatus }
                : client
            )
          );
          showSuccessAlert(session.user.theme, `Le statut est défini sur ${newStatus}`);
          setError(null); // Clear error if status is updated successfully
        } else {
          setError("Échec de la mise à jour du statut du client. Veuillez réessayer."); // Set error message
          showErrorAlert(session.user.theme, "Échec de la mise à jour de l'état");
        }
      } catch (error) {
        setError("Échec de la mise à jour du statut du client. Veuillez réessayer."); // Set error message
        showErrorAlert(session.user.theme, "Échec de la mise à jour de l'état");
      } finally {
        setIsLoadingDelete(null);
      }
    }
  };

  const handleGoBack = () => {
    setIsAddingNewClient(false);
    setSelectedClientId(null);
  };

  const handleClientUpdate = (updatedClient) => {
    setClients((prevClients) =>
      prevClients.map((client) =>
        client.id === updatedClient.id ? updatedClient : client
      )
    );
    setSelectedClientId(null);
  };

  const handleNewClient = (newClient) => {
    setClients((prevClients) => [...prevClients, newClient]);
    setIsAddingNewClient(false);
  };

    const filteredClients = clients.filter((client) => {
      // Status filter
      if (filterStatus !== "all" && client.status_client !== filterStatus) {
        return false;
      }
      
      // Name search filter
      if (searchTerm && !client.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });

  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(
    indexOfFirstClient,
    indexOfLastClient
  );
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-primary mb-4" />
          <p className="text-gray-500">Chargement des données...</p>
        </div>
    );
  if (error)
    return (
      <div className="alert alert-error shadow-lg mb-4">
        <div>
          <span>{error}</span>
        </div>
      </div>
    );

  return (
    <div className="overflow-x-auto">
      {error && (
        <div className="alert alert-error shadow-lg mb-4">
          <div>
            <span>{error}</span>
          </div>
        </div>
      )}

      {isAddingNewClient ? (
        <ClientForm onActionSuccess={handleNewClient} onGoBack={handleGoBack} />
      ) : selectedClientId ? (
        <UpdateClientForm
          clientId={selectedClientId}
          onUpdateSuccess={handleClientUpdate}
          onGoBack={handleGoBack}
        />
      ) : (
        <>
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <div className="flex flex-wrap gap-2">
              {/* Add New Client */}
              <button
                onClick={() => setIsAddingNewClient(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <FaUserPlus /> Ajouter un nouveau client
              </button>

              {/* Status Filters */}
              <button
                onClick={() => setFilterStatus("all")}
                className={`btn flex items-center gap-2 ${
                  filterStatus === "all" ? "btn-info" : "btn-outline"
                }`}
              >
                <FaUsers /> Tous
              </button>

              <button
                onClick={() => setFilterStatus("active")}
                className={`btn flex items-center gap-2 ${
                  filterStatus === "active" ? "btn-success" : "btn-outline"
                }`}
              >
                <FaUserCheck /> Actif
              </button>

              <button
                onClick={() => setFilterStatus("inactive")}
                className={`btn flex items-center gap-2 ${
                  filterStatus === "inactive" ? "btn-error" : "btn-outline"
                }`}
              >
                <FaUserTimes /> Inactif
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par nom..."
                className="input input-bordered pl-10 pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <table className="table w-full table-zebra">
            <thead>
              <tr className="bg-base-300 text-base-content">
              <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Adresse</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentClients.length > 0 ? (
                currentClients.map((client) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    isLoadingDelete={isLoadingDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                  Pas de clients disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-center mt-4">
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
              className="btn btn-sm mx-2"
            >
              Précédent
            </button>
            <span className="text-center mx-2">
              Page {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn btn-sm mx-2"
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
        </>
      )}
    </div>
  );
}