import { useState } from "react";
import { showSuccessAlert, showErrorAlert } from '@/utils/swalConfig'
import { createSupplier,getSupplierByPhone } from "@/services/suppliers/supplierService";
import { FaArrowLeft } from "react-icons/fa";

export default function SupplierForm({ onActionSuccess, onGoBack }) {
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
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!supplier.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(supplier.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!supplier.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else {
      const phoneRegex = /^\+216 [23459]\d{1} \d{3} \d{3}$/;
      if (!phoneRegex.test(supplier.phone)) {
        newErrors.phone = "Phone must be in the format +216 xx xxx xxx";
        isValid = false;
      }
    }

    if (!supplier.address.trim()) {
      newErrors.address = "Address is required";
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
      // Check if phone number already exists
      const existingSupplier = await getSupplierByPhone(supplier.phone);
      if (existingSupplier) {
        showErrorAlert("Phone number already exists!");
        setAdding(false);
        return;
      }
  
      // Proceed to create supplier if phone is unique
      const newSupplier = await createSupplier(supplier);
  
      if (newSupplier.error) {
        showErrorAlert(newSupplier.error);
        return;
      }
  
      showSuccessAlert("Supplier added successfully!");
      onActionSuccess(newSupplier.supplier);
    } catch (error) {
      showErrorAlert("Failed to add supplier");
    } finally {
      setAdding(false);
    }
  };

  const getInputClass = (field) =>
    `input input-bordered w-full ${errors[field] ? "border-red-500" : ""}`;

  return (
    <div className="p-4 border rounded-lg shadow-md">
      {/* Back button */}
      <button onClick={onGoBack} className="btn btn-ghost text-primary mb-4 flex items-center">
        <FaArrowLeft className="mr-2" /> Back
      </button>

      <h2 className="text-xl font-semibold mb-4">Add New Supplier</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <input
            type="text"
            name="name"
            value={supplier.name}
            onChange={handleChange}
            className={getInputClass("name")}
            placeholder="Name"
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
            placeholder="Address"
          />
          {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
        </div>

        {/* Note (Optional) */}
        <div>
          <textarea
            name="note"
            value={supplier.note}
            onChange={handleChange}
            className="textarea textarea-bordered w-full"
            placeholder="Additional Notes (Optional)"
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary w-full" disabled={adding}>
          {adding ? "Adding..." : "Add Supplier"}
        </button>
      </form>
    </div>
  );
}