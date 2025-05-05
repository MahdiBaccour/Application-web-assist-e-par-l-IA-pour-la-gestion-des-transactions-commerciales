'use client';
import { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { createCategory } from '@/services/categories/categoryService';
import { showSuccessAlert, showErrorAlert } from '@/utils/swalConfig';
import { useSession } from 'next-auth/react';

export default function CategoryForm({ onActionSuccess, onGoBack }) {
  const { data: session } = useSession();
  const [category, setCategory] = useState({ name: '' });
  const [errors, setErrors] = useState({});
  const [adding, setAdding] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!category.name) newErrors.name = 'Nom de la catégorie est requis.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setAdding(true);
    try {
      const response = await createCategory(category, session?.user.accessToken);
      if (response.success) {
        showSuccessAlert(session?.user.theme, 'Catégorie créée avec succès.');
        onActionSuccess(response.category);
      } else {
        showErrorAlert(session?.user.theme, response.message);
      }
    } catch (error) {
      showErrorAlert(session?.user.theme, 'Échec de la création de la catégorie.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-md">
      <button
        onClick={onGoBack}
        className="btn btn-ghost text-primary mb-4 flex items-center"
      >
        <FaArrowLeft className="mr-2" /> Retour
      </button>
      <h2 className="text-xl font-semibold mb-4">Ajouter une nouvelle catégorie</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
          <input
            type="text"
            name="name"
            value={category.name}
            onChange={handleChange}
            className={`input input-bordered w-full ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Nom de la catégorie"
          />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={adding}>
          {adding ? 'Ajout en cours...' : 'Ajouter la catégorie'}
        </button>
      </form>
    </div>
  );
}