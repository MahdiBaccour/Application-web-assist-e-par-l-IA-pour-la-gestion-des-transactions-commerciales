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
import { JSDocParsingMode } from "typescript";

export default function ProductDetails() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname.split("/").pop();
  const [product, setProduct] = useState(null);
  const [historicalCosts, setHistoricalCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistorical, setLoadingHistorical] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if ( session?.user.role !== "owner" && session?.user.role !== "employee") {
      router.push("/forbidden");
    }
  }, [ session, router]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id, session?.user.accessToken);
       if(!data.success) setError(data.message);
       else setProduct(data.product);
       
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    };

    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    const loadHistoricalCosts = async () => {
      try {
        const data = await getHistoricalCosts(id, session?.user.accessToken);
        if (!data.success) {
          setError(data.message);
        } else {
          console.log("Historical Costs Data:", data); // Debugging
          setHistoricalCosts(data.historicalCosts);
        }
      } catch (error) {
        setError(error.message);
      }
      setLoadingHistorical(false);
    };
  
    if (id) loadHistoricalCosts();
  }, [id]);

  if (error) {
    return (
      <div className="alert alert-error mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Erreur: {error}</span>
      </div>
    );
  }

  if (loading)
    return (
      <div className="flex justify-center items-center mt-10">
        <ImSpinner2 className="animate-spin text-4xl text-primary" />
      </div>
    );

  if (!product) return <p className="text-center text-red-500">Produit non trouvé</p>;

  return (
    <div className="overflow-x-auto">
      <button onClick={() => router.back()} className="btn btn-ghost mb-4 flex items-center text-white">
        <FaArrowLeft className="mr-2" /> Back
      </button>

      <h2 className="text-3xl font-semibold mb-6">Détails du produit</h2>

      <div className="grid grid-cols-2 gap-6 text-lg">
        <p className="flex items-center gap-2"><FaTags className="text-blue-400" /> <strong>Nom:</strong> {product.name}</p>
        <p className="flex items-center gap-2"><MdCategory className="text-yellow-400" /> <strong>Catégorie:</strong> {product.category_name}</p>
        <p className="flex items-center gap-2"><FaWarehouse className="text-green-400" /> <strong>Supplier:</strong> {product.supplier_name}</p>
        <p className="flex items-center gap-2"><FaDollarSign className="text-orange-400" /> <strong>Prix:</strong> ${product.selling_price}</p>
        <p className="flex items-center gap-2"><MdInventory2 className="text-purple-400" /> <strong>Stock:</strong> {product.stock_quantity}</p>
        <p className="flex items-center gap-2"><FaCalendarAlt className="text-pink-400" /> <strong>Créé à:</strong> {new Date(product.created_at).toLocaleDateString()}</p>
      </div>

      <div className="mt-6">
        <p className="flex items-center gap-3">
          <strong>Statut:</strong>
          <span className={`px-3 py-1 text-sm font-semibold rounded ${product.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
            {product.status}
          </span>
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3 text-blue-400">Coût historique des prix</h3>
        {loadingHistorical ? (
  <div className="flex justify-center items-center mt-4">
    <ImSpinner2 className="animate-spin text-2xl text-primary" />
  </div>
) : Array.isArray(historicalCosts) && historicalCosts.length > 0 ? (
  <table className="table w-full rounded-lg overflow-hidden">
    <thead>
      <tr>
        <th className="p-3">Date</th>
        <th className="p-3">Coût historique des prix</th>
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
  <p className="text-gray-500">Aucun prix de revient historique n'est disponible.</p>
)}
      </div>
    </div>
  );
}
