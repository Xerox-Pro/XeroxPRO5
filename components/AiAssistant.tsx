import React, { useState, useEffect, useRef } from 'react';
import type { Settings, ChatMessage, AccentColor, UiCornerRadius } from '../types';

const ACCENT_COLOR_MAP: Record<AccentColor, { focus: string; bg: string; text: string; hover: string; ring: string; border: string; }> = {
    indigo: { focus: 'focus:ring-indigo-500', bg: 'bg-indigo-600', text: 'text-indigo-600', hover: 'hover:bg-indigo-700', ring: 'ring-indigo-500', border: 'border-indigo-500' },
    sky: { focus: 'focus:ring-sky-500', bg: 'bg-sky-600', text: 'text-sky-600', hover: 'hover:bg-sky-700', ring: 'ring-sky-500', border: 'border-sky-500' },
    emerald: { focus: 'focus:ring-emerald-500', bg: 'bg-emerald-600', text: 'text-emerald-600', hover: 'hover:bg-emerald-700', ring: 'ring-emerald-500', border: 'border-emerald-500' },
    rose: { focus: 'focus:ring-rose-500', bg: 'bg-rose-600', text: 'text-rose-600', hover: 'hover:bg-rose-700', ring: 'ring-rose-500', border: 'border-rose-500' },
    amber: { focus: 'focus:ring-amber-500', bg: 'bg-amber-600', text: 'text-amber-600', hover: 'hover:bg-amber-700', ring: 'ring-amber-500', border: 'border-amber-500' },
    violet: { focus: 'focus:ring-violet-500', bg: 'bg-violet-600', text: 'text-violet-600', hover: 'hover:bg-violet-700', ring: 'ring-violet-500', border: 'border-violet-500' },
    cyan: { focus: 'focus:ring-cyan-500', bg: 'bg-cyan-600', text: 'text-cyan-600', hover: 'hover:bg-cyan-700', ring: 'ring-cyan-500', border: 'border-cyan-500' },
    slate: { focus: 'focus:ring-slate-500', bg: 'bg-slate-600', text: 'text-slate-600', hover: 'hover:bg-slate-700', ring: 'ring-slate-500', border: 'border-slate-500' },
};
const CORNER_RADIUS_MAP: Record<UiCornerRadius, { main: string; large: string, full: string }> = {
    sharp: { main: 'rounded-none', large: 'rounded-sm', full: 'rounded-none' },
    standard: { main: 'rounded-md', large: 'rounded-lg', full: 'rounded-full' },
    rounded: { main: 'rounded-xl', large: 'rounded-2xl', full: 'rounded-full' },
    pills: { main: 'rounded-full', large: 'rounded-3xl', full: 'rounded-full' },
};

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  initialMessage?: string;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose, settings, initialMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      parts: [{ text: 'こんにちは！私はXeroです。あなたのブラウジングをサポートするAIアシスタントです。何かお手伝いできることはありますか？' }]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const accent = ACCENT_COLOR_MAP[settings.accentColor];
  const radius = CORNER_RADIUS_MAP[settings.uiCornerRadius];

  useEffect(() => {
    if (initialMessage && messages.length === 1) { // Only use initial message if it's a fresh chat
        setInput(initialMessage);
    }
  }, [initialMessage]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', parts: [{ text: userMessage }] }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const history = newMessages.slice(0, -1);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, message: userMessage }),
      });

      if (!response.body) throw new Error('No response body');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let modelResponse = '';

      setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        modelResponse += chunk;
        setMessages(prev => {
          const lastMsgIndex = prev.length - 1;
          const updatedMessages = [...prev];
          if(updatedMessages[lastMsgIndex].role === 'model') {
            updatedMessages[lastMsgIndex] = { role: 'model', parts: [{ text: modelResponse }]};
          }
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "申し訳ありません、エラーが発生しました。" }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] flex items-center justify-center animate-scale-in" onClick={onClose}>
      <div className={`bg-gray-100 dark:bg-gray-900 ${radius.large} shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col animate-spring-in`} onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-300 dark:border-gray-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Xero アシスタント</h2>
          <button onClick={onClose} className={`p-2 ${radius.full} hover:bg-gray-200 dark:hover:bg-gray-700`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && <div className={`w-8 h-8 ${accent.bg} ${radius.full} flex items-center justify-center text-white font-bold text-sm shrink-0 font-orbitron`}>X</div>}
              <div className={`p-3 max-w-lg ${radius.large} ${msg.role === 'user' ? `${accent.bg} text-white` : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
                {msg.parts[0].text}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
             <div className="flex items-start gap-3"><div className={`w-8 h-8 ${accent.bg} ${radius.full} flex items-center justify-center text-white font-bold text-sm shrink-0 font-orbitron`}>X</div><div className={`p-3 ${radius.large} bg-white dark:bg-gray-800`}><div className="flex space-x-1.5"><div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.2s]"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.1s]"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div></div></div></div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-gray-300 dark:border-gray-700 shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Xeroにメッセージを送信..."
              className={`w-full p-2 ${radius.main} bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 ${accent.focus}`}
              disabled={isLoading}
            />
            <button type="submit" className={`p-2 ${radius.main} ${accent.bg} ${accent.hover} text-white transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600`} disabled={isLoading || !input.trim()}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;