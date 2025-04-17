"use client";
import { useState, useEffect } from "react";
import { createProduct } from "@/services/products/productService";
import { getCategories } from "@/services/categories/categoryService";
import { getSuppliers } from "@/services/suppliers/supplierService";
import { showSuccessAlert, showErrorAlert } from "@/utils/swalConfig";
import { FaArrowLeft } from "react-icons/fa";
import { useSession } from "next-auth/react";

export default function ProductForm({ onActionSuccess, onGoBack }) {
  const {data:session}=useSession();
  const [product, setProduct] = useState({
    name: "",
    category_id: "",
    supplier_id: "",
    selling_price: "",
    stock_quantity: "",
    description: "",
  });

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState({}); // Store form validation errors

  useEffect(() => {
    const loadCategories = async () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));

    // Clear the error when the user starts typing again
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate Form Inputs
  const validateForm = () => {
    let newErrors = {};
    if (!product.name.trim()) newErrors.name = "Le nom du produit est obligatoire.";
    if (!product.category_id) newErrors.category_id = "Veuillez sélectionner une catégorie.";
    if (!product.supplier_id) newErrors.supplier_id = "Veuillez sélectionner un fournisseur.";
    if (!product.selling_price || product.selling_price <= 0)
      newErrors.selling_price = "Le prix de vente doit être supérieur à 0.";
    if (!product.stock_quantity || product.stock_quantity < 0)
      newErrors.stock_quantity = "La quantité en stock ne peut pas être négative.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Stop if validation fails

    setAdding(true);
    try {
      const newProduct = await createProduct(product,session.user.accessToken);
      if (!newProduct) throw new Error("Failed to add product");

      showSuccessAlert(session.user.theme,"Produit ajouté avec succès !");
      onActionSuccess(newProduct.product);
    } catch (error) {
      showErrorAlert(session.user.theme,"Échec de l'ajout de produit");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-md">
      <button onClick={onGoBack} className="btn btn-ghost text-primary mb-4 flex items-center">
        <FaArrowLeft className="mr-2" /> Retour
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
            className={`input input-bordered w-full  ${errors.name ? "border-red-500" : ""}`}
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
            className={`select select-bordered w-full  ${errors.supplier_id ? "border-red-500" : ""}`}
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
            className={`input input-bordered w-full  ${errors.selling_price ? "border-red-500" : ""}`}
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
            className="textarea textarea-bordered w-full "
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