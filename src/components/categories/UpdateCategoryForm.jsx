'use client';
import { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';
import { getCategories, updateCategory } from '@/services/categories/categoryService';
import { showSuccessAlert, showErrorAlert } from '@/utils/swalConfig';
import { useSession } from 'next-auth/react';

export default function UpdateCategoryForm({ categoryId, onUpdateSuccess, onGoBack }) {
  const { data: session } = useSession();
  const [category, setCategory] = useState({ name: '' });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await getCategories(session?.user.accessToken);
        if (data.success) {
          const selectedCategory = data.categories.find(cat => cat.id === categoryId);
          if (selectedCategory) {
            setCategory({ name: selectedCategory.name });
          } else {
            showErrorAlert(session?.user.theme, 'Catégorie non trouvée.');
          }
        } else {
          showErrorAlert(session?.user.theme, data.message);
        }
      } catch (error) {
        showErrorAlert(session?.user.theme, 'Échec de la récupération de la catégorie.');
      } finally {
        setLoading(false);
      }
    };
    if (categoryId) fetchCategory();
  }, [categoryId, session]);

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

    setUpdating(true);
    try {
      const response = await updateCategory(categoryId, category, session?.user.accessToken);
      if (response.success) {
        showSuccessAlert(session?.user.theme, 'Catégorie mise à jour avec succès.');
        onUpdateSuccess(response.category);
      } else {
        showErrorAlert(session?.user.theme, response.message);
      }
    } catch (error) {
      showErrorAlert(session?.user.theme, 'Échec de la mise à jour de la catégorie.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <ImSpinner2 className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg shadow-md">
      <button
        onClick={onGoBack}
        className="btn btn-ghost text-primary mb-4 flex items-center"
        disabled={loading}
      >
        <FaArrowLeft className="mr-2" /> Retour
      </button>
      <h2 className="text-xl font-semibold mb-4">Mettre à jour la catégorie</h2>
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
        <button type="submit" className="btn btn-primary w-full" disabled={updating}>
          {updating ? 'Mise à jour...' : 'Mettre à jour la catégorie'}
        </button>
      </form>
    </div>
  );
}