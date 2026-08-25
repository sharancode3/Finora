import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  X, Send, RotateCcw, ChevronDown, ChevronUp, 
  AlertTriangle, CheckCircle, Database,
  ArrowRight, Loader2, Calendar, CheckCircle2,
  BookOpen, HelpCircle, ShieldCheck
} from 'lucide-react';
import { useAI } from '../context/AIContext';
import { useTheme } from '../context/ThemeContext';
import { FormattedMarkdown } from './ui/FormattedMarkdown';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { pluralize } from '../utils/formatters';

export const LedgerCopilotPanel: React.FC = () => {
  const location = useLocation();
  const { isDark } = useTheme();
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

  // Keyboard shortcut: Escape to close
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isLoading) return;
    sendMessage(inputQuestion);
    setInputQuestion('');
  };

  const handleSuggestedClick = (question: string) => {
    sendMessage(question);
  };

  const toggleReasoning = (idx: number) => {
    setExpandedReasoningMap(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const getActiveScope = () => {
    if (!pageContext) return 'All Accounts (August 2026)';
    const accountName = pageContext.account_id && pageContext.account_id !== 'all'
      ? pageContext.account_id
      : 'All Accounts';
    const dates = pageContext.date_range 
      ? `${pageContext.date_range.start} → ${pageContext.date_range.end}`
      : 'Aug 1, 2026 – Aug 31, 2026';
    return `${accountName} (${dates})`;
  };

  // Dynamic context-aware suggested inquiries per page
  const getPageSuggestedQuestions = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) {
      return [
        "Why is our statutory match rate at its current level?",
        "Breakdown the ₹16.5k trapped in open exceptions",
        "Summarize today's controller briefing and anomalies"
      ];
    }
    if (path.includes('reconciliation')) {
      return [
        "Explain the discrepancy in transaction txn_82ad02738858",
        "Why did Razorpay batch PAY-00289 have an MDR fee variance?",
        "What are the un-reconciled items in August 2026?"
      ];
    }
    if (path.includes('exceptions')) {
      return [
        "Why are 3 fee variances clustered together?",
        "What is the root cause of the missing bank credit items?",
        "Recommend resolution actions for the open queue"
      ];
    }
    if (path.includes('cash-position')) {
      return [
        "Explain the deduction gap between gross volume and net cash",
        "What is the projected cash impact if settlements delay by 3 days?",
        "Breakdown the ₹29.1k in-transit float calculation"
      ];
    }
    if (path.includes('month-end-close')) {
      return [
        "What are the outstanding blockers preventing August close?",
        "Draft the executive month-end closing memo",
        "Explain the Benford's Law forensic flag on digit 5"
      ];
    }
    if (path.includes('record')) {
      return [
        "Investigate the 4-factor root cause for this specific record",
        "Compare the internal order vs payment gateway deduction",
        "What is the recommended reason code to resolve this exception?"
      ];
    }
    if (path.includes('linked-accounts') || path.includes('settings')) {
      return [
        "What is wrong with the HDFC Corporate Current Feed?",
        "Explain Segregation of Duties conflicts in our configuration",
        "How are API keys and gateway webhooks secured?"
      ];
    }
    return [
      "What is our statutory value match rate for August 2026?",
      "Summarize current open exceptions by severity",
      "Where and how is AI used in Finora?"
    ];
  };

  const suggestedQuestions = getPageSuggestedQuestions();

  return (
    <>
      {/* 1. PERSISTENT "ASK CONTROLLER" TRIGGER BUTTON */}
      {!isCopilotOpen && (
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-white hover:bg-slate-50 text-slate-800 px-3.5 py-2 rounded-full shadow-md flex items-center gap-2 cursor-pointer transition-all duration-150 ease-out border border-[#E4E4E7] hover:border-slate-300 group"
          title="Open Ask Controller Panel"
        >
          <div className="w-4 h-4 rounded bg-[#1E293B] text-white flex items-center justify-center text-[9px] font-mono font-bold shrink-0">
            F
          </div>
          <span className="text-xs font-semibold text-slate-900">Ask Controller</span>
        </button>
      )}

      {/* 2. GLOBAL SLIDE-OVER AI SIDE PANEL */}
      {isCopilotOpen && (
        <div className="fixed top-0 right-0 h-full w-[440px] max-w-[95vw] bg-white border-l border-[#E4E4E7] z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 ease-out">
          
          {/* Top Bar Header */}
          <div className="p-4 border-b border-[#E4E4E7] bg-slate-50/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs font-mono shrink-0 shadow-xs relative">
                F
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#15803D] border border-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-slate-900 tracking-tight">Fino • AI Controller</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#1E293B] border border-[#E2E8F0] font-mono">
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

          {/* ACTIVE AGENT CONTEXT CARD */}
          <div className="p-3.5 bg-slate-50 border-b border-[#E4E4E7] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Calendar size={12} className="text-[#1E293B]" /> Active Agent Context
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] flex items-center gap-1">
                <CheckCircle2 size={10} /> Ind AS Grounded
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-[#E4E4E7] space-y-1.5 text-[11px]">
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
                  <span className="font-semibold text-[#1E293B] font-mono text-[10px] truncate max-w-[210px]">
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
                    className="text-left text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 p-2.5 rounded-xl border border-[#E4E4E7] hover:border-slate-300 transition-colors duration-150 ease-out shadow-2xs flex items-center justify-between group cursor-pointer"
                  >
                    <span className="truncate font-medium">{inq}</span>
                    <ArrowRight size={12} className="text-slate-400 group-hover:text-slate-900 transition-colors shrink-0 ml-1.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MESSAGE STREAM */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] text-[#1E293B] flex items-center justify-center border border-[#E2E8F0] font-mono font-bold text-base">
                  F
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
                  <div className="bg-[#1E293B] text-white rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-[85%] text-xs font-medium shadow-xs">
                    {msg.content}
                  </div>
                ) : (
                  /* AI Grounded Response Card */
                  <div className="bg-white border border-[#E4E4E7] rounded-2xl rounded-tl-xs p-4 max-w-full text-xs shadow-xs space-y-3">
                    
                    {/* Single Confidence Status Badge in Header */}
                    {msg.metadata?.confidence && !msg.metadata?.is_greeting && (
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                          msg.metadata?.confidence === 'HIGH' 
                            ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]' 
                            : msg.metadata?.confidence === 'MEDIUM'
                            ? 'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]'
                            : 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
                        }`}>
                          {msg.metadata?.confidence === 'HIGH' ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
                          Confidence: {msg.metadata?.confidence === 'HIGH' ? 'High' : msg.metadata?.confidence === 'MEDIUM' ? 'Medium' : 'Low'} ({Math.round((msg.metadata?.confidence_score ?? 0.98) * 100)}%)
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Grounded Execution</span>
                      </div>
                    )}

                    {/* Grounded Content */}
                    <FormattedMarkdown content={msg.content} className="text-slate-800" />

                    {/* Curated Finance Knowledge Citation Card */}
                    {msg.metadata?.knowledge_citation && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <BookOpen size={13} className="text-[#1E293B]" />
                            <span>{msg.metadata.knowledge_citation.canonical_name}</span>
                          </div>
                          <span className="text-[10px] font-bold text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                            {msg.metadata.knowledge_citation.category}
                          </span>
                        </div>
                        
                        <div className="text-[10px] text-slate-500 font-medium">
                          <span>Statutory Standard: </span>
                          <strong className="text-slate-700">{msg.metadata.knowledge_citation.statutory_reference}</strong>
                        </div>

                        {/* Related Concepts Quick Click Tags */}
                        {msg.metadata.knowledge_citation.related_terms && msg.metadata.knowledge_citation.related_terms.length > 0 && (
                          <div className="pt-1 border-t border-slate-200/60 flex items-center gap-1 flex-wrap">
                            <span className="text-[10px] font-semibold text-slate-500">Related Terms:</span>
                            {msg.metadata.knowledge_citation.related_terms.map((rt: string, rIdx: number) => (
                              <button
                                key={rIdx}
                                onClick={() => handleSuggestedClick(`What is ${rt.replace(/_/g, ' ')}?`)}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-[#1E293B] hover:text-white hover:border-[#1E293B] transition-colors cursor-pointer"
                              >
                                {rt.replace(/_/g, ' ')}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Recommended Controller Action Callout */}
                    {msg.metadata?.escalation_recommendation && (
                      <div className="p-2.5 bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl flex items-start gap-2 text-[11px] text-[#B45309]">
                        <AlertTriangle size={13} className="text-[#B45309] shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold block text-slate-900">Recommended Controller Action:</strong>
                          <span className="text-slate-700">{msg.metadata.escalation_recommendation}</span>
                        </div>
                      </div>
                    )}

                    {/* Embedded Mini Chart if visual_data present */}
                    {msg.metadata?.visual_data && (
                      <div className="bg-slate-50 border border-[#E4E4E7] rounded-xl p-3 space-y-2">
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
                                    <Cell key={`cell-${i}`} fill={entry.color || '#1E293B'} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  formatter={(val: any) => [`${val}%`, '']} 
                                  contentStyle={{ 
                                    backgroundColor: isDark ? '#151B24' : '#FFFFFF', 
                                    borderRadius: '12px', 
                                    border: `1px solid ${isDark ? '#262D38' : '#e4e4e7'}`, 
                                    color: isDark ? '#F3F4F6' : '#111827',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' 
                                  }}
                                />
                              </PieChart>
                            ) : (
                              <BarChart data={msg.metadata.visual_data.data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 9, fill: isDark ? '#9CA3AF' : '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 9, fill: isDark ? '#9CA3AF' : '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip 
                                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Value']} 
                                  contentStyle={{ 
                                    backgroundColor: isDark ? '#151B24' : '#FFFFFF', 
                                    borderRadius: '12px', 
                                    border: `1px solid ${isDark ? '#262D38' : '#e4e4e7'}`, 
                                    color: isDark ? '#F3F4F6' : '#111827',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' 
                                  }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                  {msg.metadata.visual_data.data.map((entry: any, i: number) => (
                                    <Cell key={`bar-${i}`} fill={entry.color || '#1E293B'} />
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
                      <div className="border border-[#E4E4E7] rounded-xl overflow-hidden bg-slate-50/60">
                        <button
                          onClick={() => toggleReasoning(idx)}
                          className="w-full px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <Database size={12} className="text-[#1E293B]" />
                            Show Evidence Trail ({pluralize((msg.metadata.evidence_trail || msg.metadata.reasoning_trail).length, 'tool step', 'tool steps')})
                          </span>
                          {expandedReasoningMap[idx] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        
                        {expandedReasoningMap[idx] && (
                          <div className="p-3 border-t border-[#E4E4E7] bg-white space-y-2 text-[11px]">
                            {(msg.metadata.evidence_trail || msg.metadata.reasoning_trail).map((step: any, sIdx: number) => (
                              <div key={sIdx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-[#F1F5F9] text-[#1E293B] border border-[#E2E8F0] text-[9px] flex items-center justify-center font-bold">
                                      {step.step_number || (sIdx + 1)}
                                    </span>
                                    Tool: <span className="text-[#1E293B] font-mono">{step.tool || 'query'}</span>
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
              <div className="flex items-center gap-2 p-3 bg-[#F1F5F9] text-[#1E293B] rounded-2xl rounded-tl-xs text-xs font-medium border border-[#E2E8F0] max-w-[85%]">
                <Loader2 size={14} className="animate-spin text-[#1E293B]" />
                <span>Executing read-only ledger tools &amp; verifier check...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* BOTTOM INPUT AREA */}
          <div className="p-3.5 border-t border-[#E4E4E7] bg-white space-y-2">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder={`Ask Fino about ${pageContext?.page_name || 'this ledger'}...`}
                disabled={isLoading}
                className="flex-1 bg-slate-50 border border-[#E4E4E7] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:bg-white font-medium transition-all"
              />
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isLoading}
                className="p-2.5 bg-[#1E293B] hover:bg-[#0F172A] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 disabled:cursor-not-allowed"
                title="Send Query"
              >
                <Send size={14} />
              </button>
            </form>

            <div className="px-1 text-[10px] text-slate-500 flex items-center justify-between">
              <span>AI Grounding: verified ledger records with evidence trail</span>
              <Link to="/ask-your-books" onClick={() => setIsCopilotOpen(false)} className="text-[#1E293B] hover:underline font-semibold">
                Full Canvas →
              </Link>
            </div>
          </div>

        </div>
      )}
    </>
  );
};
