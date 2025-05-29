"use client";
import { useState } from "react";
import { createClient,getClientByPhone } from "@/services/clients/clientService"; // Import the createClient function
import { FaArrowLeft } from "react-icons/fa"; // Import the left arrow icon
import { showSuccessAlert, showErrorAlert } from '@/utils/swalConfig'; // Import the success and error alerts
import { useSession } from 'next-auth/react';

export default function ClientForm({ onActionSuccess, onGoBack }) {
  const { data: session } = useSession();
  const [client, setClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    note: "", // Added note field
  });

  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    note: "", // Added note field
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Name validation: Check if name is empty
    if (!client.name) {
      newErrors.name = "Le nom est obligatoire";
      isValid = false;
    }

    // Email validation: Check if email is empty or invalid
    if (!client.email) {
      newErrors.email = "L'e-mail est obligatoire";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(client.email)) {
      newErrors.email = "Veuillez saisir une adresse électronique valide";
      isValid = false;
    }

    // Phone validation: Check if phone is empty or doesn't match the required format
    if (!client.phone) {
      newErrors.phone = "Le téléphone est obligatoire";
      isValid = false;
    } else {
      const phoneRegex = /^\+216 [23459]\d{1} \d{3} \d{3}$/;
      if (!phoneRegex.test(client.phone)) {
        newErrors.phone = "Le téléphone doit être dans le format +216 55 555 555";
        isValid = false;
      }
    }

    // Address validation: Check if address is empty
    if (!client.address) {
      newErrors.address = "L'adresse est obligatoire";
      isValid = false;
    }

    // Note validation: Optional, no strict validation
    if (client.note.length > 255) {
      newErrors.note = "La note doit être inférieure à 255 caractères";
      isValid = false;
    }

    setErrors(newErrors); // Set error state
    return isValid;
  };

  const handleChange = (e) => {
    setClient({ ...client, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate the form before submitting
    if (!validateForm()) return;
  
    setAdding(true);
  
    try {
      // Check if phone number already exists
      const existingClient = await getClientByPhone(client.phone,session.user.accessToken); 
      if (existingClient) {
        showErrorAlert(session.user.theme,"Le numéro de téléphone existe déjà !");
        setAdding(false);
        return;
      }
  
      // If phone doesn't exist, proceed with client creation
      const newClient = await createClient(client,session.user.accessToken);
      if (!newClient) throw new Error("Échec de l'ajout d'un client");
  
      showSuccessAlert(session.user?.theme,"Client ajouté avec succès!");
  
      // Update the clients list in the parent component
      onActionSuccess(newClient.client);
    } catch (error) {
      showErrorAlert("Échec de l'ajout d'un client");
    } finally {
      setAdding(false);
    }
  };

  // Helper function to add border color when there's an error
  const getInputClass = (field) => {
    return errors[field] ? "input input-bordered w-full border-red-500" : "input input-bordered w-full";
  };

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onGoBack} // Notify the parent component to go back
        className="btn btn-ghost text-primary mb-4"
      >
        <FaArrowLeft className="mr-2" /> Retour
      </button>

      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Ajouter un nouveau client</h2>

        {/* Name field */}
        <div>
          <input
            type="text"
            name="name"
            value={client.name}
            onChange={handleChange}
            className={getInputClass("name")}
            placeholder="Name"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        {/* Email field */}
        <div>
          <input
            type="email"
            name="email"
            value={client.email}
            onChange={handleChange}
            className={getInputClass("email")}
            placeholder="Email"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        {/* Phone field */}
        <div>
          <input
            type="text"
            name="phone"
            value={client.phone}
            onChange={handleChange}
            className={getInputClass("phone")}
            placeholder="Phone"
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>
        <small className="text-gray-500">Format: +216 XX XXX XXX</small>
        
        {/* Address field */}
        <div>
          <input
            type="text"
            name="address"
            value={client.address}
            onChange={handleChange}
            className={getInputClass("address")}
            placeholder="Address"
          />
          {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
        </div>

        {/* Note field */}
        <div>
          <textarea
            name="note"
            value={client.note}
            onChange={handleChange}
            className={getInputClass("note")}
            placeholder="Note (optional)"
          />
          {errors.note && <p className="text-red-500 text-sm">{errors.note}</p>}
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary w-full" disabled={adding}>
          {adding ? "Ajouter..." : "Ajouter un client"}
        </button>
      </form>
    </div>
  );
}
