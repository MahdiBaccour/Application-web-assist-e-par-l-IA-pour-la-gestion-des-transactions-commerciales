"use client";

import { useState } from "react";
import {
  showSuccessAlert,
  showErrorAlert,
} from "@/utils/swalConfig";
import {
  createSupplier,
  getSupplierByPhone,
} from "@/services/suppliers/supplierService";
import { FaArrowLeft } from "react-icons/fa";
import { useSession } from "next-auth/react";

export default function SupplierForm({ onActionSuccess, onGoBack }) {
  const { data: session } = useSession();
  const [supplier, setSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    note: "",
  });

  const [errors, setErrors] = useState({});
  const [adding, setAdding] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!supplier.name.trim()) {
      newErrors.name = "Le nom est requis.";
      isValid = false;
    }

    if (!supplier.email.trim()) {
      newErrors.email = "L'email est requis.";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(supplier.email)) {
      newErrors.email = "Format d'email invalide.";
      isValid = false;
    }

    if (!supplier.phone.trim()) {
      newErrors.phone = "Le numéro de téléphone est requis.";
      isValid = false;
    } else {
      const phoneRegex = /^\+216 [23459]\d{1} \d{3} \d{3}$/;
      if (!phoneRegex.test(supplier.phone)) {
        newErrors.phone = "Format invalide. Exemple: +216 xx xxx xxx";
        isValid = false;
      }
    }

    if (!supplier.address.trim()) {
      newErrors.address = "L'adresse est requise.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    setSupplier({ ...supplier, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setAdding(true);
    try {
      const existingSupplier = await getSupplierByPhone(
        supplier.phone,
        session.user.accessToken
      );
      if (existingSupplier) {
        showErrorAlert(session.user.theme, "Le numéro de téléphone existe déjà.");
        setAdding(false);
        return;
      }

      const newSupplier = await createSupplier(supplier, session.user.accessToken);
      if (newSupplier.error) {
        showErrorAlert(session.user.theme, newSupplier.error);
        return;
      }

      showSuccessAlert(session.user.theme, "Fournisseur ajouté avec succès !");
      onActionSuccess(newSupplier.supplier);
    } catch (error) {
      showErrorAlert(session.user.theme, "Échec de l'ajout du fournisseur.");
    } finally {
      setAdding(false);
    }
  };

  const getInputClass = (field) =>
    `input input-bordered w-full ${errors[field] ? "border-red-500" : ""}`;

  return (
    <div className="p-4 border rounded-lg shadow-md">
      {/* Back */}
      <button
        onClick={onGoBack}
        className="btn btn-ghost text-primary mb-4 flex items-center"
      >
        <FaArrowLeft className="mr-2" /> Retour
      </button>

      <h2 className="text-xl font-semibold mb-4">Ajouter un fournisseur</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <input
            type="text"
            name="name"
            value={supplier.name}
            onChange={handleChange}
            className={getInputClass("name")}
            placeholder="Nom"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            name="email"
            value={supplier.email}
            onChange={handleChange}
            className={getInputClass("email")}
            placeholder="Email"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <input
            type="text"
            name="phone"
            value={supplier.phone}
            onChange={handleChange}
            className={getInputClass("phone")}
            placeholder="+216 xx xxx xxx"
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>

        {/* Address */}
        <div>
          <input
            type="text"
            name="address"
            value={supplier.address}
            onChange={handleChange}
            className={getInputClass("address")}
            placeholder="Adresse"
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address}</p>
          )}
        </div>

        {/* Note */}
        <div>
          <textarea
            name="note"
            value={supplier.note}
            onChange={handleChange}
            className="textarea textarea-bordered w-full"
            placeholder="Notes supplémentaires (facultatif)"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={adding}
        >
          {adding ? "Ajout en cours..." : "Ajouter le fournisseur"}
        </button>
      </form>
    </div>
  );
}