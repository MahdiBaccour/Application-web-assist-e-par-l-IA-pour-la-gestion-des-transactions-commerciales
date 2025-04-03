"use client";
import { useEffect, useState } from "react";
import { getPayments, deletePayment, updatePaymentStatus } from "@/services/payments/paymentService";
import { ImSpinner2 } from "react-icons/im";
import { FaPlus, FaMoneyCheckAlt, FaCreditCard, FaRegMoneyBillAlt } from "react-icons/fa";
import PaymentForm from "./PaymentForm";
import PaymentCard from "./PaymentCard";
import {
  showConfirmationDialog,
  showSuccessAlert,
  showErrorAlert,
} from "@/utils/swalConfig";
import { useSession } from 'next-auth/react';

export default function PaymentTable({ refreshTrigger }) {
  const { data: session } = useSession();
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
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const response = await getPayments(session.user.accessToken);
        setPayments(response.payments || []);
      } catch (error) {
        showErrorAlert(session.user.theme, "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [refreshTrigger, session.user.accessToken, session.user.theme]);

  const handleAddNewPayment = () => {
    setIsAddingNewPayment(true);
  };

  const handleDelete = async (id) => {
    const result = await showConfirmationDialog(session.user.theme, {
      title: "Delete Payment?",
      text: "This action cannot be undone!",
      confirmText: "Yes, delete it",
    });

    if (result.isConfirmed) {
      setIsLoadingDelete(id);
      try {
        const success = await deletePayment(id, session.user.accessToken);
        if (success) {
          setPayments(prev => prev.filter(payment => payment.id !== id));
          showSuccessAlert(session.user.theme, "Payment deleted successfully");
        } else {
          showErrorAlert(session.user.theme, "Failed to delete payment");
        }
      } catch (error) {
        showErrorAlert(session.user.theme, "Failed to delete payment");
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

  return (
    <div className="overflow-x-auto">
      {isAddingNewPayment ? (
        <PaymentForm 
          onActionSuccess={handleNewPayment} 
          onGoBack={handleGoBack}
          accessToken={session.user.accessToken}
        />
      ) : selectedPaymentId ? (
        <PaymentForm
          paymentId={selectedPaymentId}
          onActionSuccess={handlePaymentUpdate}
          onGoBack={handleGoBack}
          accessToken={session.user.accessToken}
        />
      ) : (
        <>
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleAddNewPayment}
              className="btn btn-primary flex items-center gap-2"
            >
              <FaPlus /> Add New Payment
            </button>

            <button
              onClick={() => setFilterMethod("all")}
              className={`btn flex items-center gap-2 ${
                filterMethod === "all" ? "btn-info" : "btn-outline"
              }`}
            >
              <FaMoneyCheckAlt /> All
            </button>

                      <button
            onClick={() => setFilterMethod("Credit Card")}
            className={`btn flex items-center gap-2 ${
              filterMethod === "Credit Card" ? "btn-success" : "btn-outline"
            }`}
          >
            <FaCreditCard /> Credit Card
          </button>

          <button
            onClick={() => setFilterMethod("Cash")}
            className={`btn flex items-center gap-2 ${
              filterMethod === "Cash" ? "btn-warning" : "btn-outline"
            }`}
          >
            <FaRegMoneyBillAlt /> Cash
          </button>
          </div>

          <table className="table w-full table-zebra">
            <thead>
              <tr className="bg-base-300 text-base-content">
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Method</th>
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
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoadingDelete={isLoadingDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No payments found
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
              First
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-sm mx-2"
            >
              Previous
            </button>
            <span className="text-center mx-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn btn-sm mx-2"
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
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