"use client";

import { useEffect, useState } from "react";
import { showSuccessAlert, showErrorAlert } from '@/utils/swalConfig';
import { updateSupplier, getSupplier, getSupplierByPhone } from "@/services/suppliers/supplierService";
import { ImSpinner2 } from "react-icons/im";
import { FaArrowLeft } from "react-icons/fa";
import { useSession } from "next-auth/react";

export default function UpdateSupplierForm({ supplierId, onUpdateSuccess, onGoBack }) {
  const { data: session } = useSession();
  const [supplier, setSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    note: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await getSupplier(supplierId, session.user.accessToken);
        if (!data) throw new Error("Fournisseur introuvable");
        setSupplier(data.supplier);
        setLoading(false);
      } catch (error) {
        showErrorAlert(session.user.accessToken,"Échec du chargement des données du fournisseur");
      }
    };

    if (supplierId) fetchSupplier();
  }, [supplierId]);

  const handleChange = (e) => {
    setSupplier({ ...supplier, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const existingSupplier = await getSupplierByPhone(supplier.phone, session.user.accessToken);
      if (existingSupplier && existingSupplier.id !== supplierId) {
        showErrorAlert(session.user.accessToken,"Ce numéro de téléphone est déjà utilisé !");
        return;
      }

      const updatedSupplier = await updateSupplier(supplierId, supplier, session.user.accessToken);
      if (!updatedSupplier) throw new Error("Échec de la mise à jour");

      showSuccessAlert(session.user.accessToken,"Fournisseur mis à jour avec succès !");
      onUpdateSuccess({ ...supplier, id: supplierId });
    } catch (error) {
      showErrorAlert(session.user.accessToken,"Échec de la mise à jour du fournisseur");
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
      {/* Bouton retour */}
      <button
        onClick={onGoBack}
        className="btn btn-ghost text-primary mb-4"
        disabled={loading}
      >
        <FaArrowLeft className="mr-2" /> Retour
      </button>

      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Modifier le fournisseur</h2>
        <input
          type="text"
          name="name"
          value={supplier.name}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="Nom du fournisseur"
        />
        <input
          type="email"
          name="email"
          value={supplier.email}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="Adresse e-mail"
        />
        <input
          type="text"
          name="phone"
          value={supplier.phone}
          onChange={handleChange}
          required
          pattern="^\+216\s[0-9]{2}\s[0-9]{3}\s[0-9]{3}$"
          className="input input-bordered w-full"
          placeholder="+216 XX XXX XXX"
        />
        <small className="text-gray-500">Format : +216 XX XXX XXX</small>
        <input
          type="text"
          name="address"
          value={supplier.address}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="Adresse"
        />
        <textarea
          name="note"
          value={supplier.note}
          onChange={handleChange}
          className="textarea textarea-bordered w-full"
          placeholder="Notes supplémentaires"
        ></textarea>
        <button type="submit" className="btn btn-primary w-full" disabled={updating}>
          {updating ? <ImSpinner2 className="animate-spin" /> : "Mettre à jour"}
        </button>
      </form>
    </div>
  );
}