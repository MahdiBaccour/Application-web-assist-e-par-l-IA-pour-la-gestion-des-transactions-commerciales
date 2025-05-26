'use client';
import { useState } from 'react';
import { FaSpinner, FaTimes } from 'react-icons/fa';
import { showSuccessAlert, showErrorAlert } from '@/utils/swalConfig';
import { useSession } from 'next-auth/react';

export default function BudgetForm({ budget, onSubmit, onCancel }) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    budget: budget?.budget || '',
    month_date: budget?.month_date || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    budget: '',
    month_date: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({ budget: '', month_date: '' });

    // Validate form
    const newErrors = {};
    if (!formData.budget || isNaN(formData.budget)) {
      newErrors.budget = 'Montant du budget requis';
    }
    if (!formData.month_date) {
      newErrors.month_date = 'Mois requis';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await onSubmit({
        budget: parseFloat(formData.budget),
        month_date: new Date(formData.month_date).toISOString()
      });
      
      showSuccessAlert(
         session?.user?.theme || 'light',
        budget ? 'Budget mis à jour avec succès' : 'Budget créé avec succès',
       
      );
    } catch (error) {
      showErrorAlert(
        session?.user?.theme || 'light',
        budget ? 'Échec de la mise à jour du budget' : 'Échec de la création du budget',
       
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-200 shadow-lg mb-4">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {budget ? 'Modifier le Budget' : 'Nouveau Budget'}
          </h3>
          <button onClick={onCancel} className="btn btn-ghost btn-sm">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Montant du Budget</span>
            </label>
            <input
              type="number"
              step="0.01"
              className={`input input-bordered ${errors.budget ? 'input-error' : ''}`}
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="Entrez le montant du budget"
            />
            {errors.budget && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.budget}</span>
              </label>
            )}
          </div>

                <div className="form-control">
        <label className="label">
            <span className="label-text">Mois</span>
        </label>
        <input
            type="month"
            className={`input input-bordered ${errors.month_date ? 'input-error' : ''}`}
            value={formData.month_date ? new Date(formData.month_date).toISOString().slice(0, 7) : ''}
            onChange={(e) => setFormData({ ...formData, month_date: e.target.value })}
            min={new Date().toISOString().slice(0, 7)}
            disabled={!!budget} // Disabled when editing
            required={!budget} // Required only when creating
        />
        {errors.month_date && (
            <label className="label">
            <span className="label-text-alt text-error">{errors.month_date}</span>
            </label>
        )}
        </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-ghost"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <FaSpinner className="animate-spin" />
              ) : budget ? (
                'Mettre à jour'
              ) : (
                'Créer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}