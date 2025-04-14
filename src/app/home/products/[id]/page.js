"use client";
import { usePathname } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ProductDetails from "@/components/products/ProductDetails";

export default function ProductPage() {
  const pathname = usePathname();
  const id = pathname.split("/").pop();

  return (
    <>
      <PageHeader title="Détails du produit" subtitle="Détails du produit sélectionné" />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          {id ? <ProductDetails /> : <p className="text-center text-red-500">ID de produit introuvable</p>}
        </div>
      </div>
    </>
  );
}