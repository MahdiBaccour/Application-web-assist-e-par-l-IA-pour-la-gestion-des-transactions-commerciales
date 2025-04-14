'use client';
import { useEffect, useState } from 'react';
import { getPaymentsByTransactionId } from '@/services/payments/paymentService';
import { FaMoneyBillWave, FaEdit, FaTrashAlt } from 'react-icons/fa';  // React icons for Edit and Delete
import { ImSpinner2 } from "react-icons/im";
import { useSession } from "next-auth/react";

export default function Payments({ transactionId }) {
  const { data: session } = useSession();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await getPaymentsByTransactionId(transactionId, session.user.accessToken);
        if (response.success) {
          setPayments(response.payments);
        } else {
          setError(response.message);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      fetchPayments();
    }
  }, [transactionId, session.user.accessToken]);

  const handleEdit = (paymentId) => {
    // Handle the edit logic here
    console.log("Editing payment", paymentId);
  };

  const handleDelete = (paymentId) => {
    // Handle the delete logic here
    console.log("Deleting payment", paymentId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
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
        <span>Error loading payments: {error}</span>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Payment History</h3>
      {payments.length === 0 ? (
        <div className="alert alert-info mt-4">
          <FaMoneyBillWave className="w-6 h-6" />
          <span>No payments found for this transaction</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Amount Paid</th>
                <th>Payment Method</th>
                <th>Payment Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.amount_paid}</td>
                  <td>{payment.payment_method_name}</td>
                  <td>{new Date(payment.payment_date).toLocaleString()}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(payment.id)}
                      className="btn btn-sm btn-primary mr-2"
                    >
                      <FaEdit className="mr-2" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(payment.id)}
                      className="btn btn-sm btn-danger"
                    >
                      <FaTrashAlt className="mr-2" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}