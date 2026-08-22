import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../context/AIContext';
import { Bot, User, Send, CheckCircle, AlertTriangle, FileText, LayoutDashboard, History, Sparkles, Loader2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export default function AskYourBooks() {
  const { messages, sendMessage, isLoading } = useAI();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const query = input;
    setInput('');
    await sendMessage(query);
  };

  const handleSuggestedAsk = (q: string) => {
    setInput('');
    sendMessage(q);
  };

  return (
    <div className="h-full flex gap-6 pb-6">
      
      {/* Left 60%: Chat Interface */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-border shadow-sm overflow-hidden min-h-[600px]">
        <div className="p-4 border-b border-border bg-slate-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center text-primary-accent">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 leading-tight">AI Visual Canvas</h2>
            <p className="text-[11px] text-slate-500 font-medium">Ask questions, get verified data and charts</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Bot size={48} className="mb-4 opacity-50" />
              <p className="text-sm font-medium">Start a conversation to analyze your reconciliation data.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary-accent text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`p-4 rounded-xl text-[14px] leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary-accent text-white rounded-tr-sm' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {msg.role === 'ai' && msg.metadata && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
                        {msg.metadata.verifier_passed === true && (
                          <div className="flex items-center gap-1.5 text-emerald-600 text-[12px] font-bold">
                            <CheckCircle size={14} /> Verified by Finora
                          </div>
                        )}
                        {msg.metadata.verifier_passed === false && (
                          <div className="flex items-center gap-1.5 text-amber-600 text-[12px] font-bold">
                            <AlertTriangle size={14} /> Limited data available
                          </div>
                        )}
                        {msg.metadata.evidence_record_ids && msg.metadata.evidence_record_ids.length > 0 && (
                          <div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <FileText size={12} /> Evidence ({msg.metadata.evidence_record_ids.length} records)
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.metadata.evidence_record_ids.map((id: string) => (
                                <Badge key={id} variant="outline" className="text-[10px] py-0.5 border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 cursor-pointer">
                                  {id}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-4 max-w-[90%]">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-slate-200 text-slate-500 rounded-xl rounded-tl-sm p-4 shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Analyzing your books...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-border">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your reconciliation data..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-4 pr-14 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-accent focus:ring-1 focus:ring-primary-accent resize-none h-20"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-4 bottom-4 w-8 h-8 bg-primary-accent text-white rounded-md flex items-center justify-center disabled:opacity-50 hover:bg-indigo-700 transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Right 40%: Context Panel */}
      <div className="w-[350px] flex flex-col gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <LayoutDashboard size={16} /> Current Context
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Business</span>
              <span className="font-medium text-slate-900">Demo Org</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Date Range</span>
              <span className="font-medium text-slate-900">Last 7 Days</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Active Batch</span>
              <span className="font-medium text-slate-900">batch_latest</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-border shadow-sm flex-1">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" /> Suggested Questions
          </h3>
          <div className="flex flex-col gap-2">
            {[
              "Why was I paid less on settlement PAY-00293?",
              "What is the total of all exceptions?",
              "What is my match rate?",
              "Which business has the highest unresolved amount?"
            ].map(q => (
              <button 
                key={q}
                onClick={() => handleSuggestedAsk(q)}
                className="text-left p-3 rounded-lg border border-slate-200 bg-slate-50 text-[13px] text-slate-700 hover:border-primary-accent hover:bg-indigo-50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-slate-700 mt-8 mb-4 flex items-center gap-2">
            <History size={16} /> Recent Investigations
          </h3>
          <div className="space-y-2">
            <div className="text-[13px] text-slate-600 hover:text-primary-accent cursor-pointer">PAY-00291 Exception Review</div>
            <div className="text-[13px] text-slate-600 hover:text-primary-accent cursor-pointer">Fee Variance Analysis</div>
          </div>
        </div>

      </div>

    </div>
  );
}
