import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAI } from '../context/AIContext';
import { 
  Bot, 
  User, 
  Send, 
  AlertTriangle, 
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
  UserCheck,
  BookOpen,
  Sparkles,
  Flame,
  Activity,
  Brain,
  MessageSquare,
  Plus,
  Trash2,
  Filter,
  History,
  Layers,
  Search,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { FormattedMarkdown } from '../components/ui/FormattedMarkdown';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { pluralize } from '../utils/formatters';
import { FinoraMark } from '../components/ui/FinoraMark';
import { FinoThinkingIndicator } from '../components/ui/FinoThinkingIndicator';
import { api } from '../api/client';

const SECTION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Treasury': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Reconciliation': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Exceptions': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  'Close': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Statutory': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'General': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' }
};

export default function AskYourBooks() {
  const { isDark } = useTheme();
  const { 
    messages, 
    sessions, 
    currentSessionId, 
    createNewSession, 
    loadSession, 
    deleteSession, 
    clearAllSessions,
    sendMessage, 
    isLoading, 
    setPageContext,
    clearMessages
  } = useAI();

  const [input, setInput] = useState('');
  const [expandedTrails, setExpandedTrails] = useState<Record<number, boolean>>({});
  const [expandedThoughts, setExpandedThoughts] = useState<Record<number, boolean>>({});
  const [showHistorySidebar, setShowHistorySidebar] = useState(true);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('All');
  const [historySearch, setHistorySearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleThought = (idx: number) => {
    setExpandedThoughts(prev => ({ ...prev, [idx]: prev[idx] === false ? true : false }));
  };

  // Live Grounded Prompt Data for Empty State
  const [livePromptData, setLivePromptData] = useState<{
    topExceptionId: string;
    topExceptionAmount: number;
    topExceptionReason: string;
    grossVolume: number;
    netSettled: number;
    benfordMad: number;
  }>({
    topExceptionId: 'exc_a7416ed6fc2d',
    topExceptionAmount: 14200,
    topExceptionReason: 'Missing Bank Credit',
    grossVolume: 298603.50,
    netSettled: 244371.19,
    benfordMad: 0.0903
  });

  useEffect(() => {
    const fetchPromptsData = async () => {
      try {
        const [excRes, txRes, benfordRes] = await Promise.all([
          api.get('/analytics/exception-intelligence?start_date=2026-08-01&end_date=2026-08-31').catch(() => ({ data: { exceptions: [] } })),
          api.get('/transactions?start_date=2026-08-01&end_date=2026-08-31').catch(() => ({ data: [] })),
          api.get('/analytics/benford-analysis?start_date=2026-08-01&end_date=2026-08-31').catch(() => ({ data: { mad: 0.0903 } }))
        ]);

        const rawExceptions = excRes.data?.exceptions || [];
        const openExceptions = rawExceptions.filter((e: any) => e.status !== 'resolved');
        const topExc = openExceptions[0] || rawExceptions[0] || {};
        const txs = Array.isArray(txRes.data) ? txRes.data : [];
        const gross = txs.reduce((acc: number, t: any) => acc + (t.gross_amount || 0), 0) || 298603.50;
        const net = txs.filter((t: any) => t.status === 'settled').reduce((acc: number, t: any) => acc + (t.net_amount || 0), 0) || 244371.19;

        setLivePromptData({
          topExceptionId: topExc.id || 'exc_0579e0a0584b',
          topExceptionAmount: topExc.amount || 10000,
          topExceptionReason: topExc.reason ? topExc.reason.replace(/_/g, ' ') : 'Settlement Delay',
          grossVolume: gross,
          netSettled: net,
          benfordMad: benfordRes.data?.mad || 0.0903
        });
      } catch (e) {}
    };

    fetchPromptsData();
  }, []);

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchSection = selectedSectionFilter === 'All' || s.section === selectedSectionFilter;
      const matchSearch = !historySearch.trim() || 
        s.title.toLowerCase().includes(historySearch.toLowerCase()) || 
        s.section.toLowerCase().includes(historySearch.toLowerCase());
      return matchSection && matchSearch;
    });
  }, [sessions, selectedSectionFilter, historySearch]);

  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === currentSessionId) || null;
  }, [sessions, currentSessionId]);

  // Multi-Turn Memory Topic Indicator
  const lastUserTopic = useMemo(() => {
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) return null;
    const lastContent = userMessages[userMessages.length - 1].content;
    if (lastContent.length <= 40) return lastContent;
    return lastContent.substring(0, 38) + '...';
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setPageContext({
      page_name: 'Ask Fino (Autonomous AI Controller)',
      route: '/ask-your-books',
      visible_metrics: {
        interface_mode: 'interactive_chat',
        connected_capabilities: 'gemma3_local_inference,zero_hallucination_verifier,multi_step_orchestration',
        active_session_id: currentSessionId,
        session_count: sessions.length
      },
      suggested_inquiries: [
        "What is our statutory value match rate for August 2026?",
        "Breakdown total fees and GST deductions for last month",
        "Why was settlement PAY-00001 lower than the gross amount?",
        "Are there any unresolved high-severity exceptions?"
      ]
    });
  }, [currentSessionId, sessions.length]);

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
    <div className="h-[calc(100vh-110px)] flex flex-col lg:flex-row gap-5 max-w-[1750px] w-full mx-auto pb-4">
      
      {/* 1. Left Column: Sectional Conversation History & Session Navigator */}
      {showHistorySidebar && (
        <div className="w-full lg:w-72 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden shrink-0 animate-in fade-in slide-in-from-left-2 duration-200">
          
          {/* Sidebar Header */}
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History size={16} className="text-slate-700" />
              <span className="font-bold text-xs text-slate-900 tracking-tight">Conversation History</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
              {sessions.length}
            </span>
          </div>

          {/* New Inquiry Action Button */}
          <div className="p-3 border-b border-slate-100">
            <button
              onClick={() => createNewSession()}
              className="w-full py-2 px-3 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={14} /> Start New Inquiry
            </button>
          </div>

          {/* Search History Filter */}
          <div className="px-3 pt-2.5">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                type="text"
                placeholder="Search history..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-[#1E293B]"
              />
            </div>
          </div>

          {/* Sectional Category Pills */}
          <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-1 overflow-x-auto text-[10px] font-bold">
            {['All', 'Treasury', 'Reconciliation', 'Exceptions', 'Close', 'Statutory'].map(sec => (
              <button
                key={sec}
                onClick={() => setSelectedSectionFilter(sec)}
                className={`px-2 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSectionFilter === sec 
                    ? 'bg-[#1E293B] text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Session Threads List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredSessions.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                <MessageSquare size={24} className="mx-auto mb-2 opacity-40" />
                <p className="font-semibold text-slate-600">No sessions found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click Start New Inquiry above to begin a session.</p>
              </div>
            ) : (
              filteredSessions.map((sess) => {
                const isActive = sess.id === currentSessionId;
                const colors = SECTION_COLORS[sess.section] || SECTION_COLORS['General'];

                return (
                  <div
                    key={sess.id}
                    onClick={() => loadSession(sess.id)}
                    className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                      isActive
                        ? 'bg-slate-50 border-[#1E293B] shadow-2xs ring-1 ring-[#1E293B]/20'
                        : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
                        {sess.section}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {sess.updatedAt || 'Recent'}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-slate-800 line-clamp-1 group-hover:text-[#1E293B] transition-colors pr-5">
                      {sess.title}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>{sess.messages.length} {sess.messages.length === 1 ? 'msg' : 'msgs'}</span>
                      {sess.messages[0] && (
                        <span className="truncate max-w-[120px] text-slate-500 font-mono text-[9px]">
                          {sess.messages[0].role === 'user' ? 'You: ' : 'Fino: '}{sess.messages[0].content.substring(0, 18)}...
                        </span>
                      )}
                    </div>

                    {/* Delete Session Button on Hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(sess.id);
                      }}
                      title="Delete session"
                      className="absolute right-2 top-2 p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Reset Action */}
          <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[10px] text-slate-500">
            <span>Local ACID History</span>
            <button
              onClick={clearAllSessions}
              className="text-slate-400 hover:text-rose-600 transition-colors font-medium cursor-pointer"
            >
              Clear History
            </button>
          </div>

        </div>
      )}

      {/* 2. Center Column: AI Visual Canvas & Chat Stream */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-[#E4E4E7] shadow-xs overflow-hidden min-w-0">
        
        {/* Canvas Header */}
        <div className="p-3.5 border-b border-[#E4E4E7] bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistorySidebar(prev => !prev)}
              title={showHistorySidebar ? "Hide History Sidebar" : "Show History Sidebar"}
              className="p-1.5 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <History size={15} />
            </button>
            
            <FinoraMark size={28} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-slate-900 leading-tight">
                  {activeSession?.title || "Ask Fino"}
                </h2>
                {activeSession && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${SECTION_COLORS[activeSession.section]?.bg || 'bg-slate-100'} ${SECTION_COLORS[activeSession.section]?.text || 'text-slate-700'} ${SECTION_COLORS[activeSession.section]?.border || 'border-slate-200'}`}>
                    Section: {activeSession.section}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500">Multi-Step Tool Orchestration • Grounded Local SQLite Ledger</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={clearMessages}
              title="Clear current conversation"
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Clear Chat
            </button>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#15803D] bg-[#F0FDF4] px-2.5 py-1 rounded-full border border-[#BBF7D0]">
              <ShieldCheck size={12} /> Live Grounded Ledger
            </span>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center max-w-lg mx-auto my-auto py-8">
              <div className="mb-4">
                <FinoraMark size={56} />
              </div>
              <h3 className="font-bold text-base text-slate-800 mb-1">Hi Sharan, ask Fino anything about your books</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mb-6">
                Fino continuously queries your live SQLite ACID records and statutory rules. Click any live inquiry below to begin:
              </p>

              {/* 5 Controller-First Grounded Prompt Chips */}
              <div className="w-full space-y-2 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Suggested Questions for Fino:
                </span>
                
                <button
                  onClick={() => handleSuggestedAsk("What should I fix first?")}
                  className="w-full p-3 rounded-xl bg-white border border-violet-200 hover:border-violet-400 hover:shadow-xs text-xs font-semibold text-slate-800 transition-all flex items-center justify-between group cursor-pointer bg-gradient-to-r from-violet-50/50 to-white"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#5B45F5]" />
                    <span>🎯 <strong className="text-slate-900">What should I fix first?</strong> (AI Priority &amp; Next Best Action)</span>
                  </div>
                  <ArrowUpRight size={14} className="text-violet-500 group-hover:text-violet-800 transition-colors" />
                </button>

                <button
                  onClick={() => handleSuggestedAsk("Why are record and value match rates different?")}
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xs text-xs font-semibold text-slate-800 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                    <span>⚖️ <strong>Why are record and value match rates different?</strong> (81.7% vs 81.8%)</span>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>

                <button
                  onClick={() => handleSuggestedAsk("What happens if settlement delays increase by 2 days?")}
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xs text-xs font-semibold text-slate-800 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#B45309]" />
                    <span>⏳ <strong>What if settlement is delayed by 2 days?</strong> (Monte Carlo Stress Test)</span>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>

                <button
                  onClick={() => handleSuggestedAsk("What is blocking month-end close?")}
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xs text-xs font-semibold text-slate-800 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#B91C1C]" />
                    <span>🔒 <strong>What is blocking month-end close?</strong> (Audit &amp; Statutory Blockers)</span>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>

                <button
                  onClick={() => handleSuggestedAsk("Which bank account received more: Kotak or HDFC?")}
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xs text-xs font-semibold text-slate-800 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
                    <span>🏦 <strong>Which bank account received more: Kotak or HDFC?</strong> (Multi-Rail Flow)</span>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const meta = msg.metadata || {};
              const conf = meta.confidence || 'HIGH';
              const isTrailOpen = !!expandedTrails[idx];
              const steps = meta.reasoning_trail || [];
              const sectionTag = meta.section;

              return (
                <div key={idx} className={`flex gap-3 w-full max-w-[98%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  {msg.role === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-[#1E293B] text-white flex items-center justify-center shrink-0">
                      <User size={14} />
                    </div>
                  ) : (
                    <FinoraMark size={32} />
                  )}
                  
                  <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} w-full`}>
                    
                    {/* Primary Content Bubble */}
                    {msg.role === 'user' ? (
                      <div className="bg-[#1E293B] text-white rounded-2xl rounded-tr-xs px-4.5 py-3 shadow-xs text-xs font-medium leading-relaxed tracking-normal max-w-2xl">
                        <span className="text-white text-xs font-medium whitespace-pre-wrap">{msg.content}</span>
                        {msg.timestamp && (
                          <span className="block text-[9px] text-slate-400 text-right mt-1 font-mono">{msg.timestamp}</span>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white border border-[#E4E4E7] text-slate-800 rounded-2xl rounded-tl-xs p-5 text-xs leading-relaxed shadow-xs w-full max-w-4xl space-y-3">
                        
                        {/* AI Confidence & Section Header */}
                        <div className="flex items-center justify-between gap-3 pb-2.5 mb-1 border-b border-slate-100">
                          <div className="flex items-center gap-2 flex-wrap">
                            {conf === 'HIGH' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
                                <ShieldCheck size={11} /> High Confidence ({Math.round((meta.confidence_score || 0.98) * 100)}%)
                              </span>
                            )}
                            {conf === 'MEDIUM' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]">
                                <AlertTriangle size={11} /> Medium Confidence ({Math.round((meta.confidence_score || 0.75) * 100)}%)
                              </span>
                            )}
                            {conf === 'LOW' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
                                <AlertTriangle size={11} /> Low Confidence ({Math.round((meta.confidence_score || 0.35) * 100)}%)
                              </span>
                            )}

                            {sectionTag && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold ${SECTION_COLORS[sectionTag]?.bg || 'bg-slate-100'} ${SECTION_COLORS[sectionTag]?.text || 'text-slate-700'}`}>
                                <Layers size={10} /> {sectionTag}
                              </span>
                            )}
                          </div>
                          
                          {meta.confidence_rationale && (
                            <div className="relative group cursor-help ml-2">
                              <span className="text-[10px] text-slate-400 border-b border-dashed border-slate-300 pb-0.5 hover:text-slate-600 transition-colors">
                                Why this confidence?
                              </span>
                              <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl border border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                <div className="font-bold mb-1 text-slate-300">Confidence Breakdown</div>
                                <p className="leading-relaxed whitespace-normal text-left">{meta.confidence_rationale}</p>
                                <div className="absolute -top-1 right-8 w-2 h-2 bg-slate-800 rotate-45 border-t border-l border-slate-700"></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Authentic AI Thought Process Accordion */}
                        {msg.role === 'ai' && (meta.thought_process || meta.reasoning_trail?.length > 0) && (
                          <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50/80 overflow-hidden text-xs">
                            <button
                              type="button"
                              onClick={() => toggleThought(idx)}
                              className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2 text-slate-700 font-semibold text-[11px]">
                                <Brain size={13} className="text-indigo-600 shrink-0" />
                                <span>
                                  Thought for {meta.thought_duration_sec || '1.2'}s • {(meta.thought_process || meta.reasoning_trail || []).length} reasoning steps
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                <span>{expandedThoughts[idx] === true ? 'Hide reasoning' : 'View reasoning'}</span>
                                {expandedThoughts[idx] === true ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                              </div>
                            </button>

                            {expandedThoughts[idx] === true && (
                              <div className="px-3 pb-2.5 pt-1.5 space-y-1.5 border-t border-slate-200/60 bg-white">
                                {(meta.thought_process || meta.reasoning_trail || []).map((step: any, sIdx: number) => (
                                  <div key={sIdx} className="flex items-start gap-2 text-[11px] text-slate-600 leading-snug">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                                    <div>
                                      <strong className="text-slate-800 font-semibold">{step.phase || step.action || `Step ${sIdx + 1}`}:</strong>{' '}
                                      <span className="text-slate-600">{step.observation || step.detail}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <FormattedMarkdown content={msg.content} isUser={false} className="font-normal text-slate-800" />
                        
                        {/* Low/Medium Confidence Escalation Path Banner */}
                        {msg.role === 'ai' && meta.escalation_recommendation && !meta.is_greeting && (
                          <div className="mt-3 p-3 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] text-[#B45309] space-y-2">
                            <div className="flex items-center gap-1.5 font-bold text-[11px] text-[#B45309]">
                              <UserCheck size={14} /> Recommended Action
                            </div>
                            <p className="text-[11px] text-slate-700 leading-snug">
                              {meta.escalation_recommendation}
                            </p>
                            <div className="pt-1 flex gap-2">
                              <Link 
                                to="/exceptions" 
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-[#E4E4E7] shadow-xs hover:bg-slate-50 transition-colors"
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
                            
                            <div className="h-44 w-full bg-slate-50 rounded-xl p-2 border border-[#E4E4E7]">
                              <ResponsiveContainer width="100%" height="100%">
                                {meta.visual_data.type === 'pie' ? (
                                  <PieChart>
                                    <Pie
                                      data={meta.visual_data.data}
                                      dataKey="value"
                                      nameKey="name"
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={30}
                                      outerRadius={55}
                                      paddingAngle={3}
                                    >
                                      {meta.visual_data.data.map((entry: any, i: number) => (
                                        <Cell key={`cell-${i}`} fill={entry.color || '#1E293B'} />
                                      ))}
                                    </Pie>
                                    <Tooltip 
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
                                  <BarChart data={meta.visual_data.data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: isDark ? '#9CA3AF' : '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: isDark ? '#9CA3AF' : '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                      contentStyle={{ 
                                        backgroundColor: isDark ? '#151B24' : '#FFFFFF', 
                                        borderRadius: '12px', 
                                        border: `1px solid ${isDark ? '#262D38' : '#e4e4e7'}`, 
                                        color: isDark ? '#F3F4F6' : '#111827',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' 
                                      }}
                                    />
                                    <Bar dataKey="value" fill="#1E293B" radius={[4, 4, 0, 0]} />
                                  </BarChart>
                                )}
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                        
                        {/* Statutory Knowledge Citation Box */}
                        {msg.role === 'ai' && meta.knowledge_citation && (meta.knowledge_citation.statutory_reference || meta.knowledge_citation.definition || meta.knowledge_citation.governing_rule) && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500 block">
                              Statutory Reference Standard
                            </span>
                            <p className="font-semibold text-slate-900">
                              {meta.knowledge_citation.canonical_name || meta.knowledge_citation.term || 'Statutory Standard'}: {meta.knowledge_citation.statutory_reference || meta.knowledge_citation.definition || meta.knowledge_citation.plain_definition}
                            </p>
                            {meta.knowledge_citation.governing_rule && (
                              <span className="text-[10px] text-slate-500 font-mono block">Rule: {meta.knowledge_citation.governing_rule}</span>
                            )}
                          </div>
                        )}

                        {/* Follow-up Proactive Questions */}
                        {msg.role === 'ai' && meta.suggested_questions && meta.suggested_questions.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Next Questions:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {meta.suggested_questions.map((sq: string, sqIdx: number) => (
                                <button
                                  key={sqIdx}
                                  onClick={() => handleSuggestedAsk(sq)}
                                  className="text-[11px] font-medium bg-slate-50 hover:bg-[#1E293B] text-slate-700 hover:text-white border border-slate-200 hover:border-[#1E293B] px-2.5 py-1 rounded-lg transition-all text-left cursor-pointer shadow-2xs"
                                >
                                  {sq}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Grounded Evidence Trail Section */}
                    {msg.role === 'ai' && steps.length > 0 && !meta.is_greeting && (
                      <div className="w-full max-w-4xl">
                        <button 
                          onClick={() => toggleTrail(idx)}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-[#1E293B] transition-colors py-1 cursor-pointer"
                        >
                          {isTrailOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                          <GitFork size={12} className="text-[#1E293B]" />
                          <span>{isTrailOpen ? 'Hide Evidence Trail' : `Show Evidence Trail (${pluralize(steps.length, 'tool step', 'tool steps')})`}</span>
                        </button>

                        {isTrailOpen && (
                          <div className="mt-1.5 p-3.5 bg-white text-slate-800 rounded-xl border border-[#E4E4E7] shadow-xs space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150 text-[11px]">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100 flex justify-between items-center">
                              <span>Numbered Ledger Evidence Trail</span>
                              <span className="text-[#15803D] font-bold">Grounded Execution</span>
                            </div>

                            {/* Specialist Modules Consulted Pill Row */}
                            {meta.modules_consulted && meta.modules_consulted.length > 0 && (
                              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Consulted:</span>
                                {meta.modules_consulted.map((brain: string, bIdx: number) => (
                                  <span key={bIdx} className="text-[10px] font-semibold bg-white text-slate-800 border border-slate-200 px-2 py-0.5 rounded-full shadow-2xs">
                                    🧠 {brain}
                                  </span>
                                ))}
                              </div>
                            )}

                            {steps.map((s: any, sIdx: number) => (
                              <div key={sIdx} className="flex gap-2.5 items-start bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <span className="w-4 h-4 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                                  {s.step_number || (sIdx + 1)}
                                </span>
                                <div className="space-y-0.5 flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900">{s.action || 'Tool Execution'}</span>
                                    <span className="font-mono text-[10px] text-[#1E293B] bg-[#F1F5F9] px-1.5 py-0.5 rounded border border-[#E2E8F0]">{s.tool || 'query'}</span>
                                  </div>
                                  <p className="text-slate-600 text-[10px] leading-tight">{s.observation}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="bg-white border border-[#E4E4E7] p-3 rounded-2xl max-w-fit shadow-xs animate-in fade-in duration-150">
              <FinoThinkingIndicator
                text="Fino is orchestrating ledger queries & computing deterministic math..."
                subtext="Executing multi-step tools against SQLite ACID storage"
                size="sm"
              />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Conversation Memory Indicator */}
        <div className="border-t border-[#E4E4E7] bg-white">
          {/* Active Conversation Topic Memory Chip */}
          {lastUserTopic && (
            <div className="px-4 pt-2 pb-1.5 flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse shrink-0" />
                <span className="font-bold text-slate-700">Continuing conversation from:</span>
                <span className="font-medium text-slate-900 truncate">"{lastUserTopic}"</span>
              </div>
              <span className="text-[9px] font-mono font-bold bg-white text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs shrink-0 ml-2">
                Multi-Turn Memory Active
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 flex items-center gap-3">
            <input
              type="text"
              placeholder="Ask anything about your ledger (e.g. 'What is MDR?', 'Explain Section 194C', 'Why was I paid less this week?')"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-[#E4E4E7] rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-[#1E293B] hover:bg-[#0F172A] text-white p-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs cursor-pointer"
            >
              <Send size={15} />
            </button>
          </form>
        </div>

      </div>

      {/* 3. Right Column: Suggested Queries & System Context */}
      <div className="w-full lg:w-76 flex flex-col gap-4 shrink-0 overflow-y-auto">
        
        {/* Active Context Card */}
        <div className="bg-white p-4 rounded-2xl border border-[#E4E4E7] shadow-xs space-y-2.5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={13} /> Active Agent Context
          </h3>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 text-[11px]">Active Scope:</span>
              <span className="font-semibold text-slate-900 text-[11px]">{getActiveRangeLabel()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-[11px]">Orchestrator:</span>
              <span className="font-semibold text-[#1E293B] text-[11px]">Multi-Step Tool Orchestration</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-[11px]">Knowledge Base:</span>
              <span className="font-semibold text-[#15803D] text-[11px]">Curated RBI &amp; Ind AS</span>
            </div>
          </div>
        </div>

        {/* Curated Finance Knowledge Explorer */}
        <div className="bg-white p-4 rounded-2xl border border-[#E4E4E7] shadow-xs space-y-2.5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={13} /> Curated Statutory Glossary
          </h3>
          <p className="text-[11px] text-slate-500">Click any financial concept to retrieve grounded definitions and merchant impact:</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { label: "MDR Fee", query: "What is MDR?" },
              { label: "UTR Reference", query: "What is UTR?" },
              { label: "T+2 Settlement", query: "What is T+2 settlement?" },
              { label: "Section 194C", query: "Explain Section 194C TDS" },
              { label: "Section 194J", query: "What is Section 194J TDS?" },
              { label: "Section 194H", query: "What is Section 194H TDS?" },
              { label: "Section 194Q", query: "What is Section 194Q TDS?" },
              { label: "Ind AS 115", query: "What is Ind AS 115 gross vs net?" },
              { label: "GSTR-2B ITC", query: "What is GSTR-2B?" },
              { label: "Chargeback vs Refund", query: "Difference between chargeback and refund" },
              { label: "Suspense Clearing", query: "What is a suspense account?" },
              { label: "DSO Latency", query: "What is DSO?" },
              { label: "Benford MAD", query: "What is Benford's Law forensic analysis?" },
              { label: "Nodal Escrow", query: "What is a nodal account?" },
              { label: "Dunning Recovery", query: "What is dunning?" }
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => handleSuggestedAsk(item.query)}
                disabled={isLoading}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-[#1E293B] text-slate-700 hover:text-white border border-slate-200 hover:border-[#1E293B] font-medium transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Compound Queries */}
        <div className="bg-white p-4 rounded-2xl border border-[#E4E4E7] shadow-xs space-y-2.5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <HelpCircle size={13} /> Suggested Ledger Inquiries
            </h3>
            
            <div className="space-y-1.5">
              {[
                "Why was I paid less this week?",
                "What is MDR and how much did we pay in gateway fees?",
                "Where and how is AI used in Finora?",
                "Compare settlement speed and volume this month vs last month",
                "Check our Benford forensic status and anomaly outliers",
                "What is my value match rate and settled amount?"
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedAsk(q)}
                  disabled={isLoading}
                  className="w-full text-left p-2 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-[11px] font-medium text-slate-700 transition-colors duration-150 ease-out cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 border border-[#E4E4E7] rounded-xl text-[10px] text-slate-700 leading-snug mt-2">
            <span className="font-bold text-[#1E293B]">AI Grounding:</span> Responses are retrieved from curated statutory references and live SQLite ACID ledger records.
          </div>
        </div>

      </div>

    </div>
  );
}
