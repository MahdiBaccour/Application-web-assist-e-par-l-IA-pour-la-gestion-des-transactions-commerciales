'use client';
import { useEffect, useState } from 'react';
import { FaEdit, FaMoneyCheckAlt, FaExclamationCircle } from 'react-icons/fa';
import BudgetForm from './BudgetForm';
import { showConfirmationDialog } from '@/utils/swalConfig';
import { FaSpinner } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { getBudgets, createBudget, updateBudget } from '@/services/total_budget/budgetService';

// BudgetTable Component
export default function BudgetTable() {
  const { data: session } = useSession();
  const [budgets, setBudgets] = useState([]);
  const [filteredBudgets, setFilteredBudgets] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [currentMonthStatus, setCurrentMonthStatus] = useState({});

  useEffect(() => {
    const loadBudgets = async () => {
      setLoading(true);
      try {
        const { success, message, budgets } = await getBudgets(session?.user.accessToken);
        if (!success) {
          setError(message);
        } else {
          setBudgets(budgets);
          updateFilteredBudgets(budgets, selectedDate); // Remove the automatic date selection
          checkBudgetStatus(budgets);
        }
      } catch (error) {
        setError("Erreur de chargement des budgets");
      }
      setLoading(false);
    };

    loadBudgets();
  }, [session]);


      const updateFilteredBudgets = (budgets, date) => {

      if (!date) {
        setFilteredBudgets(budgets);
        return;
      }

      const [year, month] = date.split('-');
      const filtered = budgets.filter(b => {
        try {
          const budgetDate = new Date(b.month_date);
          return budgetDate.getUTCFullYear() === Number(year) && 
                budgetDate.getUTCMonth() === Number(month) - 1;
        } catch (e) {
          console.error('Invalid date format:', b.month_date);
          return false;
        }
      });
      setFilteredBudgets(filtered);
    };

  const checkBudgetStatus = (budgets) => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    const currentBudget = budgets.find(b => 
      new Date(b.month_date).getTime() === currentMonth.getTime()
    );

    const needsNextMonthBudget = 
      (nextMonth - now) < 7 * 24 * 60 * 60 * 1000 &&
      !budgets.some(b => new Date(b.month_date).getTime() === nextMonth.getTime());

    setCurrentMonthStatus({
      current: !!currentBudget,
      nextMonth: needsNextMonthBudget,
    });
  };

  const handleFormSubmit = async (formData) => {
    const apiCall = selectedBudget ? 
      updateBudget(selectedBudget.id, formData, session.user.accessToken) :
      createBudget(formData, session.user.accessToken);

    const { success, message, budget } = await apiCall;

    if (success) {
      const updatedBudgets = selectedBudget ? 
        budgets.map(b => b.id === budget.id ? budget : b) :
        [...budgets, budget];
      
      setBudgets(updatedBudgets);
      updateFilteredBudgets(updatedBudgets, selectedDate);
      setIsEditing(false);
      setSelectedBudget(null);
      checkBudgetStatus(updatedBudgets);
    } else {
      setError(message);
    }
  };

  const handleDateFilterChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    updateFilteredBudgets(budgets, date);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <FaSpinner className="animate-spin text-4xl text-primary mb-4" />
      <p className="text-gray-500">Chargement des budgets...</p>
    </div>
  );

  return (
    <div className="overflow-x-auto p-4">
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <input
              type="month"
              value={selectedDate}
              onChange={handleDateFilterChange}
              className="input input-bordered"
              required
            />
            
            <button
              onClick={() => {
                setSelectedBudget(null);
                setIsEditing(true);
              }}
              className="btn btn-primary"
            >
              <FaMoneyCheckAlt className="mr-2" />
              {currentMonthStatus.current ? 'Mettre à jour le budget' : 'Définir le budget'}
            </button>
          </div>

          <div className="space-y-2">
            {!currentMonthStatus.current && (
              <div className="alert alert-error">
                <FaExclamationCircle className="mr-2" />
                Le budget du mois en cours n'est pas défini!
              </div>
            )}

            {currentMonthStatus.nextMonth && (
              <div className="alert alert-warning">
                <FaExclamationCircle className="mr-2" />
                Le budget du mois prochain doit être défini!
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <BudgetForm
          budget={selectedBudget}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsEditing(false);
            setSelectedBudget(null);
          }}
        />
      )}

      <table className="table w-full">
        <thead>
          <tr className="bg-base-200">
            <th>Mois</th>
            <th>Budget</th>
            <th>Revenus Bruts</th>
            <th>Dépenses</th>
            <th>Solde Net</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBudgets.map(budget => {
            const monthDate = new Date(budget.month_date);
            const isCurrentMonth = new Date().getMonth() === monthDate.getMonth();
            
            return (
              <tr 
                key={budget.id}
                className={isCurrentMonth && !budget.budget ? 'bg-error/20' : ''}
              >
                    <td>
        {new Date(budget.month_date).toLocaleDateString('fr-FR', { 
          month: 'long', 
          year: 'numeric',
          timeZone: 'UTC'
        })}
      </td>
                <td>
                  {budget.budget ? 
                    new Intl.NumberFormat('fr-FR', { 
                      style: 'currency', 
                      currency: 'TND' 
                    }).format(budget.budget) : 
                    'Non défini'
                  }
                </td>
                <td>{Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(budget.total_income_brut)}</td>
                <td>{Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(budget.total_expenses)}</td>
                <td>{Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(budget.net_balance)}</td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedBudget(budget);
                      setIsEditing(true);
                    }}
                    className="btn btn-ghost btn-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaEdit />
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
          {filteredBudgets.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center py-4">
                Aucun budget trouvé pour cette période
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}