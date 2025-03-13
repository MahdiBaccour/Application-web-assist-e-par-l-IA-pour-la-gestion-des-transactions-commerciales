"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getPayments, deletePayment } from "@/services/payments/paymentService"; // Assurez-vous que deletePayment existe
import PaymentForm from "./PaymentForm"; // Assurez-vous d'avoir un formulaire pour ajouter un paiement.

export default function PaymentTable({ refreshTrigger }) {
  const [payments, setPayments] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isAddingNewPayment, setIsAddingNewPayment] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  // Charger les paiements au démarrage du composant ou lors du rafraîchissement
  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const response = await getPayments();
        if (!response.success) {
          throw new Error(response.message || "Failed to fetch payments.");
        }
        setPayments(response.payments || []); // Utiliser payments même si vide
      } catch (error) {
        Swal.fire("Error", `Error fetching payments: ${error.message}`, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [refreshTrigger]);

  const handleAddNewPayment = () => {
    setIsAddingNewPayment(true);
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
        const success = await deletePayment(id); // Assurez-vous que deletePayment est bien défini
        if (success) {
          setPayments((prev) => prev.filter((payment) => payment.id !== id));
          Swal.fire("Deleted!", "The payment has been removed.", "success");
        } else {
          Swal.fire("Error", "Failed to delete payment", "error");
        }
      }
    });
  };

  const handleEdit = (id) => {
    setSelectedPaymentId(id); // Vous pouvez utiliser un formulaire d'édition similaire à celui des clients si nécessaire
  };

  if (loading) return <p className="text-center">Loading payments...</p>;

  return (
    <div className="overflow-x-auto">
      {isAddingNewPayment ? (
        <PaymentForm
          onActionSuccess={() => {
            setIsAddingNewPayment(false);
            setPayments((prev) => [...prev]); // Re-fetch payments after adding a new one
          }}
        />
      ) : selectedPaymentId ? (
        <PaymentForm
          paymentId={selectedPaymentId} // Vous pouvez réutiliser PaymentForm pour la mise à jour si nécessaire
          onActionSuccess={() => {
            setSelectedPaymentId(null);
            setPayments((prev) => [...prev]); // Re-fetch payments after update
          }}
        />
      ) : (
        <>
          <button onClick={handleAddNewPayment} className="btn btn-primary mb-4">
            Add New Payment
          </button>
          <table className="table w-full table-zebra">
            <thead>
              <tr className="bg-base-300 text-base-content">
                <th>Transaction ID</th>
                <th>Amount Paid</th>
                <th>Payment Method</th>
                <th>Actions</th> {/* Ajout d'une colonne pour les actions */}
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover">
                    <td>{payment.transaction_id}</td>
                    <td>${payment.amount_paid}</td>
                    <td>{payment.payment_method_id}</td>
                    <td>
                      <button 
                        onClick={() => handleEdit(payment.id)} 
                        className="btn btn-primary btn-xs mr-2"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(payment.id)} 
                        className="btn btn-error btn-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">No payments found.</td> {/* Ajusté le colSpan pour inclure la colonne Actions */}
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
