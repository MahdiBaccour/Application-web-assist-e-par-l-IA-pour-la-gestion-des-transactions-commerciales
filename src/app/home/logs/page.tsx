import PageHeader from '@/components/PageHeader';
import LogsViwer from '@/components/logs/LogsViewer';

export default function LogsPage() {
  return (
    <>
      <PageHeader title="Logs" subtitle="Voir les journaux" />
      <div className="card bg-base-100 shadow-xl mt-8">
         <div className="card-body p-4">
          <LogsViwer />
        </div>
      </div>
    </>
  );
}
