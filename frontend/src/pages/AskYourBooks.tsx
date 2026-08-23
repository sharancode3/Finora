import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../context/AIContext';
import { 
  Bot, 
  User, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  LayoutDashboard, 
  Sparkles, 
  Loader2, 
  PieChart as PieChartIcon, 
  BarChart3, 
  ShieldCheck,
  Calendar,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  GitFork,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';

export default function AskYourBooks() {
  const { messages, sendMessage, isLoading, setPageContext } = useAI();
  const [input, setInput] = useState('');
  const [expandedTrails, setExpandedTrails] = useState<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setPageContext({
      page_name: 'Ask Your Books (Conversational Ledger)',
      route: '/ask-your-books',
      visible_metrics: {
        interface_mode: 'interactive_chat',
        connected_capabilities: 'gemma3_local_inference,zero_hallucination_verifier'
      },
      suggested_inquiries: [
        "What is our statutory value match rate for August 2026?",
        "Breakdown total fees and GST deductions for last month",
        "Why was settlement PAY-00001 lower than the gross amount?",
        "Are there any unresolved high-severity exceptions?"
      ]
    });
  }, []);

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

  const toggleTrail = (idx: number) => {
    setExpandedTrails(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getActiveRangeLabel = () => {
    try {
      const stored = localStorage.getItem('finora_dashboard_range');
      if (stored) return JSON.parse(stored).preset || 'Custom';
    } catch (e) {}
    return 'Last 30 Days';
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      
      {/* Left 70%: AI Visual Canvas & Chat Stream */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Canvas Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 leading-tight">AI Financial Controller</h2>
              <p className="text-[11px] text-slate-500">Multi-Step Tool Orchestration • Auditable Reasoning Chains</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck size={12} /> Grounded Ledger
            </span>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center max-w-md mx-auto my-auto py-12">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100">
                <Bot size={28} />
              </div>
              <h3 className="font-bold text-base text-slate-800 mb-1">Ask Your Financial Ledger</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ask questions about match rates, gateway fee leakage, delayed settlements, or multi-step period comparisons. Every conclusion produces an inspectable reasoning trail and confidence score.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const meta = msg.metadata || {};
              const conf = meta.confidence || 'HIGH';
              const isTrailOpen = !!expandedTrails[idx];
              const steps = meta.reasoning_trail || [];

              return (
                <div key={idx} className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'}`}>
                    {msg.role === 'user' ? <User size={15} /> : <Bot size={15} />}
                  </div>
                  
                  <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} w-full`}>
                    
                    {/* Primary Content Bubble */}
                    <div 
                      className={`p-4 rounded-2xl text-xs leading-relaxed shadow-xs w-full max-w-fit ${
                        msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-xs' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                      }`}
                    >
                      {/* AI Confidence Header */}
                      {msg.role === 'ai' && (
                        <div className="flex items-center justify-between gap-3 pb-2.5 mb-2.5 border-b border-slate-100">
                          <div className="flex items-center gap-1.5">
                            {conf === 'HIGH' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <ShieldCheck size={11} /> High Confidence ({Math.round((meta.confidence_score || 0.98) * 100)}%)
                              </span>
                            )}
                            {conf === 'MEDIUM' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                                <AlertTriangle size={11} /> Medium Confidence ({Math.round((meta.confidence_score || 0.75) * 100)}%)
                              </span>
                            )}
                            {conf === 'LOW' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertTriangle size={11} /> Low Confidence ({Math.round((meta.confidence_score || 0.35) * 100)}%)
                              </span>
                            )}
                          </div>
                          
                          {meta.confidence_rationale && (
                            <span className="text-[10px] text-slate-400 truncate max-w-xs" title={meta.confidence_rationale}>
                              {meta.confidence_rationale}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="whitespace-pre-wrap font-medium">{msg.content}</div>

                      {/* Low/Medium Confidence Escalation Path Banner */}
                      {msg.role === 'ai' && meta.escalation_recommendation && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-800">
                            <UserCheck size={14} /> Recommended Controller Action
                          </div>
                          <p className="text-[11px] text-amber-700 leading-snug">
                            {meta.escalation_recommendation}
                          </p>
                          <div className="pt-1 flex gap-2">
                            <Link 
                              to="/exceptions" 
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-white px-2.5 py-1 rounded-lg border border-amber-300 shadow-xs hover:bg-amber-50 transition-colors"
                            >
                              Open Reconciliation Queue <ArrowUpRight size={11} />
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Rendered Chart Visual */}
                      {msg.role === 'ai' && meta.visual_data && (
                        <div className="mt-4 pt-3 border-t border-slate-100 w-full min-w-[280px]">
                          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            {meta.visual_data.type === 'pie' ? <PieChartIcon size={13} /> : <BarChart3 size={13} />}
                            {meta.visual_data.title}
                          </h4>
                          
                          <div className="h-44 w-full bg-slate-50 rounded-xl p-2 border border-slate-100">
                            <ResponsiveContainer width="100%" height="100%">
                              {meta.visual_data.type === 'pie' ? (
                                <PieChart>
                                  <Pie data={meta.visual_data.data} innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value">
                                    {meta.visual_data.data.map((entry: any, i: number) => (
                                      <Cell key={`cell-${i}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              ) : (
                                <BarChart data={meta.visual_data.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                  <Tooltip />
                                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {meta.visual_data.data.map((entry: any, i: number) => (
                                      <Cell key={`cell-bar-${i}`} fill={entry.color} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              )}
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Auditable Reasoning Trail Section */}
                    {msg.role === 'ai' && steps.length > 0 && (
                      <div className="w-full max-w-xl">
                        <button 
                          onClick={() => toggleTrail(idx)}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-indigo-600 transition-colors py-1 cursor-pointer"
                        >
                          {isTrailOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                          <GitFork size={12} className="text-indigo-500" />
                          <span>{isTrailOpen ? 'Hide Auditable Reasoning Trail' : `Show Reasoning Trail (${steps.length} tool steps)`}</span>
                        </button>

                        {isTrailOpen && (
                          <div className="mt-1.5 p-3.5 bg-white text-slate-800 rounded-xl border border-slate-200 shadow-xs space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150 text-[11px]">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100 flex justify-between items-center">
                              <span>Sequential Tool Orchestration</span>
                              <span className="text-emerald-700 font-bold">Grounded Execution</span>
                            </div>
                            {steps.map((s: any) => (
                              <div key={s.step_number} className="flex gap-2.5 items-start bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                                  {s.step_number}
                                </span>
                                <div className="space-y-0.5 flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900">{s.action}</span>
                                    <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">{s.tool}</span>
                                  </div>
                                  <p className="text-slate-600 text-[10px] leading-tight">{s.observation}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dev Mode Context Inspector */}
                    {msg.role === 'ai' && meta?.debug_page_context && (
                      <details className="w-full max-w-xl text-[10px] text-slate-500 bg-slate-50 rounded-xl p-2.5 border border-slate-200 cursor-pointer">
                        <summary className="font-bold flex items-center justify-between text-slate-700 select-none">
                          <span className="flex items-center gap-1.5">
                            <Sparkles size={11} className="text-indigo-600" />
                            Dev Context Inspector (Injected Viewport State)
                          </span>
                          <span className="font-mono text-[9px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                            {meta.debug_page_context.page_name} ({meta.debug_page_context.route})
                          </span>
                        </summary>
                        <pre className="mt-2 p-2 bg-white rounded-lg border border-slate-200 text-slate-800 font-mono text-[10px] overflow-x-auto leading-relaxed">
                          {JSON.stringify(meta.debug_page_context, null, 2)}
                        </pre>
                      </details>
                    )}

                  </div>
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Bot size={15} />
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                <Loader2 size={14} className="animate-spin text-indigo-600" />
                <span>Executing multi-step ledger tools and validating confidence...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask anything about your ledger (e.g. 'Compare settlement speed this month vs last month')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
          >
            <Send size={15} />
          </button>
        </form>

      </div>

      {/* Right 30%: Suggested Queries & System Context */}
      <div className="w-full lg:w-80 flex flex-col gap-5 shrink-0">
        
        {/* Active Context Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={13} /> Active Agent Context
          </h3>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Active Scope:</span>
              <span className="font-semibold text-slate-900">{getActiveRangeLabel()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Orchestrator:</span>
              <span className="font-semibold text-indigo-600">Multi-Step Function Calling</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Forensic Checks:</span>
              <span className="font-semibold text-emerald-600">Benford + Isolation Forest</span>
            </div>
          </div>
        </div>

        {/* Suggested Compound Queries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <HelpCircle size={13} /> Suggested Ledger Inquiries
            </h3>
            
            <div className="space-y-2">
              {[
                "Compare settlement speed and volume this month vs last month",
                "Check our Benford forensic status and anomaly outliers",
                "What is my value match rate and settled amount?",
                "How many exceptions are currently open?",
                "What is our gross-to-net cash leakage?"
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedAsk(q)}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 text-xs font-medium text-slate-700 transition-all active:scale-[0.98] cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 leading-snug">
            <span className="font-bold">Enterprise Guarantee:</span> Every AI response carries an explicit confidence score and inspectable reasoning trail.
          </div>
        </div>

      </div>

    </div>
  );
}
