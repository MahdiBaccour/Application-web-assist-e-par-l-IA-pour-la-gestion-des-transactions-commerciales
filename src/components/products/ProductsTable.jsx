"use client";
import { useEffect, useState } from "react";
import { useRouter,usePathname } from "next/navigation";
import {
  getProducts,
  updateProductStatus,
} from "@/services/products/productService";
import { getCategories } from "@/services/categories/categoryService";
import {
  showConfirmationDialog,
  showSuccessAlert,
  showErrorAlert,
} from "@/utils/swalConfig";
import {
  FaList,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
} from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { FaPlus } from "react-icons/fa";
import ProductCard from "./ProductCard";
import ProductForm from "./ProductForm";
import UpdateProductForm from "./UpdateProductForm";
import { useSession } from 'next-auth/react';
export default function ProductsTable() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname(); // Get the current route
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error,setError]=useState(null);
  const productsPerPage = 5;


  useEffect(() => {
    if ( session?.user.role !== "owner"  && session?.user.role !== "employee") {
      router.push("/forbidden");
    }
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await getProducts(selectedCategory, selectedStatus,session?.user.accessToken);
        if (response.success) {
          setProducts(response.products);
        } else {
          // Handle the error case if the response is not successful
          setError( response.message);
        }
      } catch (error) {
        setError(response.message);
      }
      setLoading(false);
    };
  
    loadProducts();
  }, [selectedCategory, selectedStatus,session?.user.accessToken]);
  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories(session.user.accessToken);
        if (response.success) {
          setCategories(response.categories);
        } else {
          // Handle the error case if the response is not successful
          setError(response.message);
        
        }
      } catch (error) {
        setError(response.message);
      }
    };
  
    loadCategories();
  }, [session?.user.accessToken]);

  const handleEdit = (id) => {
    setIsAddingNewProduct(false);  
    setSelectedProductId(id);      
  };

  const handleViewDetails = (id) => {
    router.push(`${pathname}/${id}`);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const result = await showConfirmationDialog({
      title: `Régler le statut sur ${newStatus}?`,
      text: "Vous pouvez toujours modifier cela plus tard.",
      confirmText: `Oui, réglé sur ${newStatus}`,
    });

    if (result.isConfirmed) {
      setIsLoadingStatus(id);
      try {
        const success = await updateProductStatus(id, newStatus,session.user.accessToken);
        if (success) {
          setProducts((prevProducts) =>
            prevProducts
              .map((product) =>
                product.id === id ? { ...product, status: newStatus } : product
              )
              .filter((product) =>
                selectedStatus === "all" ? true : product.status === selectedStatus
              )
          );
          showSuccessAlert(session.user.theme,`Statut réglé sur ${newStatus}`);
        } else {
          showErrorAlert(session.user.theme,"Échec de la mise à jour de l'état.");
        }
      } catch (error) {
        showErrorAlert(session.user.theme,"Échec de la mise à jour de l'état.");
      } finally {
        setIsLoadingStatus(null);
      }
    }
  };

  const handleGoBack = () => {
    setIsAddingNewProduct(false);
    setSelectedProductId(null);
  };

  const handleNewProduct = (newProduct) => {
    console.log("New product received:", newProduct);
    if (!newProduct?.id) {
      console.error("New product missing ID:", newProduct);
      return;
    }
  
    setProducts((prev) => {
      const exists = prev.some(p => p.id === newProduct.id);
      return exists ? prev : [...prev, newProduct];
    });
  
    setIsAddingNewProduct(false);
  };

  const handleProductUpdate = (updatedProduct) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
    setSelectedProductId(null);
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64">
      <FaSpinner className="animate-spin text-4xl text-primary mb-4" />
      <p className="text-gray-500">Chargement des données...</p>
    </div>
    );

  if (error) {
    return (
      <div className="alert alert-error mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span> Erreur dans la recherche des produits : {error}</span>
      </div>
    );}

  return (
    <div className="overflow-x-auto">
      {isAddingNewProduct ? (
        <ProductForm onActionSuccess={handleNewProduct} onGoBack={handleGoBack} />
      ) : selectedProductId ? (
        <UpdateProductForm
          productId={selectedProductId}
          onGoBack={handleGoBack}
          onUpdateSuccess={handleProductUpdate}
        />
      ) : (
        <>
          {/* First Row: Add Product + Status Filters */}
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setIsAddingNewProduct(true)} className="btn btn-primary flex items-center gap-2">
              <FaPlus /> Add Product
            </button>
            <div className="flex gap-2">
                  <button
                onClick={() => setSelectedStatus("all")}
                className={`btn flex items-center justify-center gap-2 w-28 ${
                  selectedStatus === "all" ? "btn-info" : "btn-outline"
                }`}
              >
                <FaList size={18} /> Tous
              </button>
              <button onClick={() => setSelectedStatus("active")} className={`btn ${selectedStatus === "active" ? "btn-success" : "btn-outline"}`}>
               <FaCheckCircle/>  Actif
              </button>
              <button onClick={() => setSelectedStatus("inactive")} className={`btn ${selectedStatus === "inactive" ? "btn-error" : "btn-outline"}`}>
              <FaTimesCircle/>   Inactif
              </button>
            </div>
          </div>

          {/* Second Row: Category Filter */}
          <div className="flex justify-end mb-4">
            <select className="select select-bordered select-sm" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">Toutes les catégories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Table */}
          <table className="table w-full table-zebra">
            <thead>
              <tr className="bg-base-300 text-base-content">
              <th>Nom</th>
                <th>Catégorie</th>
                <th>Prix de vente</th>
                <th>Stock</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <ProductCard
                  key={product.id} 
                    product={product}
                    onEdit={handleEdit}
                    onViewDetails={handleViewDetails}
                    onToggleStatus={handleToggleStatus}
                    isLoadingStatus={isLoadingStatus}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                  Pas de produits disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center mt-4">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="btn btn-sm">
            Première
            </button>
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="btn btn-sm mx-2">
            Précédent
            </button>
            <span className="text-center mx-2">
              Page {currentPage} de {totalPages}
            </span>
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="btn btn-sm mx-2">
            Suivant
            </button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="btn btn-sm">
            Dernière
            </button>
          </div>
        </>
      )}
    </div>
  );
}