"use client";

import { useEffect, useState } from "react";
import {
  getSuppliers,
  updateSupplierStatus,
} from "@/services/suppliers/supplierService";
import {
  showConfirmationDialog,
  showSuccessAlert,
  showErrorAlert,
} from "@/utils/swalConfig";
import { ImSpinner2 } from "react-icons/im";
import { FaUserTie,FaUsers, FaUserCheck, FaUserTimes } from "react-icons/fa";
import UpdateSupplierForm from "./UpdateSupplierForm";
import SupplierForm from "./SupplierForm";
import SupplierCard from "./SupplierCard";

export default function SupplierTable() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [isAddingNewSupplier, setIsAddingNewSupplier] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const suppliersPerPage = 5;

  useEffect(() => {
    const loadSuppliers = async () => {
      setLoading(true);
      try {
        const data = await getSuppliers(statusFilter);
        setSuppliers(data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
      setLoading(false);
    };
    loadSuppliers();
  }, [statusFilter]);

  const handleEdit = (id) => {
    setSelectedSupplierId(id);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const result = await showConfirmationDialog({
      title: `Set status to ${newStatus}?`,
      text: "You can always change this later",
      confirmText: `Yes, set to ${newStatus}`,
    });

    if (result.isConfirmed) {
      setIsLoadingStatus(id);
      try {
        const success = await updateSupplierStatus(id, newStatus);
        if (success) {
          // Update suppliers list
          setSuppliers((prev) =>
            prev
              .map((supplier) =>
                supplier.id === id
                  ? { ...supplier, status_supplier: newStatus }
                  : supplier
              )
              .filter(
                (supplier) =>
                  statusFilter === "all" ||
                  supplier.status_supplier === statusFilter
              )
          );
          showSuccessAlert(`Status set to ${newStatus}`);
        } else {
          showErrorAlert("Failed to update status");
        }
      } catch (error) {
        showErrorAlert("Failed to update status");
      } finally {
        setIsLoadingStatus(null);
      }
    }
  };

  const handleGoBack = () => {
    setIsAddingNewSupplier(false);
    setSelectedSupplierId(null);
  };

  const handleNewSupplier = (newSupplier) => {
    setSuppliers((prevSuppliers) => [...prevSuppliers, newSupplier]);
    setIsAddingNewSupplier(false);
  };

  const handleSupplierUpdate = (updatedSupplier) => {
    console.log(updatedSupplier);
    setSuppliers((prevSuppliers) =>
      prevSuppliers.map((supplier) =>
        supplier.id === updatedSupplier.id ? updatedSupplier : supplier
      )
    );
    setSelectedSupplierId(null);
  };

  const indexOfLastSupplier = currentPage * suppliersPerPage;
  const indexOfFirstSupplier = indexOfLastSupplier - suppliersPerPage;
  const currentSuppliers = suppliers.slice(
    indexOfFirstSupplier,
    indexOfLastSupplier
  );
  const totalPages = Math.ceil(suppliers.length / suppliersPerPage);

  if (loading)
    return (
      <div className="flex justify-center items-center mt-10">
        <ImSpinner2 className="animate-spin text-4xl text-primary" />
      </div>
    );

  return (
    <div className="overflow-x-auto">
      {isAddingNewSupplier ? (
        <SupplierForm
          onActionSuccess={handleNewSupplier}
          onGoBack={handleGoBack}
        />
      ) : selectedSupplierId ? (
        <UpdateSupplierForm
          supplierId={selectedSupplierId}
          onGoBack={handleGoBack}
          onUpdateSuccess={handleSupplierUpdate}
        />
      ) : (
        <>
          <div className="flex gap-2 mb-4">
            {/* Add New Supplier */}
            <button
              onClick={() => setIsAddingNewSupplier(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <FaUserTie /> Add New Supplier
            </button>

            {/* Status Filters */}
            <button
              onClick={() => setStatusFilter("all")}
              className={`btn flex items-center gap-2 ${
                statusFilter === "all" ? "btn-info" : "btn-outline"
              }`}
            >
              <FaUsers /> All
            </button>

            <button
              onClick={() => setStatusFilter("active")}
              className={`btn flex items-center gap-2 ${
                statusFilter === "active" ? "btn-success" : "btn-outline"
              }`}
            >
               <FaUserCheck/> Active
            </button>

            <button
              onClick={() => setStatusFilter("inactive")}
              className={`btn flex items-center gap-2 ${
                statusFilter === "inactive" ? "btn-error" : "btn-outline"
              }`}
            >
              <FaUserTimes/> Inactive
            </button>
          </div>
          <table className="table w-full table-zebra">
            <thead>
              <tr className="bg-base-300 text-base-content">
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSuppliers.length > 0 ? (
                currentSuppliers.map((supplier) => (
                  <SupplierCard
                    key={supplier.id}
                    supplier={supplier}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    isLoadingStatus={isLoadingStatus}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No suppliers available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="btn btn-sm"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-sm mx-2"
            >
              Previous
            </button>
            <span className="text-center mx-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn btn-sm mx-2"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="btn btn-sm"
            >
              Last
            </button>
          </div>
        </>
      )}
    </div>
  );
}
