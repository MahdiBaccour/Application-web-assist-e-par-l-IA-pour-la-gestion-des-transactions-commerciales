"use client";
import { useEffect, useState,useRef } from "react";
import { predictNextBudgets } from "@/services/ml/predictBudget";
import { ImSpinner2 } from "react-icons/im";
import { FaChartLine, FaCalendarAlt, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useSession } from "next-auth/react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function BudgetPrediction(onCapture) {
  const { data: session } = useSession();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [monthsToPredict, setMonthsToPredict] = useState(12);
  const [retryCount, setRetryCount] = useState(0);
  const chartRef = useRef();

  useEffect(() => {
    const loadPrediction = async () => {
      setLoading(true);
      const result = await predictNextBudgets(session?.user?.accessToken, monthsToPredict);
      if (result.success) {
        setPredictions(result.predictions);
        setError("");
      } else {
        setError(result.message);
        setPredictions([]);
      }
      setLoading(false);
    };

    loadPrediction();
  }, [retryCount, monthsToPredict]);

  useEffect(() => {
    if (onCapture && chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const base64 = canvas.toDataURL("image/png");
        onCapture(base64); // Pass it up to parent
      });
    }
  }, [onCapture]);
  
  const handleSelectChange = (e) => {
    setMonthsToPredict(parseInt(e.target.value));
  };

  if (loading)
    return (
      <div className="flex justify-center mt-10">
        <ImSpinner2 className="animate-spin text-4xl text-primary" />
      </div>
    );

  if (error)
    return (
      <div className="alert alert-error mt-6 flex justify-between items-center">
        <span>Erreur : {error}</span>
        <button
          className="btn btn-sm"
          onClick={() => {
            setRetryCount((c) => c + 1);
            setError("");
          }}
        >
          Réessayer
        </button>
      </div>
    );

  const nextMonth = predictions[0];
  const {
    month: next_month,
    total_income_brut,
    total_income_net,
    total_expenses,
    net_balance,
  } = nextMonth || {};

  const statusText =
    net_balance > 0 ? "Bénéfice attendu" : net_balance < 0 ? "Perte probable" : "Équilibre";
  const statusIcon =
    net_balance > 0 ? <FaArrowUp className="text-success" /> :
    net_balance < 0 ? <FaArrowDown className="text-error" /> :
    <FaCalendarAlt className="text-gray-500" />;

  return (
    <>
      {/* 📌 Summary of Next Month */}
      <div ref={chartRef} className="card bg-base-100 shadow-xl p-6">
        <h2 className="card-title flex items-center gap-2 text-primary">
          <FaChartLine />
          Prédiction budgétaire du mois prochain
        </h2>

        <div className="mt-4 space-y-2">
          <p className="text-md">
            📅 Mois prédit : <span className="font-semibold">{next_month}</span>
          </p>
          <p className="text-md">💰 Revenu brut prédit : <span className="text-info font-medium">{total_income_brut} DT</span></p>
          <p className="text-md">💵 Revenu net prédit : <span className="text-success font-medium">{total_income_net} DT</span></p>
          <p className="text-md">💸 Dépenses prévues : <span className="text-error font-medium">{total_expenses} DT</span></p>
          <p className="text-md">📈 Solde net prédit : <span className="text-warning font-medium">{net_balance} DT</span></p>
          <p className="text-md flex items-center gap-2 mt-2">
            {statusIcon}
            <span className={`font-semibold capitalize`}>
              {statusText}
            </span>
          </p>
        </div>
      </div>

      {/* 📊 Multi-Month Chart */}
      <div className="card bg-base-100 shadow-xl p-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title text-primary flex items-center gap-2">
            📊 Prévision budgétaire sur {monthsToPredict} mois
          </h2>
          <select
            value={monthsToPredict}
            onChange={handleSelectChange}
            className="select select-bordered"
          >
            <option value={6}>6 mois</option>
            <option value={12}>12 mois</option>
            <option value={18}>18 mois</option>
          </select>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={predictions} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total_income_brut" stroke="#8884d8" name="Revenu Brut" />
              <Line type="monotone" dataKey="total_income_net" stroke="#4ade80" name="Revenu Net" />
              <Line type="monotone" dataKey="total_expenses" stroke="#f87171" name="Dépenses" />
              <Line type="monotone" dataKey="net_balance" stroke="#facc15" name="Solde Net" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}