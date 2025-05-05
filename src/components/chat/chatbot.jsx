'use client';
import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaCircle, FaRegCopy, FaReply, FaChevronDown } from 'react-icons/fa';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatContainerRef = useRef(null);

  // Questions data (French)
  const questions = {
    'Transactions Clients': [
      'Comment calculer le montant total des transactions pour un client sur une période donnée ?',
      'Quelles sont les meilleures pratiques pour suivre l’historique de paiement d’un client ?',
      'Comment gérer les factures impayées d’un client ?',
      'Quelles informations sont nécessaires pour établir un historique de paiement client ?',
      'Comment identifier les clients les plus rentables pour une entreprise ?',
      'Quelles stratégies peuvent encourager les clients à payer à temps ?',
    ],
    'Transactions Fournisseurs': [
      'Comment optimiser les paiements aux fournisseurs pour améliorer la trésorerie ?',
      'Quels sont les avantages de négocier des délais de paiement avec un fournisseur ?',
      'Comment suivre les paiements en attente pour plusieurs fournisseurs ?',
      'Quelles clauses inclure dans un contrat fournisseur pour protéger l’entreprise ?',
      'Comment évaluer la fiabilité financière d’un nouveau fournisseur ?',
    ],
    'Transactions Générales': [
      'Quels indicateurs clés suivre pour analyser le volume des transactions ?',
      'Comment automatiser le suivi des transactions dans une entreprise ?',
      'Quelles sont les erreurs courantes dans la gestion des transactions financières ?',
      'Comment détecter les transactions frauduleuses dans un système comptable ?',
      'Quels outils logiciels recommander pour gérer les transactions quotidiennes ?',
    ],
    'Rapports Financiers': [
      'Comment préparer un rapport de flux de trésorerie pour une petite entreprise ?',
      'Quels éléments inclure dans un résumé financier mensuel ?',
      'Comment analyser les tendances des dépenses pour réduire les coûts ?',
      'Quelles métriques utiliser pour évaluer la performance des transactions ?',
      'Comment présenter un rapport financier clair à des investisseurs ?',
    ],
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isBotTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    const timestamp = new Date().toLocaleTimeString();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage, timestamp }]);
    setInput('');
    setIsBotTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply, timestamp: new Date().toLocaleTimeString() }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Erreur lors de la réponse du chatbot.', timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleReactionReply = (text) => {
    setInput(`@bot ${text}`);
  };

  const handleQuestionSelect = (question, category) => {
    setInput(question);
    // Close the category details
    const detailsElement = document.querySelector(`details[data-category="${category}"]`);
    if (detailsElement) {
      detailsElement.removeAttribute('open');
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-100">
      {/* Custom Styles */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
          70% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        @keyframes bounceDot {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-message { animation: slideIn 0.3s ease-out; }
        .animate-glow { animation: pulseGlow 1.5s infinite; }
        .animate-dot-1 { animation: bounceDot 0.6s infinite; }
        .animate-dot-2 { animation: bounceDot 0.6s infinite 0.15s; }
        .animate-dot-3 { animation: bounceDot 0.6s infinite 0.3s; }
        details > div { transition: max-height 0.2s ease, opacity 0.2s ease; }
        details:not([open]) > div { max-height: 0; opacity: 0; overflow: hidden; }
        details[open] > div { max-height: 400px; opacity: 1; }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-3 p-5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-xl">
        <FaCircle className="text-emerald-400 animate-pulse" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Assistant Financier</h2>
          <p className="text-sm opacity-80 font-medium">Support transactionnel intelligent</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-4 p-6 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-message`}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className="relative group max-w-[80%]">
              <div
                className={`px-5 py-3 rounded-2xl shadow-md transition-all duration-300 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ml-10 hover:shadow-lg'
                    : 'bg-white text-gray-800 mr-10 border border-gray-100 hover:shadow-lg'
                }`}
              >
                <p className="text-sm leading-relaxed font-medium">{msg.text}</p>
                <span className="absolute -bottom-5 text-[0.65rem] text-gray-500 font-medium tracking-tight">
                  {msg.timestamp}
                </span>
              </div>

              {/* Message Actions */}
              {msg.sender === 'bot' && (
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                    onClick={() => navigator.clipboard.writeText(msg.text)}
                  >
                    <FaRegCopy className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                    onClick={() => handleReactionReply(msg.text)}
                  >
                    <FaReply className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isBotTyping && (
          <div className="flex justify-start items-center gap-2 ml-4">
            <div className="px-5 py-3 rounded-2xl bg-white shadow-md border border-gray-100">
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-dot-1" />
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-dot-2" />
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-dot-3" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Questions Section */}
      <div className="p-4 border-t bg-white/95 backdrop-blur-md shadow-2xl">
        <div className="mb-4 space-y-2">
          {Object.entries(questions).map(([category, categoryQuestions]) => (
            <details
              key={category}
              data-category={category}
              className="group border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <summary className="flex justify-between items-center p-2 bg-gradient-to-r from-gray-50 to-blue-50 cursor-pointer hover:bg-blue-100 transition-colors">
                <h3 className="text-sm font-semibold text-gray-800">{category}</h3>
                <FaChevronDown className="w-4 h-4 text-gray-600 transform group-open:rotate-180 transition-transform duration-200" />
              </summary>
              <div className="p-2 space-y-1 bg-gray-50">
                {categoryQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuestionSelect(question, category)}
                    className="w-full py-1.5 px-2 text-left text-xs rounded-md hover:bg-blue-100 transition-colors border border-transparent hover:border-blue-200 hover:shadow-sm animate-[slideIn_0.2s_ease-out] focus:outline-none focus:ring-1 focus:ring-blue-300"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </details>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-3 relative">
          <input
            type="text"
            value={input}
            readOnly
            className={`w-full p-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all pr-14 ${input ? 'animate-glow' : ''}`}
            placeholder="Sélectionnez une question..."
          />
          <button
            onClick={handleSend}
            className="absolute right-2 p-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <FaPaperPlane className="w-4 h-4 transform -rotate-45" />
          </button>
        </div>
      </div>
    </div>
  );
}