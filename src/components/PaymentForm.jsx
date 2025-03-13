"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { createPayment } from "@/services/payments/paymentService";

export default function PaymentForm({ onActionSuccess }) {
  const [payment, setPayment] = useState({
    transaction_id: "",
    amount_paid: "",
    payment_method_id: "",
  });
  const [adding, setAdding] = useState(false);

  const handleChange = (e) => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);

    try {
      const newPayment = await createPayment (payment);

      if (!newPayment.success) {
        throw new Error(newPayment.message || "Failed to process payment.");
      }

      Swal.fire("Success", "Payment recorded successfully!", "success");
      onActionSuccess();
    } catch (error) {
      Swal.fire("Error", `Failed to process payment: ${error.message}`, "error");
    } finally {
      setAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-semibold">Make a Payment</h2>
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
        placeholder="Payment Method ID"
      />
      <button type="submit" className="btn btn-primary w-full" disabled={adding}>
        {adding ? "Processing..." : "Submit Payment"}
      </button>
    </form>
  );
}
