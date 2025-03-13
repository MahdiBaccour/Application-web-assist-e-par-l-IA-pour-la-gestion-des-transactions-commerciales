"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSupplierById, updateSupplier } from "@/utils/api";
import Swal from "sweetalert2";

export default function EditSupplier({ supplierId }) {
  const router = useRouter();
  const [supplier, setSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSupplier = async () => {
      const data = await fetchSupplierById(supplierId);
      if (data) setSupplier(data);
      setLoading(false);
    };
    loadSupplier();
  }, [supplierId]);

  const handleChange = (e) => {
    setSupplier({ ...supplier, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateSupplier(supplierId, supplier);
    if (success) {
      Swal.fire("Updated!", "Supplier information has been updated.", "success");
      router.push("/suppliers");
    } else {
      Swal.fire("Error!", "Failed to update supplier.", "error");
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="max-w-lg mx-auto p-4 border rounded shadow-lg">
      <h2 className="text-xl font-bold mb-4">Edit Supplier</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block font-medium">Name</label>
          <input type="text" name="name" value={supplier.name} onChange={handleChange} className="input input-bordered w-full" />
        </div>
        <div className="mb-3">
          <label className="block font-medium">Email</label>
          <input type="email" name="email" value={supplier.email} onChange={handleChange} className="input input-bordered w-full" />
        </div>
        <div className="mb-3">
          <label className="block font-medium">Phone</label>
          <input type="text" name="phone" value={supplier.phone} onChange={handleChange} className="input input-bordered w-full" />
        </div>
        <div className="mb-3">
          <label className="block font-medium">Address</label>
          <input type="text" name="address" value={supplier.address} onChange={handleChange} className="input input-bordered w-full" />
        </div>
        <button type="submit" className="btn btn-primary w-full">Update</button>
      </form>
    </div>
  );
}
