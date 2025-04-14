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


export default function TransactionForm() {
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
        if ( session?.user.role !== "owner"  && session?.user.role !== "employee") {
          router.push("/forbidden");
        }
      }, []);

  // Calculate remaining balance
  useEffect(() => {
    const totalPaid = transactionData.payments.reduce((sum, payment) => sum + payment.amount_paid, 0);
    setTransactionData(prev => ({
      ...prev,
      remaining_balance: prev.amount - totalPaid
    }));
  }, [transactionData.payments, transactionData.amount]);

  // Load payment methods
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

  // Add payment handler
  const handleAddPayment = () => {
    if (newPayment.amount_paid > transactionData.remaining_balance) {
      showErrorAlert(session.user.theme, 'Le montant du paiement est supérieur au solde restant');
      return;
    }
    
    setTransactionData(prev => ({
      ...prev,
      payments: [...prev.payments, {
        ...newPayment,
        payment_date: new Date().toISOString()
      }]
    }));
    
    // Reset new payment form
    setNewPayment({
      amount_paid: 0,
      payment_method_id: ''
    });
  };

  // Form validation
const validateStep = (step) => {
  const newErrors = {};
  switch(step) {
    case 1:
      if (!transactionData.type) {
        newErrors.type = 'Veuillez sélectionner un type de transaction';
        showErrorAlert(session.user.theme, newErrors.type);
      }
      break;
    case 2:
      if (!transactionData.client_id && !transactionData.supplier_id) {
        newErrors.party = 'Veuillez sélectionner un client ou un fournisseur';
        showErrorAlert(session.user.theme, newErrors.party);
      }
      break;
    case 3:
      if (transactionData.products.length === 0) {
        newErrors.products = 'Veuillez ajouter au moins un produit';
        showErrorAlert(session.user.theme, newErrors.products);
      }
      break;
    case 4:
      if (showPaymentForm === null) {
        newErrors.paymentDecision = 'Veuillez décider si vous souhaitez ajouter un paiement';
        showErrorAlert(session.user.theme, newErrors.paymentDecision);
      }
       break;
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
  // Submit handler
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const finalData = {
        ...transactionData,
        payments: transactionData.payments.map(p => ({
          amount_paid: p.amount_paid,
          payment_method_id: p.payment_method_id
        }))
      };
console.log('Final Data:', finalData);
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


  // Add useEffect for step validation
  useEffect(() => {
    if (currentStep === 1 && transactionData.type) {
      setErrors(prev => ({ ...prev, type: '' }));
    }
    if (currentStep === 2 && (transactionData.client_id || transactionData.supplier_id)) {
      setErrors(prev => ({ ...prev, party: '' }));
    }
  }, [transactionData, currentStep]);

  // Modified navigation handler
  const handleNextStep = () => {
    const isValid = validateStep(currentStep);
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  }

  return (
    <div className="p-4 space-y-8">
      {/* Progress Indicator */}
      <div className="steps steps-horizontal w-full">
        {[1, 2, 3, 4, 5].map(step => (
          <div className={`step ${currentStep >= step ? 'step-primary' : ''}`} key={step}>
            Step {step}
          </div>
        ))}
      </div>

      
      {/* Step 1: Transaction Type */}
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

      {/* Step 2: Client/Supplier Selection */}
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

      {/* Step 3: Product Selection */}
      {currentStep === 3 && (
        <div className="space-y-8">
          <ProductSelectionStep
            onAddProduct={(product) => {
              setTransactionData(prev => ({
                ...prev,
                products: [...prev.products, product],
                amount: prev.amount + product.totalPrice
              }));
            }}
          />
          
          {/* Selected Products Table */}
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {transactionData.products.map(product => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.quantity}</td>
                    <td>${product.selling_price}</td>
                    <td>${product.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-xl font-bold">
            Total Amount: ${transactionData.amount.toFixed(2)}
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-8">
          <PaymentToggleStep
            onDecision={(decision) => {
              setShowPaymentForm(decision);
              if (!decision) {
                // If skipping payment, move to next step immediately
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
            />
          )}
        </div>
      )}


      {/* Step 5: Final Review */}
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
          </div>
        </div>
      )}

      {/* Navigation Controls */}
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