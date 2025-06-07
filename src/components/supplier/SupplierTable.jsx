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
import { FaUserTie, FaUsers, FaUserCheck, FaUserTimes,FaSearch } from "react-icons/fa";
import UpdateSupplierForm from "./UpdateSupplierForm";
import SupplierForm from "./SupplierForm";
import SupplierCard from "./SupplierCard";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

export default function SupplierTable() {
  const { data: session } = useSession();
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [isAddingNewSupplier, setIsAddingNewSupplier] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const suppliersPerPage = 5;

  useEffect(() => {
    if ( session?.user.role !== "owner" &&
      session?.user.role !== "employee") {
      router.push("/home/forbidden");
    }
  }, [ session, router]);

  useEffect(() => {
    const loadSuppliers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSuppliers(statusFilter, session.user.accessToken);
        if (data.success) {
          setSuppliers(data.suppliers);
        } else {
          setError(data.message || "Impossible de charger les fournisseurs.");
        }
      } catch (err) {
        setError(err.message || "Erreur inattendue.");
      }
      setLoading(false);
    };

    loadSuppliers();
  }, [statusFilter, session?.user.accessToken]);

      
        const filteredSuppliers = suppliers.filter(supplier => 
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const handleEdit = (id) => setSelectedSupplierId(id);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const result = await showConfirmationDialog(session.user.theme, {
      title: `Changer le statut à ${newStatus}?`,
      text: "Vous pouvez modifier cela à tout moment.",
      confirmText: `Oui, changer à ${newStatus}`,
    });

    if (result.isConfirmed) {
      setIsLoadingStatus(id);
      try {
        const success = await updateSupplierStatus(id, newStatus, session.user.accessToken);
        if (success) {
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
          showSuccessAlert(session.user.theme, `Statut changé à ${newStatus}`);
        } else {
          showErrorAlert(session.user.theme, "Échec de la mise à jour du statut");
        }
      } catch (err) {
        showErrorAlert(session?.user.theme, "Erreur lors de la mise à jour du statut");
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
    setSuppliers((prev) => [...prev, newSupplier]);
    setIsAddingNewSupplier(false);
  };

  const handleSupplierUpdate = (updatedSupplier) => {
    setSuppliers((prev) =>
      prev.map((supplier) =>
        supplier.id === updatedSupplier.id ? updatedSupplier : supplier
      )
    );
    setSelectedSupplierId(null);
  };

  const indexOfLastSupplier = currentPage * suppliersPerPage;
  const indexOfFirstSupplier = indexOfLastSupplier - suppliersPerPage;
  const currentSuppliers = filteredSuppliers.slice(indexOfFirstSupplier, indexOfLastSupplier);
  const totalPages = Math.ceil(filteredSuppliers.length / suppliersPerPage);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <ImSpinner2 className="animate-spin text-4xl text-primary" />
      </div>
    );
  }



  if (error) {
    return (
      <div className="alert alert-error mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Erreur : {error}</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {isAddingNewSupplier ? (
        <SupplierForm onActionSuccess={handleNewSupplier} onGoBack={handleGoBack} />
      ) : selectedSupplierId ? (
        <UpdateSupplierForm
          supplierId={selectedSupplierId}
          onGoBack={handleGoBack}
          onUpdateSuccess={handleSupplierUpdate}
        />
      ) : (
       <>
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsAddingNewSupplier(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <FaUserTie /> Nouveau fournisseur
              </button>

              <button
                onClick={() => setStatusFilter("all")}
                className={`btn flex items-center gap-2 ${
                  statusFilter === "all" ? "btn-info" : "btn-outline"
                }`}
              >
                <FaUsers /> Tous
              </button>

              <button
                onClick={() => setStatusFilter("active")}
                className={`btn flex items-center gap-2 ${
                  statusFilter === "active" ? "btn-success" : "btn-outline"
                }`}
              >
                <FaUserCheck /> Actifs
              </button>

              <button
                onClick={() => setStatusFilter("inactive")}
                className={`btn flex items-center gap-2 ${
                  statusFilter === "inactive" ? "btn-error" : "btn-outline"
                }`}
              >
                <FaUserTimes /> Inactifs
              </button>
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par nom..."
                className="input input-bordered pl-10 pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>


          <table className="table w-full table-zebra">
            <thead>
              <tr className="bg-base-300 text-base-content">
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Adresse</th>
                <th>Statut</th>
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
                    Aucun fournisseur disponible.
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
              Première
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-sm mx-2"
            >
              Précédente
            </button>
            <span className="text-center mx-2">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn btn-sm mx-2"
            >
              Suivante
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="btn btn-sm"
            >
              Dernière
            </button>
          </div>
        </>
      )}
    </div>
  );
}