"use client";
import { usePathname } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ProductDetails from "@/components/products/ProductDetails";

export default function ProductPage() {
  const pathname = usePathname();
  const id = pathname.split("/").pop();

  return (
    <>
      <PageHeader title="Product Details" subtitle="Details of the selected product" />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          {id ? <ProductDetails /> : <p className="text-center text-red-500">Product ID not found</p>}
        </div>
      </div>
    </>
  );
}