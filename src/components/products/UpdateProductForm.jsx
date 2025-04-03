"use client";

import { useEffect, useState } from "react";
import { getProductById, updateProduct } from "@/services/products/productService";
import { showSuccessAlert, showErrorAlert } from "@/utils/swalConfig";
import { ImSpinner2 } from "react-icons/im";
import { FaArrowLeft } from "react-icons/fa";


export default function UpdateProductForm({ productId, onUpdateSuccess, onGoBack }) {
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
        const data = await getProductById(productId);
        if (!data) throw new Error("Product not found");
        setProduct(data.product);
      } catch (error) {
        showErrorAlert("Failed to fetch product data!");
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
     // const existingProduct = await getProductByName(product.name);
      // if (existingProduct && existingProduct.id !== productId) {
      //   showErrorAlert("Product name already exists!");
      //   setUpdating(false);
      //   return;
      // }
 
      const updatedProduct = await updateProduct(productId, product);
      if (!updatedProduct) throw new Error("Failed to update product");

      showSuccessAlert("Product updated successfully!");
      onUpdateSuccess({ ...product, id: productId });
    } catch (error) {
      showErrorAlert("Failed to update product");
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
        <FaArrowLeft className="mr-2" /> Back
      </button>

      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Update Product</h2>

        {/* Name */}
        <label className="block text-sm font-medium">Product Name</label>
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
        <label className="block text-sm font-medium">Selling Price ($)</label>
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
        <label className="block text-sm font-medium">Stock Quantity</label>
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
        <label className="block text-sm font-medium">Category</label>
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
        <label className="block text-sm font-medium">Description (Optional)</label>
        <textarea
          name="description"
          value={product.description}
          onChange={handleChange}
          className="textarea textarea-bordered w-full"
          placeholder="Product Description"
        />

        <button type="submit" className="btn btn-primary w-full" disabled={updating}>
          {updating ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
}