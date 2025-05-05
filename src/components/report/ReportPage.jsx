'use client';
import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import  TransactionsTable  from '@/components/transaction/TransactionsTable';
import  PaymentTable  from '@/components/payment/PaymentTable';
import  PerformanceIndicators  from '@/components/dashboard/PerformanceIndicators';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import BudgetChart from '@/components/dashboard/BudgetChart';
import TopProductsChart from '@/components/dashboard/TopProductsChart';
import  BudgetPrediction  from '@/components/budget/BudgetPrediction';
import ClientClassification from '@/components/client/ClientClassification';
import SupplierClassification from '@/components/supplier/SupplierClassification';
import ReportDocument from './ReportDocument';

export default function ReportPage() {
  const { data: session } = useSession();
  const [reportType, setReportType] = useState('stats');
  const [view, setView] = useState('graphs');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [dashboardImg, setDashboardImg] = useState(null);
const [budgetImg, setBudgetImg] = useState(null);
const [topProductsImg, setTopProductsImg] = useState(null);
const [clientClassificationImg, setClientClassificationImg] = useState(null);
const [supplierClassificationImg, setSupplierClassificationImg] = useState(null);
const [budgetPredictionImg, setBudgetPredictionImg] = useState(null);
const [performanceImg, setPerformanceImg] = useState(null);
  const [transactionsImg, setTransactionsImg] = useState(null);
  const [paymentImg, setPaymentImg] = useState(null);
  const reportRef = useRef();
  const today = new Date().toISOString().split('T')[0];
  const fileName = `rapport-administratif-${today}.pdf`;

  const handleGenerateReport = async () => {
    // Additional logic before generating PDF if needed
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
              <option value="graphs">Graphiques</option>
              <option value="tables">Tableaux</option>
            </select>
          )}

          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input input-bordered"
            />
            <span>à</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input input-bordered"
            />
          </div>
        </div>
      </div>

      <div ref={reportRef} className="report-content">
        {reportType === 'stats' ? (
          view === 'tables' ? (
            <>
              <TransactionsTable 
                startDate={startDate}
                endDate={endDate}
                onTotalChange={setTotalAmount}
                onDataCapture={setTransactionsImg}
              />
              <PaymentTable 
                startDate={startDate}
                endDate={endDate}
                onDataCapture={setPaymentImg}
              />
              <div className="mt-4 p-4 bg-base-200 rounded-lg">
                <h3 className="text-xl font-semibold">
                  Total des Transactions: {totalAmount.toFixed(2)} DH
                </h3>
              </div>
            </>
          ) : (
            <>
              <PerformanceIndicators token={session?.user.accessToken}  onCapture={setPerformanceImg} />
              <DashboardCharts token={session?.user.accessToken} onCapture={setDashboardImg}/>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <BudgetChart token={session?.user.accessToken} onCapture={setBudgetImg} />
                <TopProductsChart token={session?.user.accessToken} onCapture={setTopProductsImg} />
              </div>
            </>
          )
        ) : (
          <>
            <div className="flex justify-end p-4">
              <select
                value={view}
                onChange={(e) => setView(e.target.value)}
                className="select select-bordered"
              >
                <option value="client">Classification des Clients</option>
                <option value="supplier">Classification des Fournisseurs</option>
              </select>
            </div>

            {view === "client" && <ClientClassification onCapture={setClientClassificationImg} />}
            {view === "supplier" && <SupplierClassification onCapture={setSupplierClassificationImg}/>}
            <BudgetPrediction onCapture={setBudgetPredictionImg} />
          </>
        )}
      </div>

      <div className="mt-8 flex justify-end">
  <PDFDownloadLink
    document={
      <ReportDocument 
        startDate={startDate}
        endDate={endDate}
        totalAmount={totalAmount}
        reportType={reportType}
        view={view}
        transactionsImg={transactionsImg}
        paymentImg={paymentImg}
        dashboardImg={dashboardImg}
        budgetImg={budgetImg}
        topProductsImg={topProductsImg}
        clientClassificationImg={clientClassificationImg}
        supplierClassificationImg={supplierClassificationImg}
        budgetPredictionImg={budgetPredictionImg}
        performanceImg={performanceImg}
      />
    }
     fileName={fileName}
  >
    {({ loading }) => (
      <button className="btn btn-primary" disabled={loading}>
        {loading ? 'Génération...' : 'Télécharger PDF'}
      </button>
    )}
  </PDFDownloadLink>
</div>
    </div>
  );
}