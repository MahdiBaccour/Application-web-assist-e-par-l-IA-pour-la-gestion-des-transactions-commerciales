"use client";
import { useEffect, useState } from 'react';
import { getCategories } from '@/services/categories/categoryService'; // Assuming you have a service for categories
import { getSuppliers } from '@/services/suppliers/supplierService'; // Assuming you have a service for suppliers
import { showErrorAlert } from '@/utils/swalConfig'; // Assuming you have a custom error handling utility
import { useSession } from 'next-auth/react';

export default function ProductToggleStep({ type, error, onSelect, onError }) {
  const { data: session } = useSession(); // Fetch session data
  const [options, setOptions] = useState([]); // Options for select
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch categories or suppliers based on type
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = type === 'category'
          ? await getCategories(session?.user.accessToken) // Fetch categories if type is 'category'
          : await getSuppliers("active", session?.user.accessToken); // Fetch suppliers if type is 'supplier'

        if (response.success) {
          // Set options based on the type ('category' or 'supplier')
          setOptions(type === 'category' ? response.categories : response.suppliers);
        } else {
          onError(response.message); // Pass the error message to the parent component
        }
      } catch (error) {
        // Handle errors and show alert
        onError(error.message);
        showErrorAlert(session?.user.theme, `Failed to load ${type === 'category' ? 'categories' : 'suppliers'}: ${error.message}`);
      } finally {
        setLoading(false); // Set loading state to false when request is done
      }
    };

    fetchData();
  }, [type, session?.user.accessToken, onError]);

  return (
    <div className="space-y-4">
      {loading ? (
        <p>Loading...</p> // Show loading text while fetching data
      ) : (
        <select
          className="select select-bordered w-full"
          onChange={(e) => {
            if (e.target.value) {
              onSelect(e.target.value); // Pass the selected value to the parent component
            }
          }}
        >
          <option value="">Select {type === 'category' ? 'Category' : 'Supplier'}</option>
          {options.length > 0 ? (
            options.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))
          ) : (
            <option value="">No options available</option>
          )}
        </select>
      )}

      {error && <div className="text-error text-center mt-2">{error}</div>} {/* Show error message if any */}
    </div>
  );
}
