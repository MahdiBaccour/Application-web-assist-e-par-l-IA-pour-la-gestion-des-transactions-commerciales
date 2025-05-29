'use client';
import { ImSpinner2 } from 'react-icons/im';

export default function PaymentStep({
  paymentMethods,
  newPayment,
  setNewPayment,
  transactionData,
  handleAddPayment,
  loading
}) {
  return (
    <div className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Montant total</span>
        </label>
        <input
          type="text"
          value={`TND ${transactionData.amount.toFixed(2)}`}
          className="input input-bordered"
          disabled
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Solde restant</span>
        </label>
        <input
          type="text"
          value={`TND ${transactionData.remaining_balance.toFixed(2)}`}
          className={`input input-bordered ${transactionData.remaining_balance < 0 ? 'input-error' : ''}`}
          disabled
        />
      </div>

      <div className="border p-4 rounded-lg">
        <div className="flex gap-4 items-end">
          <div className="form-control flex-1">
            <label className="label">
              <span className="label-text">Montant du paiement</span>
            </label>
            <input
              type="number"
              step="0.01"
              className="input input-bordered"
              value={newPayment.amount_paid || ''}
              onChange={(e) => setNewPayment(prev => ({
                ...prev,
                amount_paid: parseFloat(e.target.value)
              }))}
            />
          </div>

          <div className="form-control flex-1">
            <label className="label">
              <span className="label-text">Mode de paiement</span>
            </label>
            <select
              className="select select-bordered"
              value={newPayment.payment_method_id}
              onChange={(e) => setNewPayment(prev => ({
                ...prev,
                payment_method_id: e.target.value
              }))}
            >
              <option value="">Sélectionner la méthode</option>
              {paymentMethods.map(method => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="btn btn-primary"
            onClick={handleAddPayment}
            disabled={!newPayment.amount_paid || !newPayment.payment_method_id}
          >
            {loading ? <ImSpinner2 className="animate-spin" /> : 'Add Payment'}
          </button>
        </div>

        <div className="mt-4">
          <h4 className="text-lg font-semibold mb-2">Paiements effectués</h4>
          {transactionData.payments.map((payment, index) => (
            <div key={index} className="flex justify-between items-center border-b py-2">
              <span>${payment.amount_paid.toFixed(2)}</span>
              <span>{paymentMethods.find(m => m.id === payment.payment_method_id)?.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}