"use client";

import { useEffect, useState } from "react";
import { getProductById, updateProduct } from "@/services/products/productService";
import { showSuccessAlert, showErrorAlert } from "@/utils/swalConfig";
import { ImSpinner2 } from "react-icons/im";
import { FaArrowLeft } from "react-icons/fa";
import { useSession } from "next-auth/react";

export default function UpdateProductForm({ productId, onUpdateSuccess, onGoBack }) {
  const { data: session } = useSession();
  const [product, setProduct] = useState({
    name: "",
    selling_price: "",
    stock_quantity: "",
    category_id: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(productId,session.user.accessToken);
        if (!data) throw new Error("Produit non trouvé");
        setProduct(data.product);
      } catch (error) {
        showErrorAlert(session.user.theme,"Échec de l'extraction des données sur les produits !");
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
     // Check if product name already exists (excluding the current product)
    //  const existingProduct = await getProductByName(product.name);
    //   if (existingProduct && existingProduct.id !== productId) {
    //     showErrorAlert("Product name already exists!");
    //     setUpdating(false);
    //     return;
    //   }
 
      const updatedProduct = await updateProduct(productId, product,session.user.accessToken);
      if (!updatedProduct) throw new Error("Échec de la mise à jour du produit");

      showSuccessAlert(session.user.theme,"Produit mis à jour avec succès !");
      onUpdateSuccess({ ...product, id: productId });
    } catch (error) {
      showErrorAlert(session.user.theme,"Échec de la mise à jour du produit");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center mt-10">
        <ImSpinner2 className="animate-spin text-4xl text-primary" />
      </div>
    );

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onGoBack}
        className="btn btn-ghost text-primary mb-4 flex items-center"
        disabled={loading}
      >
        <FaArrowLeft className="mr-2" /> Retour
      </button>

      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Mise à jour du produit</h2>

        {/* Name */}
        <label className="block text-sm font-medium">Nom du produit</label>
        <input
          type="text"
          name="name"
          value={product.name}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="Product Name"
        />

        {/* Selling Price */}
        <label className="block text-sm font-medium">Prix de vente (DT)</label>
        <input
          type="number"
          name="selling_price"
          value={product.selling_price}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="Selling Price"
        />

        {/* Stock Quantity */}
        <label className="block text-sm font-medium">Quantité en stock</label>
        <input
          type="number"
          name="stock_quantity"
          value={product.stock_quantity}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="Stock Quantity"
        />

        {/* Category */}
        <label className="block text-sm font-medium">Catégorie</label>
        <input
          type="text"
          name="category_id"
          value={product.category_id}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
          placeholder="Category ID"
        />

        {/* Description */}
        <label className="block text-sm font-medium">Description (facultatif)</label>
        <textarea
          name="description"
          value={product.description}
          onChange={handleChange}
          className="textarea textarea-bordered w-full"
          placeholder="Product Description"
        />

        <button type="submit" className="btn btn-primary w-full" disabled={updating}>
          {updating ? "Mise à jour..." : "Mise à jour du produit"}
        </button>
      </form>
    </div>
  );
}