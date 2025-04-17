"use client";
import { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa"; // Import FaEye
import { getCategories } from "@/services/categories/categoryService";
import { getSuppliers } from "@/services/suppliers/supplierService";
import { showSuccessAlert, showErrorAlert } from "@/utils/swalConfig";
import { FaArrowLeft } from "react-icons/fa";
import { useSession } from "next-auth/react";

export default function ProductForm({ onActionSuccess, onGoBack }) {
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [product, setProduct] = useState({
    name: "",
    category_id: "",
    supplier_id: "",
    selling_price: "",
    stock_quantity: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true); // Set loading state

  // Fetch categories and suppliers
  useEffect(() => {
    const fetchCategoriesAndSuppliers = async () => {
      setLoading(true); // Set loading state to true
      try {
        const response = await getCategories(session?.user.accessToken);
        
        if (response.success && Array.isArray(response.categories)) {
          setCategories(response.categories);
        } else {
          console.error("Categories error:", response.message);
          setCategories([]);
          showErrorAlert(session?.user.theme, response.message || "Erreur de chargement des catégories");
        }
      } catch (error) {
        console.error("Categories fetch failed:", error);
        setCategories([]);
        showErrorAlert(session?.user.theme, "Échec du chargement des catégories");
      }
    };
  
    const loadSuppliers = async () => {
      try {
        const response = await getSuppliers("", session?.user.accessToken);
        
        if (response.success && Array.isArray(response.suppliers)) {
          setSuppliers(response.suppliers);
        } else {
          console.error("Suppliers error:", response.message);
          setSuppliers([]);
          showErrorAlert(session?.user.theme, response.message || "Erreur de chargement des fournisseurs");
        }
      } catch (error) {
        console.error("Suppliers fetch failed:", error);
        setSuppliers([]);
        showErrorAlert(session?.user.theme, "Échec du chargement des fournisseurs");
      }
    };
  
    loadCategories();
    loadSuppliers();
  }, [session]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate the form inputs
  const validateForm = () => {
    const newErrors = {};
    if (!product.name) newErrors.name = "Nom du produit est requis.";
    if (!product.category_id) newErrors.category_id = "Veuillez sélectionner une catégorie.";
    if (!product.supplier_id) newErrors.supplier_id = "Veuillez sélectionner un fournisseur.";
    if (!product.selling_price) newErrors.selling_price = "Prix de vente est requis.";
    if (!product.stock_quantity) newErrors.stock_quantity = "Quantité en stock est requise.";
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setAdding(true);
    try {
      // Assume createProduct is a function that sends product data to the server
      const response = await createProduct(product); // Replace with your actual API call
      if (response.success) {
        onActionSuccess(response.data); // Call onActionSuccess if product is created successfully
      } else {
        showErrorAlert(response.message || "Failed to create product.");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      showErrorAlert("An error occurred while creating the product.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-md">
      <button onClick={onGoBack} className="btn btn-ghost text-primary mb-4 flex items-center">
        <FaEye className="mr-2" /> Retour
      </button>

      <h2 className="text-xl font-semibold mb-4">Ajouter un nouveau produit</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            className={`input input-bordered w-full ${errors.name ? "border-red-500" : ""}`}
            placeholder="Nom du produit"
          />
        </div>

        {/* Category Selection */}
        <div>
          {errors.category_id && <p className="text-red-400 text-sm">{errors.category_id}</p>}
          <select
            name="category_id"
            value={product.category_id}
            onChange={handleChange}
            className={`select select-bordered w-full ${errors.category_id ? "border-red-500" : ""}`}
            disabled={loading}
          >
            <option value="">Sélectionner une catégorie</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        {/* Supplier Selection */}
        <div>
          {errors.supplier_id && <p className="text-red-400 text-sm">{errors.supplier_id}</p>}
          <select
            name="supplier_id"
            value={product.supplier_id}
            onChange={handleChange}
            className={`select select-bordered w-full ${errors.supplier_id ? "border-red-500" : ""}`}
            disabled={loading}
          >
            <option value="">Sélectionner un fournisseur</option>
            {suppliers?.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
            ))}
          </select>
        </div>

        {/* Selling Price */}
        <div>
          {errors.selling_price && <p className="text-red-400 text-sm">{errors.selling_price}</p>}
          <input
            type="number"
            name="selling_price"
            value={product.selling_price}
            onChange={handleChange}
            className={`input input-bordered w-full ${errors.selling_price ? "border-red-500" : ""}`}
            placeholder="Prix de vente"
          />
        </div>

        {/* Stock Quantity */}
        <div>
          {errors.stock_quantity && <p className="text-red-400 text-sm">{errors.stock_quantity}</p>}
          <input
            type="number"
            name="stock_quantity"
            value={product.stock_quantity}
            onChange={handleChange}
            className={`input input-bordered w-full ${errors.stock_quantity ? "border-red-500" : ""}`}
            placeholder="Quantité en stock"
          />
        </div>

        {/* Description */}
        <div>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            className="textarea textarea-bordered w-full"
            placeholder="Notes additionnelles (facultatif)"
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary w-full" disabled={adding}>
          {adding ? "Ajouter... " : "Ajouter un produit "}
        </button>
      </form>
    </div>
  );
}