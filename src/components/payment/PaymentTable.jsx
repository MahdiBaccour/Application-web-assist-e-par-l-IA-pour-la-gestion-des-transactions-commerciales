"use client";
import { useEffect, useState } from "react";
import { getPayments, deletePayment, getPaymentsClientOrSupplier } from "@/services/payments/paymentService";
import { ImSpinner2 } from "react-icons/im";
import { 
  FaPlus, 
  FaMoneyCheckAlt, 
  FaCreditCard, 
  FaRegMoneyBillAlt,
  FaUniversity,
  FaMobileAlt,
  FaFileInvoiceDollar
} from "react-icons/fa";
import PaymentForm from "./PaymentForm";
import PaymentCard from "./PaymentCard";
import UpdatePaymentForm from "./UpdatePaymentForm";
import {
  showConfirmationDialog,
  showSuccessAlert,
  showErrorAlert,
} from "@/utils/swalConfig";
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";

// Payment methods data
const paymentMethods = [
  { id: 1, name: "Credit Card", icon: <FaCreditCard /> },
  { id: 2, name: "Cash", icon: <FaRegMoneyBillAlt /> },
  { id: 3, name: "Bank Transfer", icon: <FaUniversity /> },
  { id: 4, name: "Debit Card", icon: <FaCreditCard /> },
  { id: 5, name: "Mobile Payments", icon: <FaMobileAlt /> },
  { id: 6, name: "Checks", icon: <FaFileInvoiceDollar /> }
];

export default function PaymentTable({ refreshTrigger,startDate, endDate,onDataCapture }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [isAddingNewPayment, setIsAddingNewPayment] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(null);
  const [filterMethod, setFilterMethod] = useState("all");
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsPerPage] = useState(5);

  useEffect(() => {
    if ( session?.user.role !== "owner" && session?.user.role !== "employee") {
      router.push("/home/forbidden");
    }
  }, [ session, router]);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        let response;
        
        if (session?.user.role === "client") {
          response = await getPaymentsClientOrSupplier(
            startDate || undefined,
            endDate || undefined,
            session.user.id, // Client ID
            undefined, // No supplier ID
            session?.user.accessToken
          );
        } else if (session?.user.role === "supplier") {
          response = await getPaymentsClientOrSupplier(
            startDate || undefined,
            endDate || undefined,
            undefined, // No client ID
            session.user.id, // Supplier ID
            session?.user.accessToken
          );
        } else {
          response = await getPayments(
            startDate || undefined,
            endDate || undefined,
            session?.user.accessToken
          );
        }
    
        setPayments(response.payments || []);
        onDataCapture(response.payments || []);
      } catch (error) {
       showErrorAlert(session?.user?.theme || "light", "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [refreshTrigger, session?.user.accessToken, session?.user.theme]);



  const handleAddNewPayment = () => {
    setIsAddingNewPayment(true);
  };

  const handleDelete = async (id) => {
    const result = await showConfirmationDialog(session.user.theme, {
      title: "Supprimer le paiement?",
      text: "Cette action ne peut être annulée!",
      confirmText: "Oui, supprimez-le",
    });

    if (result.isConfirmed) {
      setIsLoadingDelete(id);
      try {
        const success = await deletePayment(id, session.user.accessToken);
        if (success) {
          setPayments(prev => prev.filter(payment => payment.id !== id));
          showSuccessAlert(session.user.theme, "Paiement supprimé avec succès");
        } else {
          showErrorAlert(session.user.theme, "Échec de la suppression du paiement");
        }
      } catch (error) {
        showErrorAlert(session.user.theme, "Échec de la suppression du paiement");
      } finally {
        setIsLoadingDelete(null);
      }
    }
  };

  const handleEdit = (id) => {
    setSelectedPaymentId(id);
  };

  const handleGoBack = () => {
    setIsAddingNewPayment(false);
    setSelectedPaymentId(null);
  };

  const handlePaymentUpdate = (updatedPayment) => {
    setPayments(prev => prev.map(payment => 
      payment.id === updatedPayment.id ? updatedPayment : payment
    ));
    setSelectedPaymentId(null);
  };

// Update the handleNewPayment function
const handleNewPayment = (newPayment) => {
  // Ensure the payment has required fields
  if (newPayment && newPayment.id) {
    setPayments(prev => [{
      id: newPayment.id,
      transaction_id: newPayment.transaction_id,
      amount_paid: newPayment.amount_paid,
      payment_method_id: newPayment.payment_method_id,
      payment_date: newPayment.payment_date || new Date().toISOString()
    }, ...prev]);
    setIsAddingNewPayment(false);
  } else {
    console.error("Invalid payment data received:", newPayment);
  }
};

  const filteredPayments = payments.filter(payment => {
    if (filterMethod === "all") return true;
    return payment.payment_method === filterMethod;
  });

  // Pagination calculations
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return (
    <div className="flex justify-center items-center mt-10">
      <ImSpinner2 className="animate-spin text-4xl text-primary" />
    </div>
  );



 // In PaymentTable component
return (
  <div className="overflow-x-auto">
    {isAddingNewPayment ? (
      <PaymentForm 
        onActionSuccess={handleNewPayment} 
        onGoBack={handleGoBack}
        accessToken={session.user.accessToken}
      />
    ) : selectedPaymentId ? (
      <UpdatePaymentForm  // Use the update form component
        paymentId={selectedPaymentId}
        onUpdateSuccess={handlePaymentUpdate}
        onGoBack={handleGoBack}
        accessToken={session.user.accessToken}
      />
    ) : (
      <>
        {/* Table and filters */}
        <div className="flex gap-2 mb-4 flex-wrap" >
          <button
            onClick={handleAddNewPayment}
            className="btn btn-primary flex items-center gap-2"
          >
            <FaPlus /> Ajouter un nouveau paiement
          </button>


            <button
              onClick={() => setFilterMethod("all")}
              className={`btn flex items-center gap-2 ${
                filterMethod === "all" ? "btn-info" : "btn-outline"
              }`}
            >
              <FaMoneyCheckAlt /> Tous
            </button>

            {paymentMethods.map(method => (
              <button
                key={method.id}
                onClick={() => setFilterMethod(method.name)}
                className={`btn flex items-center gap-2 ${
                  filterMethod === method.name ? "btn-success" : "btn-outline"
                }`}
              >
                {method.icon} {method.name}
              </button>
            ))}
          </div>

          <table className="table w-full table-zebra">
            <thead>
              <tr className="bg-base-300 text-base-content">
                <th>Transaction ID</th>
                <th>Montant</th>
                <th>Méthode</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {currentPayments.length > 0 ? (
              currentPayments.map(payment => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onEdit={handleEdit}  // This now triggers the update form
                  onDelete={handleDelete}
                  isLoadingDelete={isLoadingDelete}
                />
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  Aucun paiement trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>


          <div className="flex justify-center mt-4">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="btn btn-sm"
            >
              Première
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-sm mx-2"
            >
              Précédent
            </button>
            <span className="text-center mx-2">
              Page {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn btn-sm mx-2"
            >
              Suivant
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
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