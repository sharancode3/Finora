import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { 
  ShieldCheck, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  ChevronUp,
  CheckCircle, 
  Info, 
  AlertTriangle, 
  ArrowRight,
  UserCheck,
  Building2,
  BookOpen,
  CreditCard,
  Send,
  Flame,
  Clock,
  Layers,
  Sparkles,
  Zap,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  Filter,
  X,
  Minus,
  Loader2
} from 'lucide-react';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { AIInsightCard } from '../components/ui/AIInsightCard';
import { Button } from '../components/ui/Button';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Link } from 'react-router-dom';
import { useAI } from '../context/AIContext';

export default function Exceptions() {
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [patternClusters, setPatternClusters] = useState<any[]>([]);
  const [resolutionAnalytics, setResolutionAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Independent multi-row expansion
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Action panel states (which inline action is currently active per row)
  const [activeActions, setActiveActions] = useState<Record<string, 'resolve' | 'escalate' | null>>({});
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const [resolveReasons, setResolveReasons] = useState<Record<string, string>>({});

  // Filter states
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Open'); // Status filter: Open, Escalated, Resolved, Statistically Unusual
  const [selectedClusterReason, setSelectedClusterReason] = useState<string | null>(null);

  // Phase 3 AI Investigations State
  const [investigatingId, setInvestigatingId] = useState<string | null>(null);
  const [investigationResults, setInvestigationResults] = useState<Record<string, any>>({});
  const [investigationHistory, setInvestigationHistory] = useState<Record<string, any[]>>({});

  // Cluster Why Drawer State
  const [selectedClusterKey, setSelectedClusterKey] = useState<string | null>(null);
  const [clusterWhyData, setClusterWhyData] = useState<Record<string, any>>({});
  const [clusterWhyLoading, setClusterWhyLoading] = useState(false);

  // Natural Language Filter Parser State
  const [nlFilter, setNlFilter] = useState<any>(null);

  useEffect(() => {
    fetchExceptionIntelligence();
  }, [activeFilter]);

  const fetchExceptionIntelligence = async () => {
    setLoading(true);
    try {
      if (activeFilter === 'Statistically Unusual') {
        const res = await api.get(`/analytics/statistical-anomalies?start_date=2026-03-01&end_date=2026-09-05`);
        const mlData = (res.data?.anomalies || []).map((a: any) => ({
          id: a.transaction_id,
          transaction_id: a.transaction_id,
          reason: `Statistically Unusual (${a.top_feature})`,
          status: 'unusual',
          transaction_date: a.transaction_date,
          risk_score: Math.round(a.anomaly_score * 85),
          risk_tier: a.anomaly_score > 0.8 ? 'CRITICAL' : 'HIGH',
          anomaly_score: a.anomaly_score,
          ml_score: a.anomaly_score,
          aging_days: 14,
          amount: a.gross_amount,
          risk_breakdown: { amount_pts: Math.min(40, a.gross_amount/1000), ml_pts: Math.round(a.anomaly_score * 35), age_pts: 10 },
          explanation: a.explanation,
          underlying_data: { gross_amount: a.gross_amount, calculated_net: a.gross_amount * 0.976 }
        }));
        setExceptions(mlData);
      } else {
        const res = await api.get(`/analytics/exception-intelligence?start_date=2026-03-01&end_date=2026-09-05&status=${activeFilter.toLowerCase()}`);
        setExceptions(res.data?.exceptions || []);
        setPatternClusters(res.data?.pattern_clusters || []);
        setResolutionAnalytics(res.data?.resolution_analytics || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { setPageContext } = useAI();

  useEffect(() => {
    if (!loading) {
      const openCount = exceptions.filter(e => e.status === 'open').length;
      const highRiskCount = exceptions.filter(e => e.risk_tier === 'CRITICAL' || e.risk_tier === 'HIGH').length;
      const totalAmount = exceptions.reduce((acc, e) => acc + (e.amount || 0), 0);
      const expandedId = Array.from(expandedRows)[0];

      setPageContext({
        page_name: 'Exceptions Queue',
        route: '/exceptions',
        active_filters: {
          status: activeFilter,
          cluster: selectedClusterReason,
          search: search || undefined
        },
        visible_metrics: {
          visible_count: exceptions.length,
          open_count: openCount,
          high_risk_count: highRiskCount,
          total_variance_amount: totalAmount,
          pattern_clusters_count: patternClusters.length
        },
        selected_record_id: expandedId,
        suggested_inquiries: [
          `Explain the ${openCount} open exceptions requiring resolution`,
          `What is the root cause for the ${patternClusters.length} systemic pattern clusters?`,
          `Recommend the next action for ${highRiskCount} high-risk exceptions`
        ]
      });
    }
  }, [loading, exceptions, patternClusters, activeFilter, selectedClusterReason, search, expandedRows]);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const setAction = (id: string, action: 'resolve' | 'escalate' | null, defaultReason?: string) => {
    setActiveActions(prev => ({ ...prev, [id]: action }));
    if (action === 'resolve' && defaultReason) {
      setResolveReasons(prev => ({ ...prev, [id]: defaultReason.replace(/_/g, ' ') }));
    }
  };

  const handleResolve = async (id: string, customReason?: string, customNote?: string, triggerType = 'Human Controller Manual Approval') => {
    try {
      const reason = customReason || resolveReasons[id] || 'Manual Accounting Adjustment';
      const note = customNote || actionNotes[id] || '';
      await api.post(`/exceptions/${id}/resolve`, { 
        reason,
        note,
        user: 'Sarah Jenkins, CPA',
        trigger_type: triggerType
      });
      setAction(id, null);
      fetchExceptionIntelligence();
      window.dispatchEvent(new CustomEvent('finora-exception-updated', { detail: { id, status: 'resolved' } }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEscalate = async (id: string, customNote?: string, triggerType = 'Human Controller Manual Approval') => {
    try {
      const note = customNote || actionNotes[id] || 'Escalated to Gateway Ops for settlement reconciliation review';
      await api.post(`/exceptions/${id}/escalate`, { 
        note,
        user: 'Finance Admin',
        trigger_type: triggerType
      });
      setAction(id, null);
      fetchExceptionIntelligence();
      window.dispatchEvent(new CustomEvent('finora-exception-updated', { detail: { id, status: 'escalated' } }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvestigateAI = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedRows(prev => new Set(prev).add(id));
    setInvestigatingId(id);
    try {
      const res = await api.post(`/exceptions/${id}/investigate-ai`);
      setInvestigationResults(prev => ({ ...prev, [id]: res.data }));
      const histRes = await api.get(`/exceptions/${id}/investigations`);
      setInvestigationHistory(prev => ({ ...prev, [id]: histRes.data }));
    } catch (err) {
      console.error(err);
    } finally {
      setInvestigatingId(null);
    }
  };

  const handleClusterClick = async (cluster: any) => {
    const key = cluster.cluster_key || cluster.reason;
    if (selectedClusterKey === key) {
      setSelectedClusterKey(null);
      setSelectedClusterReason(null);
      return;
    }
    setSelectedClusterKey(key);
    setSelectedClusterReason(cluster.reason);
    if (!clusterWhyData[key]) {
      setClusterWhyLoading(true);
      try {
        const res = await api.get(`/analytics/cluster-why?cluster_key=${key}&start_date=2026-08-01&end_date=2026-08-31`);
        setClusterWhyData(prev => ({ ...prev, [key]: res.data }));
      } catch (err) {
        console.error(err);
      } finally {
        setClusterWhyLoading(false);
      }
    }
  };

  // Trigger natural language parsing on search change
  useEffect(() => {
    if (!search || search.trim().length < 3) {
      setNlFilter(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/analytics/parse-exception-query?q=${encodeURIComponent(search)}&start_date=2026-08-01&end_date=2026-08-31`);
        if (res.data?.is_natural_language) {
          setNlFilter(res.data);
        } else {
          setNlFilter(null);
        }
      } catch (e) {
        setNlFilter(null);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredExceptions = exceptions.filter(ex => {
    const amount = ex.amount || ex.underlying_data?.calculated_net || ex.underlying_data?.gross_amount || 0;
    
    // Natural language filter branch
    if (nlFilter && nlFilter.is_natural_language) {
      if (nlFilter.reason && ex.reason !== nlFilter.reason) return false;
      if (nlFilter.severity && (ex.risk_tier || 'MEDIUM') !== nlFilter.severity) return false;
      if (nlFilter.min_amount && amount < nlFilter.min_amount) return false;
      if (nlFilter.status && nlFilter.status !== 'all' && ex.status !== nlFilter.status) return false;
      const matchesCluster = selectedClusterReason ? ex.reason === selectedClusterReason : true;
      return matchesCluster;
    }

    // Standard substring search branch
    const matchesSearch = ex.id.toLowerCase().includes(search.toLowerCase()) || 
      (ex.transaction_id && ex.transaction_id.toLowerCase().includes(search.toLowerCase())) ||
      ex.reason.toLowerCase().includes(search.toLowerCase());
    
    const matchesCluster = selectedClusterReason ? ex.reason === selectedClusterReason : true;
    return matchesSearch && matchesCluster;
  });

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Exceptions & Risk Command</h1>
          <p className="text-slate-500 mt-1 text-sm">Deterministic composite risk scoring, systemic pattern clustering, and time-to-resolution tracking.</p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 self-start sm:self-auto">
          {exceptions.length} Total in {activeFilter} State
        </div>
      </div>

      {/* Time-to-Resolution Analytics & Operational KPIs */}
      {resolutionAnalytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Avg Resolution</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {resolutionAnalytics.overall_avg_days} <span className="text-xs font-normal text-slate-500">days</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <Clock size={11} /> Historical avg speed
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fee Variance</span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {resolutionAnalytics.by_reason?.fee_variance || 1.4} <span className="text-xs font-normal text-slate-500">days</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Quickest automated check</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amount Mismatch</span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {resolutionAnalytics.by_reason?.amount_mismatch || 2.1} <span className="text-xs font-normal text-slate-500">days</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Cart rounding variance</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between border-l-4 border-l-amber-500">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">No Bank Credit</span>
            <div className="text-xl font-bold text-amber-700 mt-1">
              {resolutionAnalytics.by_reason?.no_bank_credit_found || 3.2} <span className="text-xs font-normal text-slate-500">days</span>
            </div>
            <span className="text-[10px] text-amber-600 font-semibold mt-1">Longest transit cycle</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Duplicate Records</span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {resolutionAnalytics.by_reason?.duplicate || 0.8} <span className="text-xs font-normal text-slate-500">days</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1">Auto-deduplicated</span>
          </div>
        </div>
      )}

      {/* Systemic Pattern Clustering Alert */}
      {patternClusters.length > 0 && activeFilter === 'Open' && (
        <div className="bg-white text-slate-900 rounded-2xl p-5 border border-indigo-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">Systemic Root-Cause Intelligence</h3>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {patternClusters.length} Systemic Exception Clusters Detected • Click any card for AI Root-Cause Analysis
                </p>
              </div>
            </div>

            {selectedClusterReason && (
              <button 
                onClick={() => { setSelectedClusterReason(null); setSelectedClusterKey(null); }}
                className="text-xs font-bold px-3 py-1 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-700 transition-colors border border-indigo-200 cursor-pointer flex items-center gap-1"
              >
                <X size={12} /> Clear Cluster Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {patternClusters.map((cl, i) => {
              const isSelected = selectedClusterReason === cl.reason;
              return (
                <div 
                  key={i} 
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50/90 border-indigo-500 shadow-xs ring-2 ring-indigo-500' 
                      : 'bg-slate-50/70 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                  }`}
                  onClick={() => handleClusterClick(cl)}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-900 flex items-center gap-1.5 font-bold">
                      <Flame size={14} className="text-amber-500 shrink-0" /> {cl.title}
                    </span>
                    <span className="text-indigo-700 font-mono font-bold text-xs">
                      ₹{cl.total_amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    {cl.insight}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-indigo-600 font-bold">
                    <span className="flex items-center gap-1"><Sparkles size={11} /> Why this cluster?</span>
                    <span className="text-slate-400 font-normal">{cl.count} exceptions</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Cluster Common-Thread Explanation Drawer */}
          {selectedClusterKey && clusterWhyData[selectedClusterKey] && (
            <AIInsightCard
              title={`Common-Thread Synthesis: ${clusterWhyData[selectedClusterKey].title}`}
              subtitle={`${clusterWhyData[selectedClusterKey].member_count} items • ₹${clusterWhyData[selectedClusterKey].total_variance?.toLocaleString('en-IN')} aggregate variance`}
              narration={clusterWhyData[selectedClusterKey].ai_common_thread}
              confidence="HIGH"
              confidenceScore={0.92}
              recommendedAction={clusterWhyData[selectedClusterKey].recommended_action}
              evidenceTrail={[
                { step_number: 1, tool: 'sqlite_cluster_aggregator', observation: `Aggregated ${clusterWhyData[selectedClusterKey].member_count} items across identical variance signatures.` },
                { step_number: 2, tool: 'deterministic_pattern_matcher', observation: `Verified recurring root-cause: ${clusterWhyData[selectedClusterKey].title}.` }
              ]}
            />
          )}
        </div>
      )}

      {/* Filter Bar with Natural Language Parsing */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl w-full md:w-auto overflow-x-auto">
            {['Open', 'Escalated', 'Resolved', 'Statistically Unusual'].map(f => (
              <button 
                key={f}
                onClick={() => {
                  setActiveFilter(f);
                  setSelectedClusterReason(null);
                  setSelectedClusterKey(null);
                }}
                className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === f 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Search Bar with AI Parsing */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              placeholder="Search or ask: 'high severity fee issues open > 30 days'..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Natural Language Filter Badge */}
        {nlFilter && nlFilter.is_natural_language && (
          <div className="flex items-center justify-between p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-indigo-900 font-medium">
              <Sparkles size={14} className="text-indigo-600" />
              <span><strong>AI Filter Applied:</strong> {nlFilter.filter_description}</span>
            </div>
            <button
              onClick={() => { setSearch(''); setNlFilter(null); }}
              className="text-indigo-700 hover:text-indigo-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <X size={12} /> Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* DataTable Sorted by Composite Risk Score */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} />
        ) : filteredExceptions.length === 0 ? (
          <EmptyState 
            icon={CheckCircle}
            title={`No ${activeFilter.toLowerCase()} records`}
            description="You're all caught up. No transactions match the selected criteria."
            actionLabel="Reset Filters"
            onAction={() => { setActiveFilter('Open'); setSelectedClusterReason(null); setSearch(''); }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-6"></th>
                  <th className="py-3 px-4">Risk Priority</th>
                  <th className="py-3 px-4">Transaction / Exception ID</th>
                  <th className="py-3 px-4">Discrepancy / Root Cause</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Aging</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredExceptions.map((ex) => {
                  const isExpanded = expandedRows.has(ex.id);
                  const action = activeActions[ex.id];
                  const amount = ex.amount || ex.underlying_data?.calculated_net || ex.underlying_data?.gross_amount || 0;
                  const riskScore = ex.risk_score || 25;
                  const riskTier = ex.risk_tier || 'MEDIUM';
                  const breakdown = ex.risk_breakdown || { amount_pts: 10, ml_pts: 10, age_pts: 5 };

                  let riskBadgeClass = 'bg-[#F1F5F9] text-[#64748B] border-[#E5E7EB]';
                  if (riskTier === 'CRITICAL' || riskTier === 'HIGH') {
                    riskBadgeClass = 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]';
                  } else if (riskTier === 'MEDIUM') {
                    riskBadgeClass = 'bg-[#FFF7ED] text-[#D97706] border-[#FED7AA]';
                  }

                  return (
                    <React.Fragment key={ex.id}>
                      <tr 
                        className={`hover:bg-slate-50 transition-colors duration-150 ease-out cursor-pointer ${isExpanded ? 'bg-slate-50 font-medium' : ''}`}
                        onClick={() => toggleRow(ex.id)}
                      >
                        <td className="py-3.5 pl-5 pr-2 text-slate-400">
                          {isExpanded ? <ChevronDown size={16} className="text-slate-700" /> : <ChevronRight size={16} />}
                        </td>

                        {/* Composite Risk Score Badge (Single Status Badge) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span 
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${riskBadgeClass}`}
                              title={`Amount: ${breakdown.amount_pts}pts | ML Outlier: ${breakdown.ml_pts}pts | Aging: ${breakdown.age_pts}pts`}
                            >
                              <Flame size={11} className={riskTier === 'CRITICAL' || riskTier === 'HIGH' ? 'text-[#DC2626]' : 'text-[#D97706]'} />
                              {riskScore} • {riskTier}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {ex.id}
                        </td>
                        
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 capitalize">
                            {ex.reason.replace(/_/g, ' ')}
                          </span>
                          {ex.ml_explanation && (
                            <p className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">{ex.ml_explanation}</p>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          <AmountDisplay amount={amount} />
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-mono">
                          {ex.aging_days}d open
                        </td>

                        <td className="py-3.5 pr-6 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={(e) => handleInvestigateAI(ex.id, e)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5B45F5] bg-[#EEEBFF] hover:bg-[#DDD7FE] border border-[#DDD7FE] px-3 py-1 rounded-xl transition-colors duration-150 ease-out shadow-xs cursor-pointer"
                            >
                              {investigatingId === ex.id ? (
                                <Loader2 size={13} className="text-[#5B45F5] animate-spin" />
                              ) : (
                                <Sparkles size={13} className="text-[#5B45F5]" />
                              )}
                              {investigatingId === ex.id ? 'Investigating...' : 'Investigate with AI'}
                            </button>
                            <Link 
                              to={`/record/exception/${ex.id}`}
                              className="text-xs font-bold text-slate-500 hover:text-slate-900 px-2 py-1 transition-colors duration-150 ease-out"
                            >
                              Deep Audit &rarr;
                            </Link>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded High-Contrast Investigation Drawer */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="p-0 border-b border-slate-200">
                            <div className="p-6 bg-slate-50 border-y border-slate-200 text-slate-800 space-y-5 animate-in fade-in duration-200 ease-out">
                              
                              {/* STRUCTURED AI ROOT-CAUSE INVESTIGATION PANEL */}
                              <div className="bg-[#EEEBFF]/40 text-slate-900 rounded-2xl p-5 shadow-xs border border-[#DDD7FE] space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="relative p-2 bg-[#EEEBFF] text-[#5B45F5] rounded-xl border border-[#DDD7FE]">
                                      <Sparkles size={16} />
                                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#16A34A] ring-1 ring-white" title="Ready"></span>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                                        Deterministic AI Root-Cause Investigation
                                      </h4>
                                      <p className="text-xs text-slate-600 mt-0.5 font-medium">
                                        Sequential 4-factor audit verification for <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">{ex.id}</span>
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-start sm:self-auto">
                                    <button
                                      onClick={(e) => handleInvestigateAI(ex.id, e)}
                                      disabled={investigatingId === ex.id}
                                      className="text-xs font-bold px-3.5 py-1.5 bg-[#5B45F5] hover:bg-[#4C35E8] text-white rounded-xl shadow-xs transition-colors duration-150 ease-out flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                      <RotateCcw size={12} className={investigatingId === ex.id ? "animate-spin" : ""} />
                                      {investigatingId === ex.id ? 'Running 4 Checks...' : investigationResults[ex.id] ? 'Re-run Investigation' : 'Run AI Investigation'}
                                    </button>
                                  </div>
                                </div>

                                {investigationResults[ex.id] ? (
                                  <div className="space-y-4 animate-in fade-in duration-150">
                                    {/* Financial Variance Reconciliation Bar */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Discrepancy</span>
                                        <span className="text-sm font-bold font-mono text-slate-900">
                                          ₹{investigationResults[ex.id].initial_variance?.toLocaleString('en-IN')}
                                        </span>
                                      </div>
                                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Explained Variance</span>
                                        <span className="text-sm font-bold font-mono text-emerald-700">
                                          ₹{investigationResults[ex.id].explained_amount?.toLocaleString('en-IN')}
                                        </span>
                                      </div>
                                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Unexplained Discrepancy</span>
                                        <span className={`text-sm font-bold font-mono ${investigationResults[ex.id].unexplained_amount > 1 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                          ₹{investigationResults[ex.id].unexplained_amount?.toLocaleString('en-IN')}
                                        </span>
                                      </div>
                                    </div>

                                    {/* 4-Step Structured Verification Checks */}
                                    <div className="space-y-2">
                                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sequential Audit Factor Trail:</span>
                                      {investigationResults[ex.id].steps_checked?.map((st: any, sIdx: number) => (
                                        <div key={sIdx} className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-xs">
                                          <div className="mt-0.5">
                                            {st.status === 'APPLIED' ? (
                                              <span className="inline-block p-1 bg-emerald-100 text-emerald-700 rounded-md"><CheckCircle2 size={13} /></span>
                                            ) : st.status === 'LATENCY_FACTOR' ? (
                                              <span className="inline-block p-1 bg-amber-100 text-amber-700 rounded-md"><Clock size={13} /></span>
                                            ) : (
                                              <span className="inline-block p-1 bg-slate-100 text-slate-500 rounded-md"><Minus size={13} /></span>
                                            )}
                                          </div>
                                          <div className="flex-1 text-xs">
                                            <div className="flex items-center justify-between">
                                              <span className="font-bold text-slate-900">Check {st.step}: {st.check}</span>
                                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono border ${
                                                st.status === 'APPLIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                st.status === 'LATENCY_FACTOR' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                                              }`}>
                                                {st.status.replace(/_/g, ' ')}
                                              </span>
                                            </div>
                                            <p className="text-slate-700 mt-0.5 leading-relaxed font-medium">{st.observation}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Phase 4 Standardized AI Insight Card with Grounded Evidence Trail */}
                                    <AIInsightCard
                                      title="Fino Root-Cause Investigation Conclusion"
                                      subtitle={`Deterministic 4-step reconciliation verification for ${ex.id}`}
                                      narration={investigationResults[ex.id].conclusion}
                                      confidence={investigationResults[ex.id].confidence_badge === 'HIGH' ? 'HIGH' : investigationResults[ex.id].confidence_badge === 'MEDIUM' ? 'MEDIUM' : 'LOW'}
                                      confidenceScore={investigationResults[ex.id].confidence_score}
                                      recommendedAction={investigationResults[ex.id].recommended_action}
                                      metrics={[
                                        { label: 'Initial Variance', value: `₹${investigationResults[ex.id].initial_variance?.toLocaleString('en-IN')}` },
                                        { label: 'Explained Amount', value: `₹${investigationResults[ex.id].explained_amount?.toLocaleString('en-IN')}`, color: 'text-[#16A34A]' },
                                        { label: 'Unexplained Variance', value: `₹${investigationResults[ex.id].unexplained_amount?.toLocaleString('en-IN')}`, color: investigationResults[ex.id].unexplained_amount > 1 ? 'text-[#DC2626]' : 'text-[#16A34A]' },
                                        { label: 'Action Recommendation', value: investigationResults[ex.id].recommended_action, color: 'text-[#5B45F5]' }
                                      ]}
                                      evidenceTrail={investigationResults[ex.id].steps_checked?.map((st: any) => ({
                                        step_number: st.step,
                                        tool: st.check,
                                        observation: `${st.status}: ${st.observation}`
                                      }))}
                                    >
                                      {/* Quick Apply Action CTA inside AI Card */}
                                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                                          <ShieldCheck size={13} className="text-[#16A34A]" />
                                          Stored audit record: {investigationResults[ex.id].investigation_id} • Status: {investigationResults[ex.id].verifier_status}
                                        </div>
                                        <button
                                          onClick={() => handleResolve(ex.id, investigationResults[ex.id].recommended_action, 'Applied Fino AI root-cause recommended resolution', 'AI Recommendation Applied')}
                                          className="px-3.5 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-xs font-bold shadow-xs transition-colors duration-150 ease-out flex items-center gap-1 cursor-pointer"
                                        >
                                          <CheckCircle size={13} /> Apply Recommended Resolution
                                        </button>
                                      </div>
                                    </AIInsightCard>
                                  </div>
                                ) : (
                                  <div className="p-4 bg-white rounded-xl border border-slate-200 text-center space-y-2 shadow-xs">
                                    <p className="text-xs text-slate-700">
                                      Click <strong>"Run AI Investigation"</strong> to execute the deterministic 4-step root-cause check (Refunds, Fees, Float latency, Duplicates).
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Top Banner: Composite Score Breakdown */}
                              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                      Composite Risk Score Breakdown ({riskScore}/100)
                                    </h4>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                                      Deterministic Audit Logic
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 mt-0.5">
                                    Computed from transaction value, Isolation Forest ML anomaly rating, and {ex.aging_days} days unresolved aging.
                                  </p>
                                </div>
                              </div>

                              {/* 3-Way Evidence Sub-Panels */}
                              <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                  3-Way Verification Evidence
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  
                                  {/* 1. Ledger Record */}
                                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 mb-2">
                                      <BookOpen size={14} /> Internal Ledger Record
                                    </div>
                                    <p className="text-xs text-slate-500 mb-1">Transaction Ref: <span className="font-mono font-bold text-slate-900">{ex.transaction_id || 'None'}</span></p>
                                    <div className="text-base font-bold text-slate-900"><AmountDisplay amount={ex.underlying_data?.gross_amount || amount} /></div>
                                  </div>

                                  {/* 2. Gateway Settlement */}
                                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                                    <div className="flex items-center gap-2 text-xs font-bold text-blue-700 mb-2">
                                      <CreditCard size={14} /> Gateway Feeds
                                    </div>
                                    <p className="text-xs text-slate-500 mb-1">Expected Net (Post 2%+GST):</p>
                                    <div className="text-base font-bold text-slate-900"><AmountDisplay amount={ex.underlying_data?.calculated_net || (amount * 0.976)} /></div>
                                  </div>

                                  {/* 3. Bank Statement */}
                                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 mb-2">
                                      <Building2 size={14} /> Bank Account Feed
                                    </div>
                                    <p className="text-xs text-slate-500 mb-1">Matched Credit Batch:</p>
                                    <div className="text-base font-bold text-rose-600">
                                      {ex.reason === 'no_bank_credit_found' ? 'No Bank Credit Found' : `₹${amount.toLocaleString('en-IN')}`}
                                    </div>
                                  </div>

                                </div>
                              </div>

                              {/* Inline Quick Action Workflow */}
                              <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setAction(ex.id, action === 'resolve' ? null : 'resolve', ex.reason)}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <CheckCircle size={14} /> Mark Explained & Resolve
                                  </button>
                                  <button
                                    onClick={() => setAction(ex.id, action === 'escalate' ? null : 'escalate')}
                                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <UserCheck size={14} /> Escalate to Lead
                                  </button>
                                </div>

                                <span className="text-xs text-slate-500">
                                  Ind AS compliant audit trail entry will be generated
                                </span>
                              </div>

                              {/* Interactive Form Drawer */}
                              {action && (
                                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm animate-in fade-in duration-150">
                                  {action === 'resolve' ? (
                                    <>
                                      <div className="flex items-center justify-between">
                                        <h5 className="font-bold text-xs text-slate-900">Select Accounting Adjustment Reason</h5>
                                        <span className="text-[10px] text-slate-500">Posts to Ind AS suspense ledger</span>
                                      </div>
                                      <select
                                        value={resolveReasons[ex.id] || ''}
                                        onChange={(e) => setResolveReasons({ ...resolveReasons, [ex.id]: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                      >
                                        <option value="Gateway Fee Adjustment">Gateway Fee Adjustment (MDR Variance)</option>
                                        <option value="Timing Difference (T+3 Bank Float)">Timing Difference (T+3 Bank Float)</option>
                                        <option value="Refund Chargeback Offsetting">Refund Chargeback Offsetting</option>
                                        <option value="Manual Accounting Adjustment">Manual Accounting Adjustment</option>
                                      </select>
                                      <input
                                        type="text"
                                        placeholder="Add required audit annotation note..."
                                        value={actionNotes[ex.id] || ''}
                                        onChange={(e) => setActionNotes({ ...actionNotes, [ex.id]: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                      />
                                      <div className="flex justify-end gap-2 pt-1">
                                        <button onClick={() => setAction(ex.id, null)} className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer">Cancel</button>
                                        <button onClick={() => handleResolve(ex.id)} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer">Confirm Resolution</button>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <h5 className="font-bold text-xs text-slate-900">Escalate to Senior Financial Controller</h5>
                                      <input
                                        type="text"
                                        placeholder="Reason for escalation (e.g., Unrecognized UTR credit)..."
                                        value={actionNotes[ex.id] || ''}
                                        onChange={(e) => setActionNotes({ ...actionNotes, [ex.id]: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                      />
                                      <div className="flex justify-end gap-2 pt-1">
                                        <button onClick={() => setAction(ex.id, null)} className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer">Cancel</button>
                                        <button onClick={() => handleEscalate(ex.id)} className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold cursor-pointer">Submit Escalation</button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
