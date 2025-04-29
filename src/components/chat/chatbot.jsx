'use client';
import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaCircle } from 'react-icons/fa';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatContainerRef = useRef(null);

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

  const handleFileUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setMessages(prev => [...prev, { sender: 'user', text: `📎 ${file.name}`, timestamp: new Date().toLocaleTimeString() }]);
    setIsBotTyping(true);

    try {
      const res = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply, timestamp: new Date().toLocaleTimeString() }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Erreur lors de l’envoi du fichier.', timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleReactionReply = (text) => {
    setInput(`@bot ${text}`);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100 text-gray-900">
      <div className="flex items-center gap-2 p-4 bg-blue-600 text-white shadow">
        <FaCircle className="text-green-400 animate-pulse" />
        <h2 className="text-lg font-semibold">Chatbot Clients / Fournisseurs</h2>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end`}>
            <div className="relative group max-w-[70%]">
              <div
                className={`px-4 py-2 rounded-lg shadow-md whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800'
                }`}
              >
                {msg.text}
              </div>
              <span className="absolute -bottom-5 left-1 text-xs text-gray-500">{msg.timestamp}</span>
              {msg.sender === 'bot' && (
                <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                  <button className="text-xs hover:text-blue-500" onClick={() => navigator.clipboard.writeText(msg.text)}>
                    📋
                  </button>
                  <button className="text-xs hover:text-blue-500" onClick={() => handleReactionReply(msg.text)}>
                    ↩️
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isBotTyping && (
          <div className="flex justify-start items-center gap-2">
            <div className="max-w-xs px-4 py-2 rounded-lg bg-white shadow-md">
              <div className="flex space-x-1 animate-pulse">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 p-4 border-t bg-white shadow">
        <input type="file" className="hidden" id="fileUpload" onChange={e => handleFileUpload(e.target.files?.[0])} />
        <label htmlFor="fileUpload" className="cursor-pointer px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300">📎</label>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          className="flex-1 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Écrivez votre message..."
        />
        <button onClick={handleSend} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
          <FaPaperPlane className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
