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
  const productsPerPage = 5;


  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts(selectedCategory, selectedStatus,session.user.accessToken);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      setLoading(false);
    };

    loadProducts();
  }, [selectedCategory, selectedStatus]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories(session.user.accessToken);
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    loadCategories();
  }, []);

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
      title: `Set status to ${newStatus}?`,
      text: "You can always change this later.",
      confirmText: `Yes, set to ${newStatus}`,
    });

    if (result.isConfirmed) {
      setIsLoadingStatus(id);
      try {
        const success = await updateProductStatus(id, newStatus);
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
          showSuccessAlert(`Status set to ${newStatus}`);
        } else {
          showErrorAlert("Failed to update status.");
        }
      } catch (error) {
        showErrorAlert("Failed to update status.");
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
    // Ensure the product has an ID before adding to state
    if (!newProduct?.id) {
      console.error("New product missing ID:", newProduct);
      return;
    }
    
    setProducts((prevProducts) => {
      // Check if the product already exists in the state
      const exists = prevProducts.some(p => p.id === newProduct.id);
      return exists ? prevProducts : [...prevProducts, newProduct];
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
      <div className="flex justify-center items-center mt-10">
        <ImSpinner2 className="animate-spin text-4xl text-primary" />
      </div>
    );

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
                <FaList size={18} /> All
              </button>
              <button onClick={() => setSelectedStatus("active")} className={`btn ${selectedStatus === "active" ? "btn-success" : "btn-outline"}`}>
               <FaCheckCircle/>  Active
              </button>
              <button onClick={() => setSelectedStatus("inactive")} className={`btn ${selectedStatus === "inactive" ? "btn-error" : "btn-outline"}`}>
              <FaTimesCircle/>   Inactive
              </button>
            </div>
          </div>

          {/* Second Row: Category Filter */}
          <div className="flex justify-end mb-4">
            <select className="select select-bordered select-sm" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((category) => (
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
                <th>Name</th>
                <th>Category</th>
                <th>Selling Price</th>
                <th>Stock</th>
                <th>Status</th>
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
                    No products available
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center mt-4">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="btn btn-sm">
              First
            </button>
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="btn btn-sm mx-2">
              Previous
            </button>
            <span className="text-center mx-2">
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="btn btn-sm mx-2">
              Next
            </button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="btn btn-sm">
              Last
            </button>
          </div>
        </>
      )}
    </div>
  );
}