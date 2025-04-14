'use client';
import { motion } from "framer-motion";

export default function TransactionTypeStep({
  selectedType,
  onTypeSelect,
  transactions,
  onTransactionSelect,
  loading,
  error
}) {
  return (
    <div className="space-y-6">
      <div className="flex gap-4 justify-center">
        {['credit', 'debit'].map((type) => (
          <motion.button
            key={type}
            onClick={() => onTypeSelect(type)}
            className={`btn ${selectedType === type ? 'btn-primary' : 'btn-outline'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div className="text-center">Loading transactions...</div>
      ) : transactions.length > 0 ? (
        <div className="space-y-4">
          <select
            onChange={(e) => {
              const selectedId = parseInt(e.target.value);
              const selectedTransaction = transactions.find(t => t.id === selectedId);
              onTransactionSelect(selectedTransaction || null);
            }}
            className={`select select-bordered w-full ${error ? 'select-error' : ''}`}
          >
            <option value="">Select Transaction</option>
            {transactions.map(transaction => (
              <option key={transaction.id} value={transaction.id}>
                {transaction.reference_number} - {transaction.description}
              </option>
            ))}
          </select>
          {error && <span className="text-error text-sm">{error}</span>}
        </div>
      ) : selectedType && (
        <div className="text-center text-gray-500">
          Aucune transaction active de type {selectedType} n'a été trouvée.
        </div>
      )}
    </div>
  );
}