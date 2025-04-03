"use client";

import { useEffect, useState } from "react";
import { showSuccessAlert, showErrorAlert } from '@/utils/swalConfig';
import { updateSupplier, getSupplier,getSupplierByPhone } from "@/services/suppliers/supplierService";
import { ImSpinner2 } from "react-icons/im";
import { FaArrowLeft } from "react-icons/fa";

export default function UpdateSupplierForm({ supplierId, onUpdateSuccess, onGoBack }) {
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
        const data = await getSupplier(supplierId);
        if (!data) throw new Error("Supplier data not found");
        setSupplier(data.supplier);
        setLoading(false);
      } catch (error) {
        Swal.fire("Error", "Failed to fetch supplier data", "error");
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
       // Check if phone number already exists
            const existingSupplier = await getSupplierByPhone(supplier.phone);
            if (existingSupplier && existingSupplier.id !== supplierId) {
              showErrorAlert("Phone number already exists!");
              return;}
      const updatedSupplier = await updateSupplier(supplierId, supplier);
      if (!updatedSupplier) throw new Error("Failed to update supplier");
  
      showSuccessAlert("Supplier updated successfully!");
      onUpdateSuccess({ ...supplier, id: supplierId });
    } catch (error) {
      showErrorAlert("Failed to update supplier");
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
        className="btn btn-ghost text-primary mb-4"
        disabled={loading}
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>

      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Update Supplier</h2>
        <input
          type="text"
          name="name"
          value={supplier.name}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="Name"
        />
        <input
          type="email"
          name="email"
          value={supplier.email}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="Email"
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
        <small className="text-gray-500">Format: +216 XX XXX XXX</small>
        <input
          type="text"
          name="address"
          value={supplier.address}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="Address"
        />
        <textarea
          name="note"
          value={supplier.note}
          onChange={handleChange}
          className="textarea textarea-bordered w-full"
          placeholder="Additional Notes"
        ></textarea>
        <button type="submit" className="btn btn-primary w-full" disabled={updating}>
          {updating ? <ImSpinner2 className="animate-spin" /> : "Update Supplier"}
        </button>
      </form>
    </div>
  );
}