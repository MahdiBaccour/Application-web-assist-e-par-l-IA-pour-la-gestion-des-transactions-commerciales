"use client";
import { useEffect, useState } from "react";
import { getClients, deleteClient } from "@/services/clients/clients";
import Swal from "sweetalert2";
import UpdateClientForm from "./UpdateClientForm";
import ClientForm from "./ClientForm";

export default function ClientTable() {
  const [clients, setClients] = useState([]); // clients initialized as an empty array
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);

  useEffect(() => {
    const loadClients = async () => {
      const data = await getClients(); // Always returns an array
      setClients(data); // Even if data is empty, it will be an array
      setLoading(false);
    };

    loadClients();
  }, []);

  const handleEdit = (id) => {
    setSelectedClientId(id);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const success = await deleteClient(id);
        if (success) {
          setClients((prev) => prev.filter((client) => client.id !== id));
          Swal.fire("Deleted!", "The client has been removed.", "success");
        } else {
          Swal.fire("Error", "Failed to delete client", "error");
        }
      }
    });
  };

  const handleAddNewClient = () => {
    setIsAddingNewClient(true);
  };

  if (loading) return <p className="text-center">Loading clients...</p>;

  return (
    <div className="overflow-x-auto">
      {isAddingNewClient ? (
        <ClientForm
          onActionSuccess={() => {
            setIsAddingNewClient(false);
            setClients((prev) => [...prev]); // Re-fetch clients after adding a new one
          }}
        />
      ) : selectedClientId ? (
        <UpdateClientForm
          clientId={selectedClientId}
          onUpdateSuccess={() => {
            setSelectedClientId(null);
            setClients((prev) => [...prev]); // Re-fetch clients after update
          }}
        />
      ) : (
        <>
          <button onClick={handleAddNewClient} className="btn btn-primary mb-4">
            Add New Client
          </button>
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
              {clients.length > 0 ? (
                clients.map((client) => (
                  <tr key={client.id} className="hover">
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td>{client.address}</td>
                    <td>
                      <button onClick={() => handleEdit(client.id)} className="btn btn-primary btn-xs mr-2">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(client.id)} className="btn btn-error btn-xs">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">No clients available</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
