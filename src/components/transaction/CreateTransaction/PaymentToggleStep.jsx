'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { showErrorAlert } from '@/utils/swalConfig';

export default function PaymentToggleStep({ onDecision }) {
  const [showPaymentForm, setShowPaymentForm] = useState(null);

  const handleDecision = (decision) => {
    setShowPaymentForm(decision);
    onDecision(decision);
  };

  return (
    <div className="space-y-6 text-center">
      {showPaymentForm === null ? (
        <>
          <h3 className="text-lg font-semibold">Souhaitez-vous ajouter un paiement maintenant ?</h3>
          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-success"
              onClick={() => handleDecision(true)}
            >
              Oui, Ajouter un paiement
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-error"
              onClick={() => handleDecision(false)}
            >
              Non, Sauter le paiement
            </motion.button>
          </div>
        </>
      ) : (
        <div className="text-lg">
          {showPaymentForm ? 'Add your payment details below' : 'Payment step skipped'}
        </div>
      )}
    </div>
  );
}