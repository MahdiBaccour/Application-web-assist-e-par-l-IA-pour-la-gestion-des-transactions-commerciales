"use client";
import { useEffect, useState } from "react";;
import { updateClient, getClient ,getClientByPhone} from "@/services/clients/clientService";
import { ImSpinner2 } from "react-icons/im";
import { FaArrowLeft } from "react-icons/fa"; // Import the left arrow icon
import { showSuccessAlert, showErrorAlert } from '@/utils/swalConfig'; // Import the success and error alerts
import { useSession } from 'next-auth/react';
export default function UpdateClientForm({ clientId, onUpdateSuccess, onGoBack }) {
  const { data: session } = useSession();
  const [client, setClient] = useState({ name: "", email: "", phone: "", address: "", note: "" });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const data = await getClient(clientId,session.user.accessToken);
        if (!data) throw new Error("Client data not found");
        setClient(data.client);
        setLoading(false);
      } catch (error) {
        showErrorAlert(session.user.theme,"Failed to fetch client data!");
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
      // Check if phone number already exists
            const existingClient = await getClientByPhone(client.phone,session.user.accessToken);
            if (existingClient && existingClient.id !== clientId) { 
              showErrorAlert(session.user.theme,"Phone number already exists!");
              setUpdating(false);
              return;
            }
      const updatedClient = await updateClient(clientId, client,session.user.accessToken);
      if (!updatedClient) throw new Error("Failed to update client");

      showSuccessAlert(session.user.theme,"Client updated successfully!");
      onUpdateSuccess({ ...client, id: clientId });
    } catch (error) {
      showErrorAlert(session.user.theme,"Failed to update client");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center mt-10">
        <ImSpinner2 className="animate-spin text-4xl text-primary" />
      </div>
    );

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onGoBack}
        className="btn btn-ghost text-primary mb-4 flex items-center"
        disabled={loading}
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>

      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Update Client</h2>

        {/* Name */}
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          name="name"
          value={client.name}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="Name"
        />

        {/* Email */}
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={client.email}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="Email"
        />

        {/* Phone */}
        <label className="block text-sm font-medium">Phone</label>
        <input
          type="text"
          name="phone"
          value={client.phone}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="Phone"
        />
        <small className="text-gray-500">Format: +216 XX XXX XXX</small>

        {/* Address */}
        <label className="block text-sm font-medium">Address</label>
        <input
          type="text"
          name="address"
          value={client.address}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="Address"
        />

        {/* Note */}
        <label className="block text-sm font-medium">Note (Optional)</label>
        <textarea
          name="note"
          value={client.note}
          onChange={handleChange}
          className="textarea textarea-bordered w-full"
          placeholder="Additional Notes"
        />

        <button type="submit" className="btn btn-primary w-full" disabled={updating}>
          {updating ? "Updating..." : "Update Client"}
        </button>
      </form>
    </div>
  );
}