"use client";
import { useEffect, useState } from "react";
import { getClients, updateClientStatus } from "@/services/clients/clientService";
import { ImSpinner2 } from "react-icons/im";
import { FaUserPlus, FaUsers, FaUserCheck, FaUserTimes } from "react-icons/fa";
import UpdateClientForm from "./UpdateClientForm";
import ClientForm from "./ClientForm";
import ClientCard from "./ClientCard"; // Import the new component
import {
  showConfirmationDialog,
  showSuccessAlert,
  showErrorAlert,
} from "@/utils/swalConfig"; // Import the success and error alerts
import { useSession } from 'next-auth/react';
export default function ClientTable() {
  const { data: session } = useSession();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [clientsPerPage] = useState(5);

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);
      try {
        const data = await getClients("",session.user.accessToken);
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
      setLoading(false);
    };

    loadClients();
  }, []);

  const handleEdit = (id) => {
    setSelectedClientId(id);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const result = await showConfirmationDialog(session.user.theme,{
      title: `Set status to ${newStatus}?`,
      text: "You can always change this later",
      confirmText: `Yes, set to ${newStatus}`,
    });

    if (result.isConfirmed) {
      setIsLoadingDelete(id);
      try {
        const success = await updateClientStatus(id, newStatus,session.user.accessToken);
        if (success) {
          setClients((prev) =>
            prev.map((client) =>
              client.id === id
                ? { ...client, status_client: newStatus }
                : client
            )
          );
          showSuccessAlert(session.user.theme,`Status set to ${newStatus}`);
        } else {
          showErrorAlert(session.user.theme,"Failed to update status");
        }
      } catch (error) {
        showErrorAlert(session.user.theme,"Failed to update status");
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
    if (filterStatus === "all") return true;
    return client.status_client === filterStatus;
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
      <div className="flex justify-center items-center mt-10">
        <ImSpinner2 className="animate-spin text-4xl text-primary" />
      </div>
    );

  return (
    <div className="overflow-x-auto">
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
          <div className="flex gap-2 mb-4">
            {/* Add New Client */}
            <button
              onClick={() => setIsAddingNewClient(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <FaUserPlus /> Add New Client
            </button>

            {/* Status Filters */}
            <button
              onClick={() => setFilterStatus("all")}
              className={`btn flex items-center gap-2 ${
                filterStatus === "all" ? "btn-info" : "btn-outline"
              }`}
            >
              <FaUsers /> All
            </button>

            <button
              onClick={() => setFilterStatus("active")}
              className={`btn flex items-center gap-2 ${
                filterStatus === "active" ? "btn-success" : "btn-outline"
              }`}
            >
              <FaUserCheck /> Active
            </button>

            <button
              onClick={() => setFilterStatus("inactive")}
              className={`btn flex items-center gap-2 ${
                filterStatus === "inactive" ? "btn-error" : "btn-outline"
              }`}
            >
              <FaUserTimes /> Inactive
            </button>
          </div>

          <table className="table w-full table-zebra">
            <thead>
              <tr className="bg-base-300 text-base-content">
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
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
                    No clients available
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
              First
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-sm mx-2"
            >
              Previous
            </button>
            <span className="text-center mx-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn btn-sm mx-2"
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="btn btn-sm"
            >
              Last
            </button>
          </div>
        </>
      )}
    </div>
  );
}
