'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { pdf } from '@react-pdf/renderer';
import TransactionsTableSimple from '@/components/transaction/TransactionsTable';
import PaymentTable from '@/components/payment/PaymentTable';
import ReportDocument from './ReportDocument';

export default function ReportPage() {
  const { data: session } = useSession();
  const [reportType, setReportType] = useState('stats');
  const [view, setView] = useState('tables');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [transactionsData, setTransactionsData] = useState([]);
  const [paymentsData, setPaymentsData] = useState([]);
  const today = new Date().toISOString().split('T')[0];
  const fileName = `rapport-administratif-${today}.pdf`;

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    if (newStartDate && endDate && newStartDate > endDate) {
      setEndDate('');
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    if (!startDate || newEndDate >= startDate) {
      setEndDate(newEndDate);
    }
  };

  const handleTransactionsData = (data, total) => {
    setTransactionsData(Array.isArray(data) ? data : []);
    setTotalAmount(typeof total === 'number' ? total : 0);
  };
  
  const handlePaymentsData = (data) => {
    setPaymentsData(Array.isArray(data) ? data : []);
  };
  
  

  // ✅ Fixed PDF Download Function
  const handleGeneratePDF = async () => {
  const blob = await pdf(
    <ReportDocument
      startDate={startDate}
      endDate={endDate}
      totalAmount={totalAmount}
      reportType={reportType}
      view={view}
      transactionsData={transactionsData}
      paymentsData={paymentsData}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};



  return (
    <div className="p-6 bg-base-100">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-3xl font-bold">Génération de Rapports Administratifs</h1>
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="select select-bordered"
          >
            <option value="stats">Statistiques</option>
            <option value="predictions">Prédictions IA</option>
          </select>

          {reportType === 'stats' && (
            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="select select-bordered"
            >
              <option value="tables">Tableaux</option>
            </select>
          )}

          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              max={today}
              className="p-2 border rounded"
            />
            <span>à</span>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate || undefined}
              max={today}
              className="p-2 border rounded"
              disabled={!startDate}
            />
          </div>
        </div>
      </div>

      <div className="report-content">
        {reportType === 'stats' ? (
          <>
            <TransactionsTableSimple
              startDate={startDate}
              endDate={endDate}
              onTotalChange={setTotalAmount}
              onDataCapture={handleTransactionsData}
              disableAdd={true}
            />
            <PaymentTable
              startDate={startDate}
              endDate={endDate}
              onDataCapture={handlePaymentsData}
              refreshTrigger={`${startDate}-${endDate}`}
            />
           <div className="mt-4 p-4 bg-base-200 rounded-lg">
  <h3 className="text-xl font-semibold">
    Total des Transactions:{' '}
    {transactionsData
      .reduce((sum, transaction) => {
        const amount = parseFloat(transaction.amount);
        return Number.isFinite(amount) ? sum + amount : sum;
      }, 0)
      .toFixed(2)}{' '}
    DH
  </h3>
</div>

          </>
        ) : (
          <div className="p-4">
            <p className="text-lg">
              Veuillez sélectionner le type de rapport "Statistiques" pour afficher les tableaux de transactions et paiements.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        {startDate && endDate && (
          <button
            onClick={handleGeneratePDF}
            className="btn btn-primary"
          >
            Télécharger PDF
          </button>
        )}
      </div>
    </div>
  );
}
