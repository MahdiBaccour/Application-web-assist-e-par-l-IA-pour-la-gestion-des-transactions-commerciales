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
    remaining_balance: "",
    payment_date: new Date().toISOString().split('T')[0] //  default date
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    transaction: '',
    amount: '',
    paymentMethod: ''
  });

  const validateStep1 = () => {
    if (!formData.transaction_id) {
      setErrors(prev => ({ ...prev, transaction: 'Veuillez sélectionner une transaction' }));
      showErrorAlert(session.user.theme, 'Veuillez sélectionner une transaction');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.amount_paid || formData.amount_paid <= 0) {
      newErrors.amount = 'Veuillez saisir un montant valide';
      isValid = false;
    } else if (parseFloat(formData.amount_paid) > parseFloat(formData.remaining_balance)) {
      newErrors.amount = 'Le montant ne peut pas dépasser le solde restant';
      isValid = false;
    }

    if (!formData.payment_method_id) {
      newErrors.paymentMethod = 'Veuillez sélectionner un mode de paiement';
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) {
      showErrorAlert(session.user.theme, 'Veuillez corriger les erreurs de formulaire');
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
      showErrorAlert(session.user.theme, 'Échec du chargement des transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSelect = (transaction) => {
    if (!transaction) {
      setErrors(prev => ({ ...prev, transaction: 'Veuillez sélectionner une transaction' }));
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
      showErrorAlert(session.user.theme, 'Échec du chargement des méthodes de paiement');
    }
  };

// Modify the handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateStep2()) return;

  const paymentData = {
    ...formData,
    amount_paid: parseFloat(formData.amount_paid),
    payment_date: new Date(formData.payment_date).toISOString()
  };

  const response = await createPayment(
    paymentData, // Pass the entire payment data object
    session.user.accessToken
  );

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
              <span className="label-text">Solde restant</span>
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
              <span className="label-text">Montant à payer</span>
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
              <span className="label-text">Mode de paiement</span>
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
              <option value="">Sélectionner le mode de paiement</option>
              {paymentMethods.map(method => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
            
            <div className="form-control">
            <label className="label">
              <span className="label-text">Date de paiement</span>
            </label>
            <input
              type="date"
              name="payment_date"
              value={formData.payment_date}
              onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
              className="input input-bordered"
              required
            />
          </div>
            {errors.paymentMethod && <span className="text-error text-sm">{errors.paymentMethod}</span>}
          </div>

          <button type="submit" className="btn btn-primary w-full">
          Terminer le paiement
          </button>
        </form>
      )}
    </div>
  );
}