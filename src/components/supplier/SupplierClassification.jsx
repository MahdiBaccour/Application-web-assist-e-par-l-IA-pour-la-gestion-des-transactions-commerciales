"use client";
import { useEffect, useState,useRef } from "react";
import { classifySuppliers } from "@/services/ml/classifySuppliers";
import { getSupplier } from "@/services/suppliers/supplierService"; // make sure this exists
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from "recharts";
import { ImSpinner2 } from "react-icons/im";
import {
  FaTruck, FaMoneyCheckAlt, FaBalanceScale, FaExclamationTriangle, FaChartBar
} from "react-icons/fa";
import { useSession } from "next-auth/react";

export default function SupplierClassification(onCapture) {
  const { data: session } = useSession();
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [supplierNameMap, setSupplierNameMap] = useState({});
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const supplierCache = new Map();
  const chartRef = useRef();

  const fetchSupplierNames = async (suppliers) => {
    const map = {};
    let failed = false;

    for (const supplier of suppliers) {
      const id = supplier.supplier_id;

      if (supplierCache.has(id)) {
        map[id] = supplierCache.get(id);
      } else {
        try {
          const response = await getSupplier(id, session?.user.accessToken);
          const matchedSupplier = response?.supplier;

          if (matchedSupplier?.id === id || `${matchedSupplier?.id}` === `${id}`) {
            map[id] = matchedSupplier.name;
            supplierCache.set(id, matchedSupplier.name);
          } else {
            map[id] = `Fournisseur ${id}`;
            failed = true;
          }

        } catch (error) {
          console.error(`❌ Failed to fetch supplier ${id}:`, error);
          map[id] = `Fournisseur ${id}`;
          failed = true;
        }
      }
    }

    setSupplierNameMap(map);
    setError(failed ? "Certains noms de fournisseurs n'ont pas pu être chargés." : "");
  };

  useEffect(() => {
    const load = async () => {
      const result = await classifySuppliers(session?.user.accessToken);
      if (result.success) {
        setSuppliers(result.data);
        setFilteredSuppliers(result.data);
        await fetchSupplierNames(result.data);
      } else {
        setError(result.message);
      }
    };
    load();
  }, [retryCount]);

  useEffect(() => {
    if (filter === "trusted") {
      setFilteredSuppliers(suppliers.filter(s => s.rf_class === 1));
    } else if (filter === "risky") {
      setFilteredSuppliers(suppliers.filter(s => s.rf_class === 0));
    } else {
      setFilteredSuppliers(suppliers);
    }
  }, [filter, suppliers]);

  const enrichedSuppliers = filteredSuppliers.map(supplier => ({
    ...supplier,
    name: supplierNameMap[supplier.supplier_id] || `Fournisseur ${supplier.supplier_id}`
  }));

  useEffect(() => {
    if (onCapture && chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const base64 = canvas.toDataURL("image/png");
        onCapture(base64); // Pass it up to parent
      });
    }
  }, [onCapture]);

  if (error)
    return (
      <div className="alert alert-error mt-6 flex justify-between items-center">
        <span>Erreur : {error}</span>
        <button className="btn btn-sm" onClick={() => {
          setRetryCount(c => c + 1);
          setError("");
        }}>
          Réessayer
        </button>
      </div>
    );

  if (suppliers.length === 0 || Object.keys(supplierNameMap).length === 0)
    return (
      <div className="flex justify-center mt-10">
        <ImSpinner2 className="animate-spin text-4xl text-primary" />
      </div>
    );

  return (
    <div ref={chartRef} className="card bg-base-100 shadow-xl p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="card-title flex items-center gap-2">
          <FaTruck className="text-primary" />
          Classification des fournisseurs
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setFilter("all")} className={`btn btn-sm ${filter === "all" ? "btn-info" : "btn-outline"}`}>Tous</button>
          <button onClick={() => setFilter("trusted")} className={`btn btn-sm ${filter === "trusted" ? "btn-success" : "btn-outline"}`}>Fiables</button>
          <button onClick={() => setFilter("risky")} className={`btn btn-sm ${filter === "risky" ? "btn-error" : "btn-outline"}`}>À risque</button>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <h4 className="font-semibold text-base-content mb-2">Interprétation des segments :</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-medium">Segment 0 :</span> Fournisseurs peu fiables</li>
          <li><span className="font-medium">Segment 1 :</span> Moyennement fiables</li>
          <li><span className="font-medium">Segment 2 :</span> Fournisseurs de confiance</li>
        </ul>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mb-10 mt-4">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Nom</th>
              <th><FaMoneyCheckAlt /> Payé</th>
              <th><FaBalanceScale /> Facturé</th>
              <th>Transactions</th>
              <th>Ratio paiement</th>
              <th>Segment</th>
              <th>Niveau</th>
            </tr>
          </thead>
          <tbody>
            {enrichedSuppliers.map(supplier => {
              const isRisky = supplier.rf_class === 0;
              return (
                <tr key={supplier.supplier_id} className={isRisky ? "bg-red-50" : ""}>
                  <td>{supplier.name}</td>
                  <td>{supplier.total_paid} DT</td>
                  <td>{supplier.total_billed} DT</td>
                  <td>{supplier.transactions}</td>
                  <td>{Number(supplier.payment_ratio).toFixed(1)}%</td>
                  <td>
                    <span className={`badge badge-${["info", "success", "warning"][supplier.segment % 3]}`}>
                      {supplier.segment}
                    </span>
                  </td>
                  <td>
                    {isRisky ? (
                      <span className="flex items-center gap-2 text-red-600 font-medium">
                        <FaExclamationTriangle />
                        À risque
                      </span>
                    ) : (
                      <span className="text-success font-medium">Fiable</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Chart */}
      <div className="h-96 mb-12">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-primary">
          <FaChartBar />
          Paiement vs Facturation - Fournisseurs
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={enrichedSuppliers}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_paid" fill="#34d399" name="Total payé" />
            <Bar dataKey="total_billed" fill="#60a5fa" name="Total facturé" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}