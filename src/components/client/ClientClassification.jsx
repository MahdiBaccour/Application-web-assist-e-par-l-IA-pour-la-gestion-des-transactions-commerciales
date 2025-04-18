'use client';
import { useEffect, useState } from 'react';
import { classifyClients } from '@/services/ml/classifyClients';
import { getClient } from '@/services/clients/clientService'; // 📍 Make sure this path is correct
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { ImSpinner2 } from "react-icons/im";
import {
  FaUsers, FaMoneyCheckAlt, FaBalanceScale, FaExclamationTriangle, FaChartBar
} from 'react-icons/fa';
import { useSession } from 'next-auth/react';
const ClientClassification = () => {
  const { data: session } = useSession();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [clientNameMap, setClientNameMap] = useState({});
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // 🧠 Cache client names
  const clientCache = new Map();

  const fetchClientNames = async (clients) => {
    const map = {};
    let failed = false;
  
    for (const client of clients) {
      const id = client.client_id;
  
      if (clientCache.has(id)) {
        map[id] = clientCache.get(id);
      } else {
        try {
          const response = await getClient(id, session?.user.accessToken);
          console.log(`Client response for ID ${id}:`, response);
  
          const matchedClient = response?.client; // ✅ fix here
  
          if (matchedClient?.id === id || `${matchedClient?.id}` === `${id}`) {
            map[id] = matchedClient.name;
            clientCache.set(id, matchedClient.name);
          } else {
            map[id] = `Client ${id}`;
            failed = true;
          }
  
        } catch (error) {
          console.error(`❌ Failed to fetch client ${id}:`, error);
          map[id] = `Client ${id}`;
          failed = true;
        }
      }
    }
  
    setClientNameMap(map);
  
    if (failed) {
      setError("Certains noms de clients n'ont pas pu être chargés.");
    } else {
      setError("");
    }
  };

  useEffect(() => {
    const load = async () => {
      const result = await classifyClients();
      if (result.success) {
        setClients(result.data);
        setFilteredClients(result.data);
        await fetchClientNames(result.data);
      } else {
        setError(result.message);
      }
    };
    load();
  }, [retryCount]);

  useEffect(() => {
    if (filter === "trusted") {
      setFilteredClients(clients.filter(c => c.rf_class === 1));
    } else if (filter === "risky") {
      setFilteredClients(clients.filter(c => c.rf_class === 0));
    } else {
      setFilteredClients(clients);
    }
  }, [filter, clients]);

  const enrichedClients = filteredClients.map(client => ({
    ...client,
    name: clientNameMap[client.client_id] || `Client ${client.client_id}`
  }));

  if (error) {
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
  }

  if (clients.length === 0 || Object.keys(clientNameMap).length === 0) {
    return <div className="flex justify-center mt-10"><ImSpinner2 className="animate-spin text-4xl text-primary" /></div>;
  }

  return (
    <div className="card bg-base-100 shadow-xl p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="card-title flex items-center gap-2">
          <FaUsers className="text-primary" />
          Classification des clients
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setFilter("all")} className={`btn btn-sm ${filter === "all" ? "btn-info" : "btn-outline"}`}>Tous</button>
          <button onClick={() => setFilter("trusted")} className={`btn btn-sm ${filter === "trusted" ? "btn-success" : "btn-outline"}`}>Bon payeur</button>
          <button onClick={() => setFilter("risky")} className={`btn btn-sm ${filter === "risky" ? "btn-error" : "btn-outline"}`}>À risque</button>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <h4 className="font-semibold text-base-content mb-2">Interprétation des segments :</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-medium">Segment 0 :</span> Faible volume ou paiements irréguliers</li>
          <li><span className="font-medium">Segment 1 :</span> Moyens avec paiements modérés</li>
          <li><span className="font-medium">Segment 2 :</span> Grands clients ou bons payeurs</li>
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
            {enrichedClients.map(client => {
              const isRisky = client.rf_class === 0;
              return (
                <tr key={client.client_id} className={isRisky ? "bg-red-50" : ""}>
                  <td>{client.name}</td>
                  <td>{client.total_paid} DT</td>
                  <td>{client.total_billed} DT</td>
                  <td>{client.transactions}</td>
                  <td>{Number(client.payment_ratio).toFixed(1)}%</td>
                  <td>
                    <span className={`badge badge-${["info", "success", "warning"][client.segment % 3]}`}>
                      {client.segment}
                    </span>
                  </td>
                  <td>
                    {isRisky ? (
                      <span className="flex items-center gap-2 text-red-600 font-medium">
                        <FaExclamationTriangle />
                        À risque
                      </span>
                    ) : (
                      <span className="text-success font-medium">Bon payeur</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 📊 Chart 1 */}
      <div className="h-96 mb-12">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-primary">
          <FaChartBar />
          Comparaison des paiements et factures
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={enrichedClients}>
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

      {/* 📊 Chart 2 */}
      <div className="h-96 mt-10">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-accent">
          <FaChartBar />
          Paiement vs Facturation (Horizontale)
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={enrichedClients}
            margin={{ top: 10, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_paid" stackId="a" fill="#34d399" name="Total payé" />
            <Bar dataKey="total_billed" stackId="a" fill="#60a5fa" name="Total facturé" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ClientClassification;