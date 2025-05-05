import PageHeader from '@/components/PageHeader';
import ReportPage from '@/components/report/ReportPage';

export default function ReportsPage() {
  return (
    <>
      <PageHeader 
        title="Rapports" 
        subtitle="Générez, visualisez et exportez des rapports administratifs." 
      />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title text-xl font-semibold">
            Générateur de Rapports
          </h2>
          <ReportPage />
        </div>
      </div>
    </>
  );
}