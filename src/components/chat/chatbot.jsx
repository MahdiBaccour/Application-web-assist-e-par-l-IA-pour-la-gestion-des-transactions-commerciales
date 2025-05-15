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

  // Gestion du thème
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
    };

    applyTheme();
    
    const handleThemeChange = () => applyTheme();
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  // Function to handle sending messages
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    const timestamp = new Date().toLocaleTimeString();
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage, timestamp }]);
    setInput('');
    setIsBotTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: data.reply, timestamp: new Date().toLocaleTimeString() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Erreur lors de la réponse du chatbot.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  // Function to handle reactions to bot messages (like reply)
  const handleReactionReply = (text) => {
    setInput(`@bot ${text}`);
  };

  // Function to handle question selection
  const handleQuestionSelect = (question, category) => {
    setInput(question);
    // Close the category details
    const detailsElement = document.querySelector(`details[data-category="${category}"]`);
    if (detailsElement) {
      detailsElement.removeAttribute('open');
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-base-100">
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-message { animation: slideIn 0.3s ease-out; }
      `}</style>

      {/* En-tête */}
      <div className="flex items-center gap-3 p-5 bg-base-200 text-base-content shadow-xl">
        <FaCircle className="text-secondary animate-pulse" />
        <div>
          <h2 className="text-2xl font-bold">Assistant Financier</h2>
          <p className="text-sm opacity-80">Support transactionnel intelligent</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-message`}>
            <div className={`px-5 py-3 rounded-2xl shadow-md ${msg.sender === 'user' ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {/* Typing indicator */}
        {isBotTyping && (
          <div className="flex justify-start items-center gap-2 ml-4">
            <div className="px-5 py-3 rounded-2xl bg-base-200 shadow-md">
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sélection de questions */}
      <div className="p-4 border-t bg-base-200">
        <div className="mb-4 space-y-2">
          {Object.entries(questions).map(([category, categoryQuestions]) => (
            <details key={category} className="group border border-base-300 rounded-lg overflow-hidden">
              <summary className="flex justify-between items-center p-2 bg-base-100 cursor-pointer hover:bg-base-300">
                <h3 className="text-sm font-semibold">{category}</h3>
                <FaChevronDown className="w-4 h-4 transform group-open:rotate-180 transition-transform" />
              </summary>
              <div className="p-2 space-y-1 bg-base-100">
                {categoryQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuestionSelect(question, category)}
                    className="w-full py-1.5 px-2 text-left text-sm rounded-md hover:bg-base-300 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </details>
          ))}
        </div>

        {/* Zone de saisie */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input input-bordered flex-1 bg-base-100"
            placeholder="Sélectionnez une question..."
          />
          <button 
            onClick={handleSend}
            className="btn btn-primary"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}
