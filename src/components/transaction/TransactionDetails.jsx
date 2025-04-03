"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getTransactionById } from "@/services/transactions/transactionService";
import { getTransactionProducts } from "@/services/transactionProducts/transactionProductsService";
import { ImSpinner2 } from "react-icons/im";
import { 
  FaArrowLeft, 
  FaMoneyCheckAlt, 
  FaHashtag, 
  FaCalendarAlt, 
  FaCreditCard, 
  FaDollarSign, 
  FaShoppingCart,
  FaWarehouse
} from "react-icons/fa";
import { useSession } from 'next-auth/react';

export default function TransactionDetails() {
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname.split("/").pop();
  const [transaction, setTransaction] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
const { data: session } = useSession();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const data = await getTransactionById(id,session.user.accessToken);
        if (!data) throw new Error("Transaction not found");
        setTransaction(data.transaction);

        const productData = await getTransactionProducts(id,session.user.accessToken);
        setProducts(productData.transactionProducts || []);
      } catch (error) {
        console.error("Error fetching transaction:", error);
      }
      setLoading(false);
    };

    if (id) fetchTransaction();
  }, [id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-500 text-white";
      case "pending":
        return "bg-yellow-400 text-black";
      case "overdue":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center mt-10">
        <ImSpinner2 className="animate-spin text-4xl text-primary" />
      </div>
    );

  if (!transaction) return <p className="text-center text-red-500">Transaction not found</p>;

  return (
    <div className="overflow-x-auto">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="btn btn-ghost text-primary mb-4 flex items-center"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>

      {/* Header */}
      <h2 className="text-3xl font-semibold mb-6 text-blue-400 text-center">Transaction Details</h2>

      {/* Transaction Details */}
      <div className="grid grid-cols-2 gap-6 text-lg">
        <div className="flex items-center gap-3">
          <FaHashtag className="text-blue-400" />
          <p><strong>Reference:</strong> {transaction.reference_number}</p>
        </div>

        <div className="flex items-center gap-3">
          <FaCalendarAlt className="text-yellow-400" />
          <p><strong>Date:</strong> {new Date(transaction.date).toLocaleDateString()}</p>
        </div>

        <div className="flex items-center gap-3">
          <FaShoppingCart className="text-green-400" />
          <p><strong>Type:</strong> {transaction.type}</p>
        </div>

        <div className="flex items-center gap-3">
          <FaDollarSign className="text-orange-400" />
          <p><strong>Amount:</strong> ${transaction.amount}</p>
        </div>

        <div className="flex items-center gap-3">
          <FaCalendarAlt className="text-pink-400" />
          <p><strong>Due Date:</strong> {new Date(transaction.due_date).toLocaleDateString()}</p>
        </div>

        <div className="flex items-center gap-3">
          <FaCreditCard className="text-purple-400" />
          <p><strong>Payment Method:</strong> {transaction.payment_method_name}</p>
        </div>

        <div className="flex items-center gap-3">
          <FaDollarSign className="text-red-400" />
          <p><strong>Total Cost:</strong> ${transaction.total_cost}</p>
        </div>

        <div className="flex items-center gap-3">
          <FaDollarSign className="text-blue-400" />
          <p><strong>Remaining Balance:</strong> ${transaction.remaining_balance}</p>
        </div>

        {transaction.client_name && (
          <div className="flex items-center gap-3">
            <FaShoppingCart className="text-yellow-400" />
            <p><strong>Client:</strong> {transaction.client_name}</p>
          </div>
        )}

        {transaction.supplier_name && (
          <div className="flex items-center gap-3">
            <FaWarehouse className="text-green-400" />
            <p><strong>Supplier:</strong> {transaction.supplier_name}</p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <p><strong>Status:</strong></p>
          <span className={`px-3 py-1 text-sm font-semibold rounded ${getStatusBadge(transaction.status)}`}>
            {transaction.status}
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="mt-6">
        <h3 className="text-2xl font-semibold mb-3 text-blue-400">Products</h3>
        <table className="table w-full text-center  rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="p-3">Product Name</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Unit Price ($)</th>
              <th className="p-3">Selling Price ($)</th>
              <th className="p-3">Cost Price ($)</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.product_id} className="border-t">
                  <td className="p-3">{product.product_name}</td>
                  <td className="p-3">{product.quantity}</td>
                  <td className="p-3 text-green-400">${product.unit_price}</td>
                  <td className="p-3 text-yellow-400">${product.selling_price}</td>
                  <td className="p-3 text-red-500">${product.current_cost_price}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-gray-400 p-3">No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payments Button */}
      <div className="mt-6 text-right">
        <button 
          onClick={() => router.push(`${pathname}/payments`)} 
          className="btn btn-info flex items-center gap-2 text-white"
        >
          <FaMoneyCheckAlt /> View Payments
        </button>
      </div>
    </div>
  );
}