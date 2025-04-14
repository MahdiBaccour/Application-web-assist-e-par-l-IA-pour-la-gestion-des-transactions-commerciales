"use client";
import { useEffect, useState } from "react";
import { ImSpinner2 } from "react-icons/im";
import { FaArrowLeft } from "react-icons/fa";
import { updatePayment, getPaymentById } from "@/services/payments/paymentService";
import { 
  showConfirmationDialog,
  showSuccessAlert,
  showErrorAlert
} from '@/utils/swalConfig';
import { useSession } from 'next-auth/react';

export default function UpdatePaymentForm({ paymentId, onUpdateSuccess, onGoBack }) {
  const { data: session } = useSession();
  const [payment, setPayment] = useState({ 
    transaction_id: "", 
    amount_paid: "", 
    payment_method_id: "" ,
    payment_date: ""  // Already present
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await getPaymentById(paymentId, session.user.accessToken);
        
        if (!response?.success) {
          throw new Error(response?.message || "Échec de l'extraction des données de paiement");
        }
        
        setPayment({
          transaction_id: response.payment.transaction_id,
          amount_paid: response.payment.amount_paid,
          payment_method_id: response.payment.payment_method_id,
          payment_date: response.payment.payment_date  
        });
        
        setLoading(false);
      } catch (error) {
        showErrorAlert(session.user.theme, error.message);
        setLoading(false);
      }
    };

    if (paymentId) fetchPayment();
  }, [paymentId, session.user.accessToken, session.user.theme]);

  const handleChange = (e) => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const updatedPayment = await updatePayment(
        paymentId, 
        payment,
        session.user.accessToken
      );

      if (!updatedPayment) throw new Error("Échec de la mise à jour du paiement");

      showSuccessAlert(session.user.theme, "Paiement mis à jour avec succès !");
      onUpdateSuccess(updatedPayment);
    } catch (error) {
      showErrorAlert(session.user.theme, error.message || "Échec de la mise à jour du paiement");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center mt-10">
      <ImSpinner2 className="animate-spin text-4xl text-primary" />
    </div>
  );

  return (
    <div>
      <button
        onClick={onGoBack}
        className="btn btn-ghost text-primary mb-4 flex items-center"
        disabled={loading}
      >
        <FaArrowLeft className="mr-2" /> Retour
      </button>

      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Mise à jour du paiement</h2>

        <label className="block text-sm font-medium">ID de transaction</label>
        <input
          type="text"
          name="transaction_id"
          value={payment.transaction_id}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="ID de transaction"
        />

        <label className="block text-sm font-medium">Montant payé</label>
        <input
          type="number"
          name="amount_paid"
          value={payment.amount_paid}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="Montant payé"
        />

        <label className="block text-sm font-medium">Méthode de paiement</label>
        <select
          name="payment_method_id"
          value={payment.payment_method_id}
          onChange={handleChange}
          className="select select-bordered w-full"
          required
        >
          <option value="">Sélectionner une méthode</option>
          <option value="1">Carte de crédit</option>
          <option value="2">Espèces</option>
          <option value="3">Virement bancaire</option>
          <option value="4">Carte de débit</option>
          <option value="5">Paiement mobile</option>
          <option value="6">Chèque</option>
        </select>

        <label className="block text-sm font-medium">Date de paiement</label>
        <input
          type="date"
          name="payment_date"
          value={payment.payment_date?.split('T')[0] || ''}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        />

        <button 
          type="submit" 
          className="btn btn-primary w-full" 
          disabled={updating}
        >
          {updating ? (
            <ImSpinner2 className="animate-spin" />
          ) : (
            "Mettre à jour le paiement"
          )}
        </button>
      </form>
    </div>
  );
}