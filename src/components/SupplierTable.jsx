"use client";

import { useEffect, useState } from "react";
import { getSuppliers, deleteSupplier } from "@/services/suppliers/suppliers"; // Fetch suppliers and delete supplier
import Swal from "sweetalert2";
import UpdateSupplierForm from "./UpdateSupplierForm";
import SupplierForm from "./SupplierForm"; // Import SupplierForm to add a new supplier

export default function SupplierTable() {
  const [suppliers, setSuppliers] = useState([]); // suppliers initialized as an empty array
  const [loading, setLoading] = useState(true);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [isAddingNewSupplier, setIsAddingNewSupplier] = useState(false);

  useEffect(() => {
    const loadSuppliers = async () => {
      const data = await getSuppliers(); // Always returns an array
      setSuppliers(data); // Even if data is empty, it will be an array
      setLoading(false);
    };

    loadSuppliers();
  }, []);

  const handleEdit = (id) => {
    setSelectedSupplierId(id);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const success = await deleteSupplier(id); // Call deleteSupplier function
        if (success) {
          setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));
          Swal.fire("Deleted!", "The supplier has been removed.", "success");
        } else {
          Swal.fire("Error", "Failed to delete supplier", "error");
        }
      }
    });
  };

  const handleAddNewSupplier = () => {
    setIsAddingNewSupplier(true);
  };

  if (loading) return <p className="text-center">Loading suppliers...</p>;

  return (
    <div className="overflow-x-auto">
      {isAddingNewSupplier ? (
        <SupplierForm
          onActionSuccess={() => {
            setIsAddingNewSupplier(false);
            setSuppliers((prev) => [...prev]); // Re-fetch suppliers after adding a new one
          }}
        />
      ) : selectedSupplierId ? (
        <UpdateSupplierForm
          supplierId={selectedSupplierId}
          onUpdateSuccess={() => {
            setSelectedSupplierId(null);
            setSuppliers((prev) => [...prev]); // Re-fetch suppliers after update
          }}
        />
      ) : (
        <>
          <button onClick={handleAddNewSupplier} className="btn btn-primary mb-4">
            Add New Supplier
          </button>
          <table className="table w-full table-zebra">
            <thead>
              <tr className="bg-base-300 text-base-content">
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length > 0 ? (
                suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover">
                    <td>{supplier.name}</td>
                    <td>{supplier.email}</td>
                    <td>{supplier.phone}</td>
                    <td>{supplier.address}</td>
                    <td>
                      <button onClick={() => handleEdit(supplier.id)} className="btn btn-primary btn-xs mr-2">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(supplier.id)} className="btn btn-error btn-xs">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">No suppliers available</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
