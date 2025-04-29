import PageHeader from '@/components/PageHeader';
import Chatbot from '@/components/chat/chatbot';

export default function ChatbotPage() {
  return (
    <>
      <PageHeader title="Chatbot" subtitle="Discutez avec le chatbot Clients / Fournisseurs." />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body p-0 h-[80vh]">
          <Chatbot />
        </div>
      </div>
    </>
  );
}
