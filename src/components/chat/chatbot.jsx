// components/chat/Chatbot.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaCircle, FaChevronDown } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { sendMessage } from '@/services/chat/chatService';

export default function Chatbot() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatContainerRef = useRef(null);

  // Questions proposées (identiques au backend pour la validation)
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

  // Applique le thème (dark/light) depuis le localStorage
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

  // Scroll to bottom à chaque nouveau message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Envoie le message de l’utilisateur au backend                      
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    const timestamp = new Date().toLocaleTimeString();
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: userMessage, timestamp },
    ]);
    setInput('');
    setIsBotTyping(true);

    // Appel au service
    const result = await sendMessage(userMessage, session?.user?.accessToken || '');

    if (result.success) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: result.reply,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: result.message ?? "Erreur inattendue.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
    setIsBotTyping(false);
  };

  // Envoi automatique si l'utilisateur appuie sur "Enter"
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Remplit l’input quand on clique sur une question prédéfinie
  const handleQuestionSelect = (question, category) => {
    setInput(question);
    const detailsEl = document.querySelector(`details[data-category="${category}"]`);
    if (detailsEl) detailsEl.removeAttribute('open');
  };

  return (
    <div className="flex flex-col h-full">
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateY(10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-message { animation: slideIn 0.3s ease-out; }
        `}
      </style>

      {/* Conteneur principal (à l’intérieur de la card) */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 pt-4 pb-2 space-y-3 bg-base-100"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            } animate-message`}
          >
            <div
              className={`px-4 py-2 rounded-lg shadow-md max-w-[70%] ${
                msg.sender === 'user'
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-200 text-base-content'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <span className="text-[10px] opacity-50 block text-right">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {/* Indicateur de saisie du bot */}
        {isBotTyping && (
          <div className="flex justify-start items-center gap-2 ml-2">
            <div className="px-4 py-2 rounded-lg bg-base-200 shadow-md">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sélection de questions et zone de saisie */}
      <div className="border-t bg-base-100 p-2 -mt-2">
        <div className="mb-2 space-y-1 max-h-28 overflow-y-auto">
          {Object.entries(questions).map(([category, categoryQuestions]) => (
            <details
              key={category}
              data-category={category}
              className="group border border-base-300 rounded-md overflow-hidden"
            >
              <summary className="flex justify-between items-center px-2 py-1 bg-base-200 cursor-pointer hover:bg-base-300">
                <h3 className="text-sm font-medium">{category}</h3>
                <FaChevronDown className="w-4 h-4 transform group-open:rotate-180 transition-transform" />
              </summary>
              <div className="p-1 bg-base-100 space-y-1">
                {categoryQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuestionSelect(question, category)}
                    className="w-full text-left text-sm px-2 py-1 rounded-md hover:bg-base-200 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </details>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="textarea textarea-bordered flex-1 resize-none bg-base-100"
            placeholder="Tapez votre question ..."
          />
          <button
            onClick={handleSend}
            className="btn btn-primary shrink-0"
            disabled={!input.trim()}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}