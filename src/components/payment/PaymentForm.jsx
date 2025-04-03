'use client';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getActiveTransactionsByType } from "@/services/transactions/transactionService";
import { getPaymentMethods } from "@/services/payment_methods/paymentMethodService";
import { createPayment } from "@/services/payments/paymentService";
import { useSession } from 'next-auth/react';
import TransactionTypeStep from "./TransactionTypeStep";
import { showSuccessAlert, showErrorAlert } from '@/utils/swalConfig';

export default function PaymentForm({ onActionSuccess, onGoBack }) {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [formData, setFormData] = useState({
    transaction_id: "",
    amount_paid: "",
    payment_method_id: "",
    remaining_balance: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    transaction: '',
    amount: '',
    paymentMethod: ''
  });

  const validateStep1 = () => {
    if (!formData.transaction_id) {
      setErrors(prev => ({ ...prev, transaction: 'Please select a transaction' }));
      showErrorAlert(session.user.theme, 'Please select a transaction');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.amount_paid || formData.amount_paid <= 0) {
      newErrors.amount = 'Please enter a valid amount';
      isValid = false;
    } else if (parseFloat(formData.amount_paid) > parseFloat(formData.remaining_balance)) {
      newErrors.amount = 'Amount cannot exceed remaining balance';
      isValid = false;
    }

    if (!formData.payment_method_id) {
      newErrors.paymentMethod = 'Please select a payment method';
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) {
      showErrorAlert(session.user.theme, 'Please fix the form errors');
    }
    return isValid;
  };

  const handleTypeSelect = async (type) => {
    setSelectedType(type);
    setLoading(true);
    try {
      const result = await getActiveTransactionsByType(type, session.user.accessToken);
      if (result.success) {
        setTransactions(result.transactions);
        setErrors(prev => ({ ...prev, transaction: '' }));
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      showErrorAlert(session.user.theme, 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSelect = (transaction) => {
    if (!transaction) {
      setErrors(prev => ({ ...prev, transaction: 'Please select a transaction' }));
      return;
    }
    
    setErrors(prev => ({ ...prev, transaction: '' }));
    setFormData({
      ...formData,
      transaction_id: transaction.id,
      remaining_balance: transaction.remaining_balance,
      amount_paid: transaction.remaining_balance
    });
    setCurrentStep(2);
  };

  const handlePaymentMethodSelect = async () => {
    try {
      const result = await getPaymentMethods(session.user.accessToken);
      if (result.success) {
        setPaymentMethods(result.methods);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      showErrorAlert(session.user.theme, 'Failed to load payment methods');
    }
  };

// Modify the handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateStep2()) return;

  const amountPaidFloat = parseFloat(formData.amount_paid);

  const response = await createPayment(
    formData.transaction_id,
    amountPaidFloat,
    formData.payment_method_id, 
    session.user.accessToken
  );
  console.log("reqponse  payments is ",response.payment);

  if (response.success) {
    showSuccessAlert(session.user.theme, response.message);
    onActionSuccess(response.payment);
  } else {
    showErrorAlert(session.user.theme, response.message);
  }
};
  return (
    <div className="p-4 border rounded-lg shadow-md">
      {/* Progress Indicator */}
      <div className="flex justify-center mb-8">
        {[1, 2].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center 
              ${currentStep >= step ? 'bg-primary text-white' : 'bg-gray-200'}`}>
              {step}
            </div>
            {step < 2 && <div className="w-16 h-1 bg-gray-200 mx-2"></div>}
          </div>
        ))}
      </div>

      {/* Back Button */}
      <button
        onClick={currentStep === 1 ? onGoBack : () => setCurrentStep(1)}
        className="btn btn-ghost text-primary mb-4"
      >
        ← Back
      </button>

      {currentStep === 1 ? (
        <TransactionTypeStep
          selectedType={selectedType}
          onTypeSelect={handleTypeSelect}
          transactions={transactions}
          onTransactionSelect={handleTransactionSelect}
          loading={loading}
          error={errors.transaction}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Remaining Balance</span>
            </label>
            <input
              type="text"
              value={formData.remaining_balance}
              className="input input-bordered"
              disabled
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Amount to Pay</span>
            </label>
            <input
              type="number"
              name="amount_paid"
              value={formData.amount_paid}
              onChange={(e) => {
                setFormData({...formData, amount_paid: e.target.value});
                setErrors(prev => ({ ...prev, amount: '' }));
              }}
              className={`input input-bordered ${errors.amount ? 'input-error' : ''}`}
              required
            />
            {errors.amount && <span className="text-error text-sm">{errors.amount}</span>}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Payment Method</span>
            </label>
            <select
              name="payment_method_id"
              value={formData.payment_method_id}
              onChange={(e) => {
                setFormData({...formData, payment_method_id: e.target.value});
                setErrors(prev => ({ ...prev, paymentMethod: '' }));
              }}
              className={`select select-bordered w-full ${errors.paymentMethod ? 'select-error' : ''}`}
              required
              onFocus={handlePaymentMethodSelect}
            >
              <option value="">Select Payment Method</option>
              {paymentMethods.map(method => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
            {errors.paymentMethod && <span className="text-error text-sm">{errors.paymentMethod}</span>}
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Complete Payment
          </button>
        </form>
      )}
    </div>
  );
}