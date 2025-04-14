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
        if (!data) throw new Error("Données du client non trouvées");
        setClient(data.client);
        setLoading(false);
      } catch (error) {
        showErrorAlert(session.user.theme,"Échec de l'extraction des données du client !");
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
              showErrorAlert(session.user.theme,"Le numéro de téléphone existe déjà !");
              setUpdating(false);
              return;
            }
      const updatedClient = await updateClient(clientId, client,session.user.accessToken);
      if (!updatedClient) throw new Error("Echec de la mise à jour du client");

      showSuccessAlert(session.user.theme,"Le client a été mis à jour avec succès !");
      onUpdateSuccess({ ...client, id: clientId });
    } catch (error) {
      showErrorAlert(session.user.theme,"Échec de la mise à jour du client");
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
        <FaArrowLeft className="mr-2" /> Retour
      </button>

      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Mise à jour du client</h2>

        {/* Name */}
        <label className="block text-sm font-medium">Nom</label>
        <input
          type="text"
          name="name"
          value={client.name}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="Nom"
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
        <label className="block text-sm font-medium">Téléphone</label>
        <input
          type="text"
          name="phone"
          value={client.phone}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="Téléphone"
        />
        <small className="text-gray-500">Format: +216 XX XXX XXX</small>

        {/* Address */}
        <label className="block text-sm font-medium">Adresse</label>
        <input
          type="text"
          name="address"
          value={client.address}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="Addresse"
        />

        {/* Note */}
        <label className="block text-sm font-medium">Note (facultatif)</label>
        <textarea
          name="note"
          value={client.note}
          onChange={handleChange}
          className="textarea textarea-bordered w-full"
          placeholder="Remarques complémentaires"
        />

        <button type="submit" className="btn btn-primary w-full" disabled={updating}>
          {updating ? "Mise à jour..." : "Mise à jour du client"}
        </button>
      </form>
    </div>
  );
}