"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { updateClient, getClient } from "@/services/clients/clients";
 // Import the required functions

export default function UpdateClientForm({ clientId, onUpdateSuccess }) {
  const [client, setClient] = useState({ name: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const data = await getClient(clientId); // Fetch the client data using the service
        if (!data) throw new Error("Client data not found");
        setClient(data.client);
        setLoading(false);
      } catch (error) {
        Swal.fire("Error", "Failed to fetch client data", "error");
      }
    };

    if (clientId) fetchClient();
  }, [clientId]);

  const handleChange = (e) => {
    setClient({ ...client, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const updatedClient = await updateClient(clientId, client); // Use the service's updateClient function

      if (!updatedClient) throw new Error("Failed to update client");

      Swal.fire("Success", "Client updated successfully!", "success");
      onUpdateSuccess();
    } catch (error) {
      Swal.fire("Error", "Failed to update client", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Loading client data...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-semibold">Update Client</h2>
      <input
        type="text"
        name="name"
        value={client.name}
        onChange={handleChange}
        required
        className="input input-bordered w-full"
        placeholder="Name"
      />
      <input
        type="email"
        name="email"
        value={client.email}
        onChange={handleChange}
        required
        className="input input-bordered w-full"
        placeholder="Email"
      />
      <input
        type="text"
        name="phone"
        value={client.phone}
        onChange={handleChange}
        required
        className="input input-bordered w-full"
        placeholder="Phone"
      />
      <input
        type="text"
        name="address"
        value={client.address}
        onChange={handleChange}
        required
        className="input input-bordered w-full"
        placeholder="Address"
      />
      <button type="submit" className="btn btn-primary w-full" disabled={updating}>
        {updating ? "Updating..." : "Update Client"}
      </button>
    </form>
  );
}
