"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { updatePayment, getPayment } from "@/services/payments/paymentService"; // Import the necessary services

export default function UpdatePaymentForm({ paymentId, onUpdateSuccess }) {
  const [payment, setPayment] = useState({ transaction_id: "", amount_paid: "", payment_method_id: "" });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch the payment details when the component mounts or paymentId changes
  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await getPayment(paymentId);
        
        if (!response || !response.success) {
          throw new Error(response?.message || "Failed to fetch payment data");
        }
        
        // Adjust this based on your actual API response structure
        setPayment({
          transaction_id: response.payment.transaction_id,
          amount_paid: response.payment.amount_paid,
          payment_method_id: response.payment.payment_method_id
        });
        
        setLoading(false);
      } catch (error) {
        Swal.fire("Error", error.message, "error");
        setLoading(false);
      }
    };
  
    if (paymentId) fetchPayment();
  }, [paymentId]);
  

  const handleChange = (e) => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const updatedPayment = await updatePayment(paymentId, payment); // Use the update service

      if (!updatedPayment) throw new Error("Failed to update payment");

      Swal.fire("Success", "Payment updated successfully!", "success");
      onUpdateSuccess();  // Trigger success callback
    } catch (error) {
      Swal.fire("Error", error.message || "Failed to update payment", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Loading payment data...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-semibold">Update Payment</h2>
      <input
        type="text"
        name="transaction_id"
        value={payment.transaction_id}
        onChange={handleChange}
        required
        className="input input-bordered w-full"
        placeholder="Transaction ID"
      />
      <input
        type="number"
        name="amount_paid"
        value={payment.amount_paid}
        onChange={handleChange}
        required
        className="input input-bordered w-full"
        placeholder="Amount Paid"
      />
      <input
        type="text"
        name="payment_method_id"
        value={payment.payment_method_id}
        onChange={handleChange}
        required
        className="input input-bordered w-full"
        placeholder="Payment Method"
      />
      <button type="submit" className="btn btn-primary w-full" disabled={updating}>
        {updating ? "Updating..." : "Update Payment"}
      </button>
    </form>
  );
}
