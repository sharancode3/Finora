import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Sparkles, X, Send, RotateCcw, ChevronDown, ChevronUp, 
  ShieldCheck, AlertTriangle, CheckCircle, Database, HelpCircle,
  Activity, ArrowRight, Loader2, Calendar, Lock, CheckCircle2
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

  // Handle escape key to close panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCopilotOpen) {
        setIsCopilotOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCopilotOpen, setIsCopilotOpen]);

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

  // Resolve active scope from localStorage
  const getActiveScope = () => {
    try {
      const stored = localStorage.getItem('finora_dashboard_range');
      if (stored) {
        const parsed = JSON.parse(stored);
        return `${parsed.start} to ${parsed.end}`;
      }
    } catch (e) {}
    return 'Aug 01, 2026 to Aug 31, 2026';
  };

  // Dynamic context-aware suggested questions based on active route
  const getPageSuggestedQuestions = () => {
    if (pageContext?.suggested_inquiries && pageContext.suggested_inquiries.length > 0) {
      return pageContext.suggested_inquiries.slice(0, 4);
    }

    const path = location.pathname;
    if (path.includes('/exceptions')) {
      return [
        "Which exception has the highest composite risk score?",
        "Explain the largest fee discrepancy in the queue",
        "Why did exception exc_c4c2b81321b9 occur?",
        "Show open exceptions with aging over 3 days"
      ];
    } else if (path.includes('/cash-position')) {
      return [
        "Why did the 7-day forecast change?",
        "What is the cash impact if settlements are delayed by 3 days?",
        "How much cash is trapped in open exceptions?",
        "Explain our settlement transit latency (DSO)"
      ];
    } else if (path.includes('/month-end-close')) {
      return [
        "What's needed to clear open suspense items?",
        "Draft the August 2026 month-end closing memo",
        "Are all 5 statutory checklist pillars passing?",
        "Explain the period-over-period delta variance"
      ];
    } else if (path.includes('/accounts') || path.includes('/linked-accounts')) {
      return [
        "Why did Kotak receive more volume than HDFC?",
        "Which account did PayPal settle to and how much?",
        "Are all gateway and bank feeds syncing on schedule?",
        "What is the reconciliation status across active rails?"
      ];
    } else if (path.includes('/record/')) {
      return [
        "Run full 4-factor root-cause investigation",
        "Verify contract MDR rate (2.0%) against actual charge",
        "Explain the T+2 bank transit timing",
        "What is the recommended resolution action?"
      ];
    } else if (path.includes('/settings')) {
      return [
        "Explain Segregation of Duties conflicts between Exception Resolution and API Keys",
        "Where and how is AI used in Finora?",
        "What notification triggers are recommended for controllers?"
      ];
    }

    // Default for Dashboard and others
    return [
      "What is my statutory value match rate and settled amount?",
      "Summarize today's controller briefing",
      "Check our Benford forensic status and anomaly outliers",
      "Where and how is AI used in Finora?"
    ];
  };

  const suggestedQuestions = getPageSuggestedQuestions();

  return (
    <>
      {/* 1. PERSISTENT, CALM "ASK CONTROLLER" TRIGGER BUTTON */}
      {!isCopilotOpen && (
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-white hover:bg-slate-50 text-slate-800 px-3.5 py-2 rounded-full shadow-md flex items-center gap-2 cursor-pointer transition-all duration-150 ease-out border border-slate-200 hover:border-[#5B45F5]/40 group"
          title="Open Ask Controller Panel"
        >
          <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
          <Sparkles size={14} className="text-[#5B45F5]" />
          <span className="text-xs font-semibold text-slate-800">Ask Controller</span>
        </button>
      )}

      {/* 2. GLOBAL SLIDE-OVER AI SIDE PANEL */}
      {isCopilotOpen && (
        <div className="fixed top-0 right-0 h-full w-[440px] max-w-[95vw] bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 ease-out">
          
          {/* Top Bar Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EEEBFF] border border-[#DDD7FE] flex items-center justify-center text-[#5B45F5] shrink-0 relative shadow-2xs">
                <Sparkles size={16} />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#16A34A] border border-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-slate-900 tracking-tight">Fino • AI Controller</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EEEBFF] text-[#5B45F5] border border-[#DDD7FE] font-mono">
                    Grounded
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Live ledger context &amp; deterministic verification</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearMessages}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                title="Reset Conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setIsCopilotOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                title="Close Panel (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ACTIVE AGENT CONTEXT CARD (Reusing Ask Your Books Pattern) */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Calendar size={12} className="text-[#5B45F5]" /> Active Agent Context
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#ECFDF3] text-[#16A34A] border border-[#BBF7D0] flex items-center gap-1">
                <CheckCircle2 size={10} /> Ind AS Grounded
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Current View:</span>
                <span className="font-bold text-slate-900 truncate max-w-[210px]">
                  {pageContext?.page_name || 'Executive Command Center'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Active Scope:</span>
                <span className="font-semibold text-slate-800 font-mono text-[10px]">
                  {getActiveScope()}
                </span>
              </div>
              {pageContext?.visible_metrics && Object.keys(pageContext.visible_metrics).length > 0 && (
                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Live State:</span>
                  <span className="font-semibold text-[#5B45F5] font-mono text-[10px] truncate max-w-[210px]">
                    {Object.entries(pageContext.visible_metrics).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* CONTEXT-AWARE SUGGESTED INQUIRIES */}
          {suggestedQuestions.length > 0 && messages.length <= 1 && (
            <div className="p-3.5 bg-white border-b border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Suggested for {pageContext?.page_name || 'this page'}:
              </span>
              <div className="flex flex-col gap-1.5">
                {suggestedQuestions.map((inq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedClick(inq)}
                    disabled={isLoading}
                    className="text-left text-xs bg-slate-50 hover:bg-[#EEEBFF]/60 text-slate-700 hover:text-[#5B45F5] p-2.5 rounded-xl border border-slate-200 hover:border-[#DDD7FE] transition-colors duration-150 ease-out shadow-2xs flex items-center justify-between group cursor-pointer"
                  >
                    <span className="truncate font-medium">{inq}</span>
                    <ArrowRight size={12} className="text-slate-400 group-hover:text-[#5B45F5] transition-colors shrink-0 ml-1.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MESSAGE STREAM */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-[#EEEBFF] text-[#5B45F5] flex items-center justify-center border border-[#DDD7FE]">
                  <Sparkles size={22} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-700">How can Fino assist your review?</h4>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    I have live read-only context of this <strong className="text-slate-800">{pageContext?.page_name || 'ledger'}</strong> view. Ask about variances, anomalies, or cash metrics.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* User Message */}
                {msg.role === 'user' ? (
                  <div className="bg-[#5B45F5] text-white rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-[85%] text-xs font-medium shadow-xs">
                    {msg.content}
                  </div>
                ) : (
                  /* AI Grounded Response Card */
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 max-w-full text-xs shadow-xs space-y-3">
                    
                    {/* Single Confidence Status Badge in Header */}
                    {msg.metadata?.confidence && !msg.metadata?.is_greeting && (
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                          msg.metadata?.confidence === 'HIGH' 
                            ? 'bg-[#ECFDF3] text-[#16A34A] border-[#BBF7D0]' 
                            : msg.metadata?.confidence === 'MEDIUM'
                            ? 'bg-[#FFF7ED] text-[#D97706] border-[#FED7AA]'
                            : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                        }`}>
                          {msg.metadata?.confidence === 'HIGH' ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
                          Confidence: {msg.metadata?.confidence === 'HIGH' ? 'High' : msg.metadata?.confidence === 'MEDIUM' ? 'Medium' : 'Low'} ({Math.round((msg.metadata?.confidence_score ?? 0.98) * 100)}%)
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Grounded Execution</span>
                      </div>
                    )}

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
                      <div className="p-2.5 bg-[#FFF7ED] border border-[#FED7AA] rounded-xl flex items-start gap-2 text-[11px] text-[#D97706]">
                        <AlertTriangle size={13} className="text-[#D97706] shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold block text-slate-900">Recommended Controller Action:</strong>
                          <span className="text-slate-700">{msg.metadata.escalation_recommendation}</span>
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
                                    <Cell key={`cell-${i}`} fill={entry.color || '#5B45F5'} />
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
                                    <Cell key={`bar-${i}`} fill={entry.color || '#5B45F5'} />
                                  ))}
                                </Bar>
                              </BarChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Inspectable Evidence Trail Accordion */}
                    {((msg.metadata?.evidence_trail || msg.metadata?.reasoning_trail) && (msg.metadata?.evidence_trail || msg.metadata?.reasoning_trail).length > 0) && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/60">
                        <button
                          onClick={() => toggleReasoning(idx)}
                          className="w-full px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <Database size={12} className="text-[#5B45F5]" />
                            Show Evidence Trail ({(msg.metadata.evidence_trail || msg.metadata.reasoning_trail).length} tool steps)
                          </span>
                          {expandedReasoningMap[idx] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        
                        {expandedReasoningMap[idx] && (
                          <div className="p-3 border-t border-slate-200 bg-white space-y-2 text-[11px]">
                            {(msg.metadata.evidence_trail || msg.metadata.reasoning_trail).map((step: any, sIdx: number) => (
                              <div key={sIdx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-[#EEEBFF] text-[#5B45F5] text-[9px] flex items-center justify-center font-bold">
                                      {step.step_number || (sIdx + 1)}
                                    </span>
                                    Tool: <span className="text-[#5B45F5] font-mono">{step.tool || 'query'}</span>
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium">{step.action}</span>
                                </div>
                                <p className="text-slate-600 text-[11px] pl-5 leading-tight">
                                  {step.observation}
                                </p>
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
              <div className="flex items-center gap-2 p-3 bg-[#EEEBFF] text-[#5B45F5] rounded-2xl rounded-tl-xs text-xs font-medium border border-[#DDD7FE] max-w-[85%]">
                <Loader2 size={14} className="animate-spin text-[#5B45F5]" />
                <span>Executing read-only ledger tools &amp; verifier check...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* BOTTOM INPUT & GROUNDING AREA */}
          <div className="p-3.5 border-t border-slate-200 bg-white space-y-2">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder={`Ask Fino about ${pageContext?.page_name || 'this ledger'}...`}
                disabled={isLoading}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B45F5] focus:bg-white font-medium transition-all"
              />
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isLoading}
                className="p-2.5 bg-[#5B45F5] hover:bg-[#4C35E8] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 disabled:cursor-not-allowed"
                title="Send Query"
              >
                <Send size={14} />
              </button>
            </form>

            <div className="px-1 text-[10px] text-slate-500 flex items-center justify-between">
              <span>AI Grounding: verified ledger records with evidence trail</span>
              <Link to="/ask-your-books" onClick={() => setIsCopilotOpen(false)} className="text-[#5B45F5] hover:underline font-medium">
                Full Canvas →
              </Link>
            </div>
          </div>

        </div>
      )}
    </>
  );
};
