'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createTransaction } from '@/services/transactions/transactionService';
import { getPaymentMethods } from '@/services/payment_methods/paymentMethodService';
import { showSuccessAlert, showErrorAlert } from '@/utils/swalConfig';
import TransactionTypeStep from './TransactionTypeStep';
import ClientSupplierStep from './ClientSupplierStep';
import ProductSelectionStep from './ProductSelectionStep';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ImSpinner2 } from 'react-icons/im';
import PaymentStep from './PaymentStep';
import PaymentToggleStep from './PaymentToggleStep';
import { FaTrash } from 'react-icons/fa';

export default function TransactionForm()  {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [transactionData, setTransactionData] = useState({
    type: '',
    client_id: '',
    supplier_id: '',
    products: [],
    description: '',
    due_date: '',
    amount: 0,
    payments: [],
    remaining_balance: 0
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount_paid: 0,
    payment_method_id: ''
  });
  const [showPaymentForm, setShowPaymentForm] = useState(null);

  useEffect(() => {
    if (session?.user.role !== "owner" && session?.user.role !== "employee") {
      router.push("/home/forbidden");
    }
  }, []);

  useEffect(() => {
    const totalPaid = transactionData.payments.reduce((sum, payment) => sum + payment.amount_paid, 0);
    setTransactionData(prev => ({
      ...prev,
      remaining_balance: prev.amount - totalPaid
    }));
  }, [transactionData.payments, transactionData.amount]);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const response = await getPaymentMethods(session?.user?.accessToken);
        if (response.success) {
          setPaymentMethods(response.methods);
        } else {
          showErrorAlert(session.user.theme, response.message);
        }
      } catch (error) {
        showErrorAlert(session.user.theme, 'Échec du chargement des méthodes de paiement');
      }
    };

    if (session?.user?.accessToken) {
      loadPaymentMethods();
    }
  }, [session]);

  const handleAddPayment = () => {
    const newErrors = {};

    if (!newPayment.amount_paid || newPayment.amount_paid <= 0) {
      newErrors.amount_paid = 'Veuillez entrer le montant du paiement';
    }

    if (!newPayment.payment_method_id) {
      newErrors.payment_method_id = 'Veuillez sélectionner une méthode de paiement';
    }

    if (newPayment.amount_paid > transactionData.remaining_balance) {
      newErrors.overpaid = 'Le montant du paiement est supérieur au solde restant';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedPayments = [
      ...transactionData.payments,
      {
        ...newPayment,
        payment_date: new Date().toISOString()
      }
    ];

    const totalPaid = updatedPayments.reduce((sum, payment) => sum + Number(payment.amount_paid), 0);
    const newRemainingBalance = transactionData.amount - totalPaid;

    setTransactionData(prev => ({
      ...prev,
      payments: updatedPayments,
      remaining_balance: newRemainingBalance
    }));

    setNewPayment({
      amount_paid: 0,
      payment_method_id: ''
    });
    setErrors({});
  };

  const validateStep = (step) => {
    const newErrors = {};
    switch (step) {
      case 1:
        if (!transactionData.type) {
          newErrors.type = 'Veuillez sélectionner un type de transaction';
        }
        break;
      case 2:
        if (!transactionData.client_id && !transactionData.supplier_id) {
          newErrors.party = 'Veuillez sélectionner un client ou un fournisseur';
        }
        break;
      case 3:
        if (transactionData.products.length === 0) {
          newErrors.products = 'Veuillez ajouter au moins un produit';
        }
        break;
      case 4:
        if (showPaymentForm === null) {
          newErrors.paymentDecision = 'Veuillez décider si vous souhaitez ajouter un paiement';
        } else if (showPaymentForm && transactionData.payments.length === 0) {
          newErrors.payments = 'Veuillez ajouter au moins un paiement';
        }
        break;
      case 5:
        if (!transactionData.due_date) {
          newErrors.due_date = 'Veuillez entrer la date d\'échéance';
        }
        if (!transactionData.description.trim()) {
          newErrors.description = 'Veuillez entrer une description';
        }
        break;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Object.values(newErrors).forEach(error => showErrorAlert(session.user.theme, error));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const total_cost = transactionData.products.reduce(
        (sum, product) => sum + (product.quantity * product.current_cost_price),
        0
      );

      const initial_payment = transactionData.payments.reduce(
        (sum, payment) => sum + Number(payment.amount_paid),
        0
      );

      const reference_number = `REF${Math.floor(100000 + Math.random() * 900000)}`;

      const finalData = {
        type: transactionData.type,
        amount: transactionData.amount,
        total_cost,
        date: new Date().toISOString().split('T')[0],
        description: transactionData.description,
        client_id: transactionData.client_id || null,
        supplier_id: transactionData.supplier_id || null,
        payment_method_id: transactionData.payments[0]?.payment_method_id || null,
        reference_number,
        products: transactionData.products.map(p => ({
          product_id: p.id,
          quantity: p.quantity,
          unit_price: p.selling_price
        })),
        due_date: transactionData.due_date,
        initial_payment,
        due_status: transactionData.remaining_balance <= 0 ? 'paid' : 'pending'
      };

      const response = await createTransaction(finalData, session.user.accessToken);

      if (response.success) {
        showSuccessAlert(session.user.theme, 'Transaction créée avec succès !');
        router.push('/home/transactions');
      } else {
        showErrorAlert(session?.user.theme, response.message);
      }
    } catch (error) {
      showErrorAlert(session?.user.theme, error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStep === 4) {
      setShowPaymentForm(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === 1 && transactionData.type) {
      setErrors(prev => ({ ...prev, type: '' }));
    }
    if (currentStep === 2 && (transactionData.client_id || transactionData.supplier_id)) {
      setErrors(prev => ({ ...prev, party: '' }));
    }
  }, [transactionData, currentStep]);

  const handleNextStep = () => {
    const isValid = validateStep(currentStep);
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className="p-4 space-y-8">
      <div className="steps steps-horizontal w-full">
        {[1, 2, 3, 4, 5].map(step => (
          <div className={`step ${currentStep >= step ? 'step-primary' : ''}`} key={step}>
            Step {step}
          </div>
        ))}
      </div>

      {currentStep === 1 && (
        <TransactionTypeStep
          selectedType={transactionData.type}
          onTypeSelect={(type) => {
            setTransactionData(prev => ({ ...prev, type }));
            setErrors(prev => ({ ...prev, type: '' }));
          }}
          error={errors.type}
        />
      )}

      {currentStep === 2 && (
        <ClientSupplierStep
          type={transactionData.type}
          error={errors.party}
          onSelect={(id) => {
            const update = transactionData.type === 'credit'
              ? { client_id: id }
              : { supplier_id: id };
            setTransactionData(prev => ({ ...prev, ...update }));
            setErrors(prev => ({ ...prev, party: '' }));
          }}
          onError={(message) => showErrorAlert(session.user.theme, message)}
        />
      )}

      {currentStep === 3 && (
        <div className="space-y-8">
          <ProductSelectionStep
            onAddProduct={(product) => {
              setTransactionData(prev => ({
                ...prev,
                products: [...prev.products, {
                  id: product.id,
                  name: product.name,
                  quantity: product.quantity,
                  selling_price: product.selling_price,
                  current_cost_price: product.current_cost_price
                }],
                amount: prev.amount + (product.selling_price * product.quantity)
              }));
            }}
          />

          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactionData.products.map((product, index) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.quantity}</td>
                    <td>${product.selling_price}</td>
                    <td>${(product.selling_price * product.quantity).toFixed(2)}</td>
                    <td>
                      <button
                        className="btn btn-xs btn-error"
                        onClick={() => {
                          const updated = [...transactionData.products];
                          const removed = updated.splice(index, 1)[0];
                          setTransactionData(prev => ({
                            ...prev,
                            products: updated,
                            amount: prev.amount - (removed.selling_price * removed.quantity)
                          }));
                        }}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-8">
          <PaymentToggleStep
            onDecision={(decision) => {
              setShowPaymentForm(decision);
              if (!decision) {
                setCurrentStep(5);
              }
            }}
          />

          {showPaymentForm && (
            <PaymentStep
              paymentMethods={paymentMethods}
              newPayment={newPayment}
              setNewPayment={setNewPayment}
              transactionData={transactionData}
              handleAddPayment={handleAddPayment}
              loading={loading}
              errors={errors}
            />
          )}
          {errors.payments && (
            <div className="text-error text-sm mt-2">{errors.payments}</div>
          )}
        </div>
      )}

      {currentStep === 5 && (
        <div className="space-y-4">
          <div className="alert alert-info">
            <div className="flex-1">
              <label className="alert-title">Résumé de la transaction</label>
              <p>Total Amount: ${transactionData.amount.toFixed(2)}</p>
              <p>Total Payments: ${(transactionData.amount - transactionData.remaining_balance).toFixed(2)}</p>
              <p>Remaining Balance: ${transactionData.remaining_balance.toFixed(2)}</p>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Date d'échéance</span>
            </label>
            <input
              type="date"
              className="input input-bordered"
              value={transactionData.due_date}
              onChange={(e) => setTransactionData(prev => ({
                ...prev,
                due_date: e.target.value
              }))}
            />
            {errors.due_date && <div className="text-error text-sm">{errors.due_date}</div>}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder="Transaction description"
              value={transactionData.description}
              onChange={(e) => setTransactionData(prev => ({
                ...prev,
                description: e.target.value
              }))}
            />
            {errors.description && <div className="text-error text-sm">{errors.description}</div>}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          className="btn"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep(prev => prev - 1)}
        >
          Précédent
        </button>

        {currentStep < 5 ? (
          <button
            className="btn btn-primary"
            onClick={handleNextStep}
            disabled={loading}
          >
            Suivant
          </button>
        ) : (
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={loading || transactionData.remaining_balance < 0}
          >
            {loading ? <ImSpinner2 className="animate-spin" /> : 'Complete Transaction'}
          </button>
        )}
      </div>
    </div>
  );
}