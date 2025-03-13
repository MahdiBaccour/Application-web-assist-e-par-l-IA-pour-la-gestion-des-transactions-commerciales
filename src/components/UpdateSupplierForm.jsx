"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { updateSupplier, getSupplier } from "@/services/suppliers/suppliers"; // Import the necessary services

export default function UpdateSupplierForm({ supplierId, onUpdateSuccess }) {
  const [supplier, setSupplier] = useState({ name: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch the supplier details when the component mounts or supplierId changes
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await getSupplier(supplierId);  // Use the service to fetch data
        if (!data) throw new Error("Failed to fetch supplier data");

        setSupplier(data.supplier);
        setLoading(false);
      } catch (error) {
        Swal.fire("Error", error.message || "Failed to fetch supplier data", "error");
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
      const updatedSupplier = await updateSupplier(supplierId, supplier); // Use the update service

      if (!updatedSupplier) throw new Error("Failed to update supplier");

      Swal.fire("Success", "Supplier updated successfully!", "success");
      onUpdateSuccess();  // Trigger success callback
    } catch (error) {
      Swal.fire("Error", error.message || "Failed to update supplier", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Loading supplier data...</p>;

  return (
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
        className="input input-bordered w-full"
        placeholder="Phone"
      />
      <input
        type="text"
        name="address"
        value={supplier.address}
        onChange={handleChange}
        required
        className="input input-bordered w-full"
        placeholder="Address"
      />
      <button type="submit" className="btn btn-primary w-full" disabled={updating}>
        {updating ? "Updating..." : "Update Supplier"}
      </button>
    </form>
  );
}
