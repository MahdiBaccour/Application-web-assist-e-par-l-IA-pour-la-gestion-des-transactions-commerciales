'use client';
import { motion } from 'framer-motion';
import { showErrorAlert } from '@/utils/swalConfig';
import { useSession } from 'next-auth/react';
export default function TransactionTypeStep({ 
  selectedType,  
  onTypeSelect, 
  error 
}) {
  const { data: session } = useSession();
  const handleSelect = (type) => {
    if (!['credit', 'debit'].includes(type)) {
      showErrorAlert(session?.user.theme,'Type de transaction sélectionné non valide');
      return;
    }
    onTypeSelect(type);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 justify-center">
        {['credit', 'debit'].map((type) => (
          <motion.button
            key={type}
            onClick={() => handleSelect(type)}
            className={`btn ${selectedType === type ? 'btn-primary' : 'btn-outline'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </motion.button>
        ))}
      </div>
      {error && <div className="text-error text-center">{error}</div>}
    </div>
  );
}