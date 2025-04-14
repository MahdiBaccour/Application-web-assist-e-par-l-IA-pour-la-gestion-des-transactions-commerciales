'use client';
import { useEffect, useState } from 'react';
import { getClients } from '@/services/clients/clientService';
import { getSuppliers } from '@/services/suppliers/supplierService';
import { showErrorAlert } from '@/utils/swalConfig';
import {useSession} from 'next-auth/react';
export default function ClientSupplierStep({ type, error, onSelect, onError }) {
    const { data: session } = useSession();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = type === 'credit' 
          ? await getClients("active",session?.user.accessToken) 
          : await getSuppliers("active",session?.user.accessToken);
        
          if (response.success) {
            setOptions(type === 'credit' ? response.clients : response.suppliers);
          }else {
          onError(response.message);
        }
      } catch (error) {
        onError(error.message);
        showErrorAlert(session.user.theme,`Failed to load ${type === 'credit' ? 'clients' : 'suppliers'}: ${response.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  return (
    <div className="space-y-4">
      <select 
        className="select select-bordered w-full"
        onChange={(e) => {
          if (e.target.value) {
            onSelect(e.target.value);
          }
        }}
      >
        <option value="">Select {type === 'credit' ? 'Client' : 'Supplier'}</option>
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
       </select>
      {error && <div className="text-error text-center mt-2">{error}</div>}
    </div>
  );
}