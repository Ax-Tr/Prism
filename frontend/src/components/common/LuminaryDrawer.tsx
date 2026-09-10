import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LuminaryDrawer: React.FC = () => {
  const { luminaryOpen, setLuminaryOpen, chatMessages, sendLuminaryMessage } = useApp();
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendLuminaryMessage(inputText);
    setInputText('');
  };

  return (
    <>
      {/* Floating Luminary AI Trigger Button at Bottom Right */}
      <button
        onClick={() => setLuminaryOpen(!luminaryOpen)}
        className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-white shadow-2xl shadow-sky-500/30 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center border border-white/20"
        title="Open Luminary AI Chief Operating Officer"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
      </button>

      {/* Slide-Over Drawer */}
      {luminaryOpen && (
        <div className="fixed bottom-20 right-4 md:right-8 z-50 w-88 sm:w-96 glass-panel rounded-3xl border border-white/15 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 h-[520px]">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-slate-900/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-purple-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  Luminary AI <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">COO</span>
                </h3>
                <p className="text-[11px] text-slate-400">Chief Operating Officer Agent</p>
              </div>
            </div>
            <button
              onClick={() => setLuminaryOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center gap-2 overflow-x-auto text-[11px]">
            <button
              onClick={() => sendLuminaryMessage('Summarize team velocity')}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 whitespace-nowrap"
            >
              ⚡ Velocity Summary
            </button>
            <button
              onClick={() => sendLuminaryMessage('Check risk flags')}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 whitespace-nowrap"
            >
              🛡️ Risk Signals
            </button>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'luminary' && (
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-sky-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-white/10 text-slate-200 border border-white/10 rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="block mt-1 text-[9px] opacity-60 text-right font-mono">{msg.timestamp}</span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-white/10 flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask Luminary COO about operational strategy..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
