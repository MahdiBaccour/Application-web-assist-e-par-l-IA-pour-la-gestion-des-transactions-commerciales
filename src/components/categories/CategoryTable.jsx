'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaPlus,
  FaSpinner,
  FaToggleOn,
  FaToggleOff,
} from 'react-icons/fa';
import { getCategories, updateCategoryStatus } from '@/services/categories/categoryService';
import {
  showConfirmationDialog,
  showSuccessAlert,
  showErrorAlert,
} from '@/utils/swalConfig';
import CategoryCard from './CategoryCard';
import CategoryForm from './CategoryForm';
import UpdateCategoryForm from './UpdateCategoryForm';
import { useSession } from 'next-auth/react';

export default function CategoriesTable() {
  const { data: session } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isLoadingDelete, setIsLoadingDelete] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 5;

  useEffect(() => {
    if (session?.user.role !== 'owner' && session?.user.role !== 'employee') {
      router.push('/forbidden');
    }
  }, [session, router]);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const response = await getCategories(session?.user.accessToken);
        if (response.success) {
          setCategories(response.categories);
          setError(null);
        } else {
          setError(response.message);
        }
      } catch (error) {
        setError('Échec de la récupération des catégories.');
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, [session]);

  const handleEdit = (id) => {
    setIsAddingNewCategory(false);
    setSelectedCategoryId(id);
  };

  const handleDelete = async (id) => {
    const result = await showConfirmationDialog({
      title: 'Supprimer la catégorie ?',
      text: 'Cette action est irréversible.',
      confirmText: 'Oui, supprimer',
    });

    if (result.isConfirmed) {
      setIsLoadingDelete(id);
      try {
        const response = await deleteCategory(id, session?.user.accessToken);
        if (response.success) {
          setCategories((prev) => prev.filter((category) => category.id !== id));
          showSuccessAlert(session?.user.theme, 'Catégorie supprimée avec succès.');
        } else {
          showErrorAlert(session?.user.theme, response.message);
        }
      } catch (error) {
        showErrorAlert(session?.user.theme, 'Échec de la suppression de la catégorie.');
      } finally {
        setIsLoadingDelete(null);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const result = await showConfirmationDialog(session?.user.theme, {
      title: `Changer le statut à ${newStatus}?`,
      text: 'Vous pouvez changer cela plus tard.',
      confirmText: `Oui, définir ${newStatus}`,
    });

    if (result.isConfirmed) {
      setIsLoadingDelete(id);
      try {
        const success = await updateCategoryStatus(id, newStatus, session?.user.accessToken);
        if (success) {
          setCategories((prev) =>
            prev.map((category) =>
              category.id === id ? { ...category, status: newStatus } : category
            )
          );
          showSuccessAlert(session?.user.theme, `Le statut est défini sur ${newStatus}`);
        } else {
          showErrorAlert(session?.user.theme, 'Échec de la mise à jour du statut.');
        }
      } catch (error) {
        showErrorAlert(session?.user.theme, 'Erreur lors de la mise à jour du statut.');
      } finally {
        setIsLoadingDelete(null);
      }
    }
  };

  const handleGoBack = () => {
    setIsAddingNewCategory(false);
    setSelectedCategoryId(null);
  };

  const handleNewCategory = (newCategory) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === newCategory.id);
      return exists ? prev : [...prev, newCategory];
    });
    setIsAddingNewCategory(false);
  };

  const handleCategoryUpdate = (updatedCategory) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === updatedCategory.id ? updatedCategory : category
      )
    );
    setSelectedCategoryId(null);
  };

  const filteredCategories = categories.filter((cat) =>
    filterStatus === "all" ? true : cat.status === filterStatus
  );

  const indexOfLast = currentPage * categoriesPerPage;
  const indexOfFirst = indexOfLast - categoriesPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-primary mb-4" />
        <p className="text-gray-500">Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error mt-4">
        <span>Erreur: {error}</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {isAddingNewCategory ? (
        <CategoryForm onActionSuccess={handleNewCategory} onGoBack={handleGoBack} />
      ) : selectedCategoryId ? (
        <UpdateCategoryForm
          categoryId={selectedCategoryId}
          onUpdateSuccess={handleCategoryUpdate}
          onGoBack={handleGoBack}
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setIsAddingNewCategory(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <FaPlus /> Ajouter une catégorie
            </button>
            <button
              onClick={() => setFilterStatus("all")}
              className={`btn ${filterStatus === "all" ? "btn-info" : "btn-outline"}`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`btn ${filterStatus === "active" ? "btn-success" : "btn-outline"}`}
            >
              Actives
            </button>
            <button
              onClick={() => setFilterStatus("inactive")}
              className={`btn ${filterStatus === "inactive" ? "btn-error" : "btn-outline"}`}
            >
              Inactives
            </button>
          </div>

          <table className="table w-full table-zebra">
            <thead>
              <tr className="bg-base-300 text-base-content">
                <th>Nom</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCategories.length > 0 ? (
                currentCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    isLoadingDelete={isLoadingDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">
                    Aucune catégorie disponible
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-center mt-4">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="btn btn-sm"
            >
              Première
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-sm mx-2"
            >
              Précédent
            </button>
            <span className="text-center mx-2">
              Page {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn btn-sm mx-2"
            >
              Suivant
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="btn btn-sm"
            >
              Dernière
            </button>
          </div>
        </>
      )}
    </div>
  );
}
