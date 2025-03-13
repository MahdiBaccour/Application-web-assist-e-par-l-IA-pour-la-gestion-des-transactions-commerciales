import { useState } from "react";
import Swal from "sweetalert2";
import { createSupplier } from "@/services/suppliers/suppliers";  // Correct import

export default function SupplierForm({ onActionSuccess }) {
  const [supplier, setSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [adding, setAdding] = useState(false);

  const handleChange = (e) => {
    setSupplier({ ...supplier, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);

    try {
      const newSupplier = await createSupplier(supplier);

      if (!newSupplier) {
        throw new Error("Failed to add supplier. No data returned.");
      }

      Swal.fire("Success", "Supplier added successfully!", "success");
      onActionSuccess();
    } catch (error) {
      Swal.fire("Error", `Failed to add supplier: ${error.message}`, "error");
    } finally {
      setAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-semibold">Add New Supplier</h2>
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
      <button type="submit" className="btn btn-primary w-full" disabled={adding}>
        {adding ? "Adding..." : "Add Supplier"}
      </button>
    </form>
  );
}
