import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Sparkles, X, Send, RotateCcw, ChevronDown, ChevronUp, 
  ShieldCheck, AlertTriangle, CheckCircle, Database, HelpCircle,
  Activity, ArrowRight
} from 'lucide-react';
import { useAI } from '../context/AIContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';

export const LedgerCopilotPanel: React.FC = () => {
  const location = useLocation();
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    clearMessages, 
    pageContext, 
    isCopilotOpen, 
    setIsCopilotOpen 
  } = useAI();

  const [inputQuestion, setInputQuestion] = useState('');
  const [expandedReasoningMap, setExpandedReasoningMap] = useState<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Do not show on landing page or full-screen Ask Your Books canvas
  const isExcludedRoute = location.pathname === '/' || location.pathname === '/ask-your-books';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isCopilotOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCopilotOpen]);

  if (isExcludedRoute) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isLoading) return;
    const q = inputQuestion.trim();
    setInputQuestion('');
    try {
      await sendMessage(q);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuggestedClick = async (q: string) => {
    if (isLoading) return;
    try {
      await sendMessage(q);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleReasoning = (msgIndex: number) => {
    setExpandedReasoningMap(prev => ({
      ...prev,
      [msgIndex]: !prev[msgIndex]
    }));
  };

  return (
    <>
      {/* 1. FLOATING CONTEXTUAL LAUNCHER (FAB) */}
      {!isCopilotOpen && (
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white w-13 h-13 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-white group"
          title="Open Ledger Copilot"
        >
          <Sparkles size={22} className="group-hover:rotate-12 transition-transform" />
          <span className="sr-only">Open Ledger Copilot</span>
          
          {/* Subtle contextual hint badge */}
          {pageContext && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
          )}
        </button>
      )}

      {/* 2. SLIDE-OVER CONTEXTUAL COPILOT PANEL */}
      {isCopilotOpen && (
        <div className="fixed top-0 right-0 h-full w-[420px] max-w-[95vw] bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
          
          {/* Top Bar Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-slate-900 tracking-tight">Ledger Copilot</h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-mono">
                    Grounded AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Page-aware deterministic finance assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearMessages}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                title="Reset Conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setIsCopilotOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                title="Close Panel"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Active Page Context Strip */}
          {pageContext && (
            <div className="px-4 py-2 bg-indigo-50/60 border-b border-indigo-100/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-indigo-900 font-medium truncate">
                <Activity size={12} className="text-indigo-600 shrink-0" />
                <span className="truncate">
                  Viewing: <strong className="font-bold">{pageContext.page_name}</strong>
                </span>
              </div>
              <span className="text-[10px] bg-white text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200 font-mono shrink-0">
                Live State
              </span>
            </div>
          )}

          {/* Dynamic Contextual Suggested Inquiries */}
          {pageContext?.suggested_inquiries && pageContext.suggested_inquiries.length > 0 && messages.length <= 1 && (
            <div className="p-3.5 bg-slate-50 border-b border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Suggested for this view:
              </span>
              <div className="flex flex-col gap-1.5">
                {pageContext.suggested_inquiries.map((inq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedClick(inq)}
                    disabled={isLoading}
                    className="text-left text-xs bg-white hover:bg-indigo-50/60 text-slate-700 hover:text-indigo-700 p-2 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors shadow-2xs flex items-center justify-between group cursor-pointer"
                  >
                    <span className="truncate font-medium">{inq}</span>
                    <ArrowRight size={12} className="text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0 ml-1.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sparkles size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-700">How can I assist your review?</h4>
                  <p className="text-xs text-slate-500 max-w-xs">
                    I have live read-only context of this <strong className="text-slate-800">{pageContext?.page_name || 'ledger'}</strong> view. Ask about variances, anomalies, or cash metrics.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* User Message */}
                {msg.role === 'user' ? (
                  <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-[85%] text-xs font-medium shadow-xs">
                    {msg.content}
                  </div>
                ) : (
                  /* AI Grounded Response Card */
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 max-w-full text-xs shadow-xs space-y-3">
                    
                    {/* Confidence Pill & Verifier Badge */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          msg.metadata?.confidence === 'HIGH' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : msg.metadata?.confidence === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {msg.metadata?.confidence === 'HIGH' ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                          {msg.metadata?.confidence || 'HIGH'} ({Math.round((msg.metadata?.confidence_score ?? 0.95) * 100)}%)
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">100% Grounded</span>
                      </div>
                      
                      <span className="text-[10px] text-slate-400">Read-Only</span>
                    </div>

                    {/* Grounded Content */}
                    <div className="text-slate-800 leading-relaxed space-y-2 whitespace-pre-wrap font-normal">
                      {msg.content.split('\n').map((paragraph, pIdx) => (
                        <p key={pIdx}>
                          {paragraph.split('**').map((chunk, cIdx) => 
                            cIdx % 2 === 1 ? <strong key={cIdx} className="font-bold text-slate-900">{chunk}</strong> : chunk
                          )}
                        </p>
                      ))}
                    </div>

                    {/* Recommended Controller Action Callout */}
                    {msg.metadata?.escalation_recommendation && (
                      <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-2 text-[11px] text-amber-900">
                        <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold block">Recommended Controller Action:</strong>
                          <span>{msg.metadata.escalation_recommendation}</span>
                        </div>
                      </div>
                    )}

                    {/* Embedded Mini Chart if visual_data present */}
                    {msg.metadata?.visual_data && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          {msg.metadata.visual_data.title}
                        </span>
                        <div className="h-32 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            {msg.metadata.visual_data.type === 'pie' ? (
                              <PieChart>
                                <Pie
                                  data={msg.metadata.visual_data.data}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={22}
                                  outerRadius={38}
                                  paddingAngle={4}
                                >
                                  {msg.metadata.visual_data.data.map((entry: any, i: number) => (
                                    <Cell key={`cell-${i}`} fill={entry.color || '#6366f1'} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(val: any) => [`${val}%`, '']} />
                              </PieChart>
                            ) : (
                              <BarChart data={msg.metadata.visual_data.data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Value']} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                  {msg.metadata.visual_data.data.map((entry: any, i: number) => (
                                    <Cell key={`bar-${i}`} fill={entry.color || '#6366f1'} />
                                  ))}
                                </Bar>
                              </BarChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Inspectable Reasoning Trail Accordion */}
                    {msg.metadata?.reasoning_trail && msg.metadata.reasoning_trail.length > 0 && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/60">
                        <button
                          onClick={() => toggleReasoning(idx)}
                          className="w-full px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <Database size={12} className="text-indigo-600" />
                            Inspectable Reasoning Trail ({msg.metadata.reasoning_trail.length} steps)
                          </span>
                          {expandedReasoningMap[idx] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        
                        {expandedReasoningMap[idx] && (
                          <div className="p-3 border-t border-slate-200 bg-white space-y-2 text-[11px] font-mono">
                            {msg.metadata.reasoning_trail.map((step: any, sIdx: number) => (
                              <div key={sIdx} className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                                <div className="flex items-center justify-between text-indigo-700 font-bold">
                                  <span>Step {step.step_number}: {step.tool}</span>
                                </div>
                                <div className="text-slate-600 text-[10px]">{step.action}</div>
                                <div className="text-slate-800 text-[10px] bg-white p-1.5 rounded border border-slate-200">
                                  <strong>Observation:</strong> {step.observation}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Evidence Record IDs */}
                    {msg.metadata?.evidence_record_ids && msg.metadata.evidence_record_ids.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px] text-slate-500 font-mono">
                        <span className="font-sans font-semibold">Evidence:</span>
                        {msg.metadata.evidence_record_ids.map((id: string, iIdx: number) => (
                          <span key={iIdx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                            {id}
                          </span>
                        ))}
                      </div>
                    )}

                  </div>
                )}

              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-indigo-50 text-indigo-700 rounded-2xl rounded-tl-xs text-xs font-medium border border-indigo-100 max-w-[80%]">
                <Sparkles size={14} className="animate-spin" />
                <span>Executing read-only ledger tools & verifier check...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Area */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder={`Ask about ${pageContext?.page_name || 'this ledger'}...`}
              disabled={isLoading}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
            />
            <button
              type="submit"
              disabled={!inputQuestion.trim() || isLoading}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
              title="Send Query"
            >
              <Send size={15} />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
