"use client";
import { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa"; // Import FaEye
import { getCategories } from "@/services/categories/categoryService";
import { getSuppliers } from "@/services/suppliers/supplierService";
import { createProduct } from "@/services/products/productService";
import { showSuccessAlert,showErrorAlert } from "@/utils/swalConfig";
import { useSession } from "next-auth/react";
export default function ProductForm({ onActionSuccess, onGoBack }) {
  const { data: session } = useSession();
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
        const categoriesResponse = await getCategories(session?.user.accessToken);
        const suppliersResponse = await getSuppliers("",session?.user.accessToken);

        // Log the responses to check the data
        console.log("Categories:", categoriesResponse);
        console.log("Suppliers:", suppliersResponse);

        // Ensure you are getting the correct data structure
        setCategories(categoriesResponse?.categories || []);
        setSuppliers(suppliersResponse?.suppliers || []);
      } catch (error) {
        console.error("Error loading categories or suppliers:", error);
        showErrorAlert("Failed to load categories or suppliers.");
      } finally {
        setLoading(false); // Set loading state to false once data is loaded
      }
    };

    fetchCategoriesAndSuppliers();
  }, []);

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
      const response = await createProduct(product, session?.user.accessToken);
    
      if (response.success) {
        showSuccessAlert(session?.user.theme,"Produit créé avec succès.");
        onActionSuccess(response.product); // ✅ Use `response.product`
      } else {
        showErrorAlert(session?.user.theme,response.message || "Échec de la création du produit.");
      }
    } catch (error) {
      console.error("Erreur lors de la création du produit:", error);
      showErrorAlert(session?.user.theme,"Une erreur s'est produite lors de la création du produit.");
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
            <option value="">
              {loading ? "Loading categories..." : "Select a category"}
            </option>
            {categories.length > 0 ? (
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No categories available
              </option>
            )}
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
            <option value="">
              {loading ? "Loading suppliers..." : "Select a supplier"}
            </option>
            {suppliers.length > 0 ? (
              suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No suppliers available
              </option>
            )}
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
  );0
}
