import PageHeader from '@/components/PageHeader';
import Chatbot from '@/components/chat/chatbot';

export default function ChatbotPage() {
  return (
    <>
      <PageHeader
        title="Chatbot"
        subtitle="Discutez avec l’assistant financier."
      />
      <div className="card bg-base-100 shadow-xl mt-8 h-[80vh]">
        <div className="card-body p-0 h-full">
          <Chatbot />
        </div>
      </div>
    </>
  );
}
