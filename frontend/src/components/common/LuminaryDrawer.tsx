import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, ShieldCheck, Link2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LuminaryDrawer: React.FC = () => {
  const { luminaryOpen, setLuminaryOpen, chatMessages, sendLuminaryMessage, sanctumSettings } = useApp();
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSubmitting) return;
    const text = inputText;
    setInputText('');
    setIsSubmitting(true);
    try {
      await sendLuminaryMessage(text);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await sendLuminaryMessage(prompt);
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="fixed bottom-20 right-4 md:right-8 z-50 w-96 md:w-[440px] glass-panel rounded-3xl border border-white/15 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 h-[600px]">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-slate-900/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400 to-purple-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Bot className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  {sanctumSettings.aiAvatarPersona || 'Luminary AI'}{' '}
                  <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                    {sanctumSettings.autonomyLevel || 'COO'}
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Grounded RAG v2.4 • PII Masked
                </p>
              </div>
            </div>
            <button
              onClick={() => setLuminaryOpen(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center gap-2 overflow-x-auto text-[11px]">
            <button
              onClick={() => handleQuickPrompt('Executive briefing & velocity summary')}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 whitespace-nowrap transition-colors"
            >
              ⚡ Executive Briefing
            </button>
            <button
              onClick={() => handleQuickPrompt('Check risk flags and critical blockers')}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 whitespace-nowrap transition-colors"
            >
              🛡️ Risk Signals
            </button>
            <button
              onClick={() => handleQuickPrompt('Summarize corporate OKR progress')}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 whitespace-nowrap transition-colors"
            >
              🎯 Strategic Goals
            </button>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatMessages.map((msg) => (
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
                  className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed space-y-2.5 ${
                    msg.sender === 'user'
                      ? 'bg-sky-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-white/10 text-slate-200 border border-white/10 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-invert max-w-none text-xs leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Evidence Citations */}
                  {msg.evidenceCitations && msg.evidenceCitations.length > 0 && (
                    <div className="pt-2 border-t border-white/10 space-y-1.5">
                      <span className="text-[10px] font-mono text-sky-300 uppercase tracking-wider flex items-center gap-1">
                        <Link2 className="w-3 h-3 text-sky-400" /> Verified Evidence Citations:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.evidenceCitations.map((c) => (
                          <div
                            key={c.id}
                            title={c.snippet}
                            className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-[10px] font-mono text-slate-300 hover:text-sky-300 hover:border-sky-500/40 cursor-default transition-all"
                          >
                            [{c.type.toUpperCase()}] {c.title.length > 24 ? c.title.substring(0, 24) + '...' : c.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="pt-2 border-t border-white/10 space-y-1">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                        Recommended Actions:
                      </span>
                      <div className="space-y-1">
                        {msg.recommendations.map((rec, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickPrompt(`Execute action: ${rec}`)}
                            className="w-full text-left p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-[10px] text-emerald-300 flex items-center justify-between group transition-colors"
                          >
                            <span>• {rec}</span>
                            <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata Footer */}
                  <div className="flex items-center justify-between pt-1 text-[9px] font-mono opacity-60">
                    <span>{msg.model || 'Luminary-COO'}</span>
                    <div className="flex items-center gap-2">
                      {msg.confidenceScore && (
                        <span className="text-emerald-300 font-bold">
                          {Math.round(msg.confidenceScore * 100)}% Confidence
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
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
          <form onSubmit={handleSend} className="p-3 border-t border-white/10 flex items-center space-x-2 bg-slate-950/60">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSubmitting}
              placeholder="Ask Luminary COO about strategy, SLAs, or blockers..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSubmitting || !inputText.trim()}
              className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold transition-all shadow-lg shadow-sky-500/20"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

