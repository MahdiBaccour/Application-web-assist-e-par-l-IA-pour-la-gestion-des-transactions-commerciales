"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getProductById } from "@/services/products/productService";
import { getHistoricalCosts } from "@/services/transactionProducts/transactionProductsService";
import { ImSpinner2 } from "react-icons/im";
import { 
  FaArrowLeft, 
  FaTags, 
  FaBox, 
  FaWarehouse, 
  FaCalendarAlt, 
  FaDollarSign 
} from "react-icons/fa";
import { MdCategory, MdInventory2 } from "react-icons/md";
import { useSession } from 'next-auth/react';

export default function ProductDetails() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname.split("/").pop();
  const [product, setProduct] = useState(null);
  const [historicalCosts, setHistoricalCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistorical, setLoadingHistorical] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id,session.user.accessToken);
        if (!data) throw new Error("Product not found");
        setProduct(data.product);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
      setLoading(false);
    };

    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    const loadHistoricalCosts = async () => {
      const data = await getHistoricalCosts(id,session.user.accessToken);
      if (data && data.success) {
        setHistoricalCosts(data.historical_costs);
      }
      setLoadingHistorical(false);
    };

    if (id) loadHistoricalCosts();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center mt-10">
        <ImSpinner2 className="animate-spin text-4xl text-primary" />
      </div>
    );

  if (!product) return <p className="text-center text-red-500">Product not found</p>;

  return (
    <div className="overflow-x-auto">
      {/* Back Button */}
      <button 
        onClick={() => router.back()} 
        className="btn btn-ghost mb-4 flex items-center text-white"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>

      {/* Header */}
      <h2 className="text-3xl font-semibold mb-6 text-blue-400">Product Details</h2>

      {/* Product Details */}
      <div className="grid grid-cols-2 gap-6 text-lg">
        <p className="flex items-center gap-2"><FaTags className="text-blue-400" /> <strong>Name:</strong> {product.name}</p>
        <p className="flex items-center gap-2"><MdCategory className="text-yellow-400" /> <strong>Category:</strong> {product.category_name}</p>
        <p className="flex items-center gap-2"><FaWarehouse className="text-green-400" /> <strong>Supplier:</strong> {product.supplier_name}</p>
        <p className="flex items-center gap-2"><FaDollarSign className="text-orange-400" /> <strong>Price:</strong> ${product.selling_price}</p>
        <p className="flex items-center gap-2"><MdInventory2 className="text-purple-400" /> <strong>Stock:</strong> {product.stock_quantity}</p>
        <p className="flex items-center gap-2"><FaCalendarAlt className="text-pink-400" /> <strong>Created At:</strong> {new Date(product.created_at).toLocaleDateString()}</p>
      </div>

      {/* Status Badge */}
      <div className="mt-6">
        <p className="flex items-center gap-3">
          <strong>Status:</strong>
          <span className={`px-3 py-1 text-sm font-semibold rounded ${product.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
            {product.status}
          </span>
        </p>
      </div>

      {/* Historical Cost Prices */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3 text-blue-400">Historical Cost Prices</h3>
        {loadingHistorical ? (
          <div className="flex justify-center items-center mt-4">
            <ImSpinner2 className="animate-spin text-2xl text-primary" />
          </div>
        ) : historicalCosts.length > 0 ? (
          <table className="table w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-700 text-gray-200">
                <th className="p-3">Date</th>
                <th className="p-3">Historical Cost Price</th>
              </tr>
            </thead>
            <tbody>
              {historicalCosts.map((cost, index) => (
                <tr key={index} className="border-t border-gray-600">
                  <td className="p-3">{new Date(cost.date).toLocaleDateString()}</td>
                  <td className="p-3 text-green-400 font-bold">${cost.historical_cost_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No historical cost prices available.</p>
        )}
      </div>
    </div>
  );
}