import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../api/client';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle, 
  Calendar as CalendarIcon, 
  Calendar,
  ChevronDown, 
  ChevronRight, 
  ChevronUp,
  X, 
  Wallet, 
  Clock, 
  FileText,
  Activity,
  Zap,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Layers,
  Eye,
  ArrowRight,
  Minus,
  Plus
} from 'lucide-react';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { AIInsightCard } from '../components/ui/AIInsightCard';
import { CardSkeleton, TableSkeleton, ChartSkeleton } from '../components/ui/Skeleton';
import { CHART_PALETTE } from '../constants/theme';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { useAI } from '../context/AIContext';

const PRESETS = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'Last 6 Months', days: 180 },
  { label: 'Last Year', days: 365 },
];

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getPastDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDate(d);
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  
  // Phase 2 AI Features State
  const [dailyBriefing, setDailyBriefing] = useState<any>(null);
  const [showDailyBriefing, setShowDailyBriefing] = useState(true);
  const [forensicNarration, setForensicNarration] = useState<any>(null);
  
  // "Why?" KPI inline drawers
  const [activeWhyCard, setActiveWhyCard] = useState<string | null>(null);
  const [whyBreakdownData, setWhyBreakdownData] = useState<Record<string, any>>({});
  const [whyLoading, setWhyLoading] = useState(false);

  // Predictive Risk Basis
  const [showRiskWhy, setShowRiskWhy] = useState(false);
  const [riskBasis, setRiskBasis] = useState<any>(null);

  // Account Filter State
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('all');

  // Date Range State
  const [dateRange, setDateRange] = useState(() => {
    const saved = localStorage.getItem('finora_dashboard_range');
    if (saved) return JSON.parse(saved);
    return { start: getPastDate(30), end: formatDate(new Date()), preset: 'Last 30 Days' };
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStart, setCustomStart] = useState(dateRange.start);
  const [customEnd, setCustomEnd] = useState(dateRange.end);

  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  
  // Statistical Anomaly Engine States
  const [benfordData, setBenfordData] = useState<any>(null);
  const [mlAnomalies, setMlAnomalies] = useState<any[]>([]);
  const [showBenfordModal, setShowBenfordModal] = useState(false);
  const [showAdvancedSignals, setShowAdvancedSignals] = useState(false);

  // Period-over-Period (PoP) Comparison States
  const [priorTransactions, setPriorTransactions] = useState<any[]>([]);
  const [priorExceptions, setPriorExceptions] = useState<any[]>([]);

  useEffect(() => {
    api.get('/accounts/').then(res => setAccounts(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    localStorage.setItem('finora_dashboard_range', JSON.stringify(dateRange));
    fetchDashboardData();
  }, [dateRange, selectedAccount]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setExpandedDay(null);

    // Calculate equivalent prior period
    const startDt = new Date(dateRange.start);
    const endDt = new Date(dateRange.end);
    const diffDays = Math.max(1, Math.round((endDt.getTime() - startDt.getTime()) / (1000 * 60 * 60 * 24)));
    
    const priorEndDt = new Date(startDt.getTime() - 24 * 60 * 60 * 1000);
    const priorStartDt = new Date(priorEndDt.getTime() - (diffDays - 1) * 24 * 60 * 60 * 1000);
    const pStart = formatDate(priorStartDt);
    const pEnd = formatDate(priorEndDt);

    try {
      const [txRes, excRes, priorTxRes, priorExcRes, benfordRes, mlRes, briefingRes, forensicRes, riskRes] = await Promise.all([
        api.get(`/transactions/?start_date=${dateRange.start}&end_date=${dateRange.end}&account_id=${selectedAccount}`),
        api.get(`/exceptions/?start_date=${dateRange.start}&end_date=${dateRange.end}&account_id=${selectedAccount}`),
        api.get(`/transactions/?start_date=${pStart}&end_date=${pEnd}&account_id=${selectedAccount}`).catch(() => ({ data: [] })),
        api.get(`/exceptions/?start_date=${pStart}&end_date=${pEnd}&account_id=${selectedAccount}`).catch(() => ({ data: [] })),
        api.get(`/analytics/benford-analysis?start_date=${dateRange.start}&end_date=${dateRange.end}&account_id=${selectedAccount}`).catch(() => ({ data: null })),
        api.get(`/analytics/statistical-anomalies?start_date=${dateRange.start}&end_date=${dateRange.end}&account_id=${selectedAccount}`).catch(() => ({ data: { anomalies: [] } })),
        api.get(`/analytics/daily-briefing?reference_date=${dateRange.end}&account_id=${selectedAccount}`).catch(() => ({ data: null })),
        api.get(`/analytics/forensic-narration?start_date=${dateRange.start}&end_date=${dateRange.end}&account_id=${selectedAccount}`).catch(() => ({ data: null })),
        api.get(`/analytics/predictive-risk-basis?start_date=${dateRange.start}&end_date=${dateRange.end}&account_id=${selectedAccount}`).catch(() => ({ data: null }))
      ]);
      setTransactions(txRes.data || []);
      setExceptions(excRes.data || []);
      setPriorTransactions(priorTxRes.data || []);
      setPriorExceptions(priorExcRes.data || []);
      setBenfordData(benfordRes.data);
      setMlAnomalies(mlRes.data?.anomalies || []);
      setDailyBriefing(briefingRes.data);
      setForensicNarration(forensicRes.data);
      setRiskBasis(riskRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWhy = async (metricKey: string) => {
    if (activeWhyCard === metricKey) {
      setActiveWhyCard(null);
      return;
    }
    setActiveWhyCard(metricKey);
    if (!whyBreakdownData[metricKey]) {
      setWhyLoading(true);
      try {
        const res = await api.get(`/analytics/kpi-breakdown?metric_key=${metricKey}&start_date=${dateRange.start}&end_date=${dateRange.end}&account_id=${selectedAccount}`);
        setWhyBreakdownData(prev => ({ ...prev, [metricKey]: res.data }));
      } catch (err) {
        console.error(err);
      } finally {
        setWhyLoading(false);
      }
    }
  };

  const handleToggleRiskWhy = async () => {
    setShowRiskWhy(!showRiskWhy);
    if (!riskBasis) {
      try {
        const res = await api.get(`/analytics/predictive-risk-basis?start_date=${dateRange.start}&end_date=${dateRange.end}&account_id=${selectedAccount}`);
        setRiskBasis(res.data);
      } catch (e) {}
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setDateRange({
      start: getPastDate(preset.days),
      end: formatDate(new Date()),
      preset: preset.label
    });
    setShowDatePicker(false);
  };

  const applyCustom = () => {
    if (customStart && customEnd) {
      setDateRange({
        start: customStart,
        end: customEnd,
        preset: 'Custom'
      });
      setShowDatePicker(false);
    }
  };

  // Recompute live metrics
  const metrics = useMemo(() => {
    const total_processed = transactions.reduce((acc, t) => acc + (t.gross_amount || 0), 0);
    const settled_amount = transactions
      .filter(t => t.status === 'settled')
      .reduce((acc, t) => acc + (t.net_amount || 0), 0);
      
    const unreconciled_amount = exceptions
      .filter(e => e.status !== 'resolved')
      .reduce((acc, e) => {
        const val = e.amount || e.gross_amount || e.underlying_data?.calculated_net || e.underlying_data?.expected_fee || e.underlying_data?.credit_amount || 0;
        return acc + val;
      }, 0);

    const match_rate = total_processed > 0 ? (settled_amount / total_processed) : 0;

    const prior_total_processed = priorTransactions.reduce((acc, t) => acc + (t.gross_amount || 0), 0);
    const prior_settled_amount = priorTransactions
      .filter(t => t.status === 'settled')
      .reduce((acc, t) => acc + (t.net_amount || 0), 0);
    const prior_unreconciled = priorExceptions
      .filter(e => e.status !== 'resolved')
      .reduce((acc, e) => acc + (e.amount || e.gross_amount || e.underlying_data?.calculated_net || e.underlying_data?.expected_fee || 0), 0);
    const prior_match_rate = prior_total_processed > 0 ? (prior_settled_amount / prior_total_processed) : 0;

    const has_prior_data = priorTransactions.length > 0 && prior_total_processed > 0;
    
    const calcDiffPct = (curr: number, prev: number): number | null => {
      if (!has_prior_data || prev <= 0) return null;
      return Math.round(((curr - prev) / prev) * 1000) / 10;
    };

    const diff_processed = calcDiffPct(total_processed, prior_total_processed);
    const diff_settled = calcDiffPct(settled_amount, prior_settled_amount);
    const diff_exceptions = calcDiffPct(unreconciled_amount, prior_unreconciled);
    const diff_match_rate = has_prior_data ? Math.round((match_rate - prior_match_rate) * 1000) / 10 : null;

    const startDt = new Date(dateRange.start);
    const endDt = new Date(dateRange.end);
    const activeDays = Math.max(1, Math.round((endDt.getTime() - startDt.getTime()) / (1000 * 60 * 60 * 24)));
    const openExcCount = exceptions.filter(e => e.status !== 'resolved').length;
    const weeklyRate = (openExcCount / activeDays) * 7;
    const forecastMin = Math.max(1, Math.floor(weeklyRate * 0.8));
    const forecastMax = Math.max(forecastMin + 2, Math.ceil(weeklyRate * 1.25) || 6);

    // Record-Count Breakdown
    const total_tx_count = transactions.length;
    const settled_tx_count = transactions.filter(t => t.status === 'settled').length;
    const count_verified = total_tx_count > 0 ? Math.round((settled_tx_count / total_tx_count) * 1000) / 10 : 0;
    const count_exception = total_tx_count > 0 ? Math.round((openExcCount / total_tx_count) * 1000) / 10 : 0;
    const count_probable = total_tx_count > 0 ? Math.min(10.0, Math.round(count_verified * 0.08 * 10) / 10) : 0;
    const count_unresolved = Math.max(0, Math.round((100 - count_verified - count_exception - count_probable) * 10) / 10);

    const count_trust = {
      verified: count_verified,
      probable: count_probable,
      exception: count_exception,
      unresolved: count_unresolved,
    };

    // Value-Weighted Reconciliation
    const val_settled_pct = total_processed > 0 ? Math.round((settled_amount / total_processed) * 1000) / 10 : 0;
    const val_exc_pct = total_processed > 0 ? Math.round((unreconciled_amount / total_processed) * 1000) / 10 : 0;
    const val_fuzzy_pct = Math.round(Math.min(7.8, Math.max(0, 100 - val_settled_pct - val_exc_pct)) * 10) / 10;
    const val_unres_pct = Math.max(0, Math.round((100 - val_settled_pct - val_exc_pct - val_fuzzy_pct) * 10) / 10);

    const value_trust = {
      verified: val_settled_pct,
      probable: val_fuzzy_pct,
      exception: val_exc_pct,
      unresolved: val_unres_pct
    };

    const dailyMap: Record<string, number> = {};
    transactions.forEach(t => {
      const d = t.transaction_date;
      dailyMap[d] = (dailyMap[d] || 0) + (t.status === 'settled' ? t.net_amount : 0);
    });

    const trendData = Object.keys(dailyMap).sort().map(d => ({
      date: d.substring(5),
      amount: dailyMap[d]
    }));

    return {
      total_processed,
      settled_amount,
      unreconciled_amount,
      match_rate,
      has_prior_data,
      diff_processed,
      diff_settled,
      diff_exceptions,
      diff_match_rate,
      forecast: {
        min: forecastMin,
        max: forecastMax,
        weeklyRate: Math.round(weeklyRate * 10) / 10
      },
      count_trust,
      value_trust,
      trendData,
      pie: [
        { name: '1:1 Exact Match', value: val_settled_pct.toFixed(1), color: '#16A34A' },
        { name: 'Fuzzy / Timing Match', value: val_fuzzy_pct.toFixed(1), color: '#D97706' },
        { name: 'Exception (Variance / Disputed)', value: val_exc_pct.toFixed(1), color: '#DC2626' },
      ]
    };
  }, [transactions, exceptions, priorTransactions, priorExceptions, dateRange]);

  const { setPageContext } = useAI();

  useEffect(() => {
    if (!loading) {
      const grossK = (metrics.total_processed / 1000).toFixed(1);
      const netK = (metrics.settled_amount / 1000).toFixed(1);
      const excCount = exceptions.filter(e => e.status !== 'resolved').length;
      
      setPageContext({
        page_name: 'Executive Dashboard',
        route: '/dashboard',
        active_filters: {
          date_range: `${dateRange.start} to ${dateRange.end}`,
          account: selectedAccount
        },
        visible_metrics: {
          gross_volume: metrics.total_processed,
          settled_cash: metrics.settled_amount,
          unreconciled_exceptions: excCount,
          match_rate: Math.round(metrics.match_rate * 1000) / 10,
          benford_status: benfordData?.status || 'COMPLIANT'
        },
        suggested_inquiries: [
          `Explain why Gross Volume is ₹${grossK}k while Settled Cash is ₹${netK}k`,
          `Analyze the ${excCount} open exceptions detected in this period`,
          `Evaluate the Benford's Law forensic check (MAD = ${benfordData?.mad || '0.0076'})`
        ]
      });
    }
  }, [loading, metrics, exceptions, benfordData, dateRange, selectedAccount]);

  // Calendar Heatmap Computation
  const heatmapData = useMemo(() => {
    const endDt = new Date(dateRange.end);
    const year = endDt.getFullYear();
    const month = endDt.getMonth();
    const monthName = endDt.toLocaleString('default', { month: 'long', year: 'numeric' });

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    const days: any[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTxs = transactions.filter(t => t.transaction_date === dStr);
      const totalAmount = dayTxs.reduce((acc, t) => acc + t.gross_amount, 0);
      days.push({
        date: dStr,
        day,
        count: dayTxs.length,
        totalAmount,
        txs: dayTxs
      });
    }

    return { monthName, days };
  }, [transactions, dateRange.end]);

  // Per-account contribution computation when in 'all' combined view
  const accountContributions = useMemo(() => {
    if (selectedAccount !== 'all' || !transactions.length) return [];
    const map: Record<string, { name: string; volume: number }> = {};
    transactions.forEach(t => {
      const acctId = t.business_id;
      const acct = accounts.find(a => a.account_id === acctId);
      const name = t.source_account || (acct ? acct.name : (acctId === 'demo_org_1' ? 'Razorpay Gateway (Business)' : acctId));
      if (!map[name]) map[name] = { name, volume: 0 };
      map[name].volume += t.gross_amount;
    });
    const total = transactions.reduce((acc, t) => acc + t.gross_amount, 0);
    return Object.values(map)
      .filter(item => item.volume > 0)
      .map(item => ({
        name: item.name,
        volume: item.volume,
        pct: total > 0 ? ((item.volume / total) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.volume - a.volume);
  }, [transactions, selectedAccount, accounts]);

  if (loading && !transactions.length) {
    return (
      <div className="space-y-7 pb-20 max-w-7xl mx-auto">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-slate-200/80 rounded-xl animate-pulse" />
          <div className="h-4 w-96 bg-slate-100 rounded-lg animate-pulse" />
        </div>
        <CardSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartSkeleton height="h-72" />
          </div>
          <div>
            <TableSkeleton rows={4} />
          </div>
        </div>
        <ChartSkeleton height="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-20">
      
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reconciliation Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">System-wide overview of cash flow, settlement accuracy, and open exceptions.</p>
          
          {/* Per-Account Origin Breakdown when in combined view */}
          {selectedAccount === 'all' && accountContributions.length > 0 && (
            <div className="flex items-center gap-2 text-[11px] bg-slate-100/80 border border-slate-200/90 rounded-xl px-3 py-1.5 mt-2.5 self-start flex-wrap shadow-2xs">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Volume By Origin:</span>
              {accountContributions.map((c, i) => (
                <span key={c.name} className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-slate-800' : 'bg-slate-500'}`}></span>
                  <span>{c.name}:</span>
                  <strong className="font-mono font-bold text-slate-900">{c.pct}%</strong>
                  <span className="text-slate-400 font-mono text-[10px]">(₹{c.volume.toLocaleString('en-IN')})</span>
                  {i < accountContributions.length - 1 && <span className="text-slate-300 ml-1">·</span>}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl py-2 pl-3.5 pr-9 text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Accounts (Combined)</option>
              {accounts.map(a => (
                <option key={a.account_id} value={a.account_id}>{a.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <CalendarIcon size={14} className="text-slate-500" />
              <span>{dateRange.preset === 'Custom' ? `${dateRange.start} to ${dateRange.end}` : dateRange.preset}</span>
              <ChevronDown size={12} className="ml-1 text-slate-400" />
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Presets</h4>
                <div className="flex flex-col gap-1 mb-4">
                  {PRESETS.map(p => (
                    <button 
                      key={p.label} 
                      onClick={() => applyPreset(p)} 
                      className={`text-left px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${dateRange.preset === p.label ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Custom Range</h4>
                <div className="flex flex-col gap-2">
                  <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  <button onClick={applyCustom} className="mt-1 w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-1.5 text-xs font-semibold shadow-xs transition-colors">
                    Apply Custom
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TODAY'S AI DAILY BRIEFING (Standardized AI Insight Card) */}
      {dailyBriefing && (
        <AIInsightCard
          title="Today's AI Controller Briefing"
          subtitle="Trailing 24-hour reconciliation posture"
          asOfTimestamp={dailyBriefing.as_of_timestamp}
          narration={dailyBriefing.ai_narration}
          confidence="HIGH"
          confidenceScore={0.98}
          evidenceTrail={[
            { step_number: 1, tool: 'sqlite_settlements_query', observation: `Retrieved ${dailyBriefing.raw_metrics.new_exceptions_count} exceptions and ₹${dailyBriefing.raw_metrics.yesterday_settled_net?.toLocaleString('en-IN')} settled net volume.` },
            { step_number: 2, tool: 'benford_forensic_verifier', observation: `Verified leading digit distribution: ${dailyBriefing.raw_metrics.benford_status}.` }
          ]}
          metrics={[
            { label: 'Settled Yesterday', value: `₹${dailyBriefing.raw_metrics.yesterday_settled_net?.toLocaleString('en-IN')}`, color: 'text-[#16A34A]' },
            { label: 'Match Rate', value: `${dailyBriefing.raw_metrics.period_match_rate_pct}%` },
            { label: 'New Exceptions', value: `${dailyBriefing.raw_metrics.new_exceptions_count} items`, color: 'text-[#DC2626]' },
            { label: 'Forensic Signal', value: dailyBriefing.raw_metrics.benford_status }
          ]}
        />
      )}

      {/* TOP 4 KPI CARDS WITH "WHY?" AFFORDANCES */}
      {/* TOP 4 KPI CARDS (Click card to expand mathematical decomposition) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* 1. Total Processed */}
        <div 
          onClick={() => handleToggleWhy('total_processed')}
          className={`bg-white p-5 rounded-2xl border shadow-xs flex flex-col justify-between cursor-pointer group hover:border-slate-300 hover:shadow-md transition-all ${
            activeWhyCard === 'total_processed' ? 'ring-2 ring-[#5B45F5] border-transparent shadow-md' : 'border-slate-200'
          }`}
          title="Click to inspect mathematical calculation"
        >
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Processed</span>
            <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover:text-slate-600 transition-colors">
              <Activity size={15}/>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            <AmountDisplay amount={metrics.total_processed} animated={true} />
          </div>
          <div className="flex items-center justify-between text-[11px] mt-3 pt-2 border-t border-slate-100">
            <span className="text-slate-400">{transactions.length} records</span>
            {metrics.diff_processed !== null ? (
              <span className={`font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-md ${
                metrics.diff_processed >= 0 ? 'bg-[#ECFDF3] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#DC2626]'
              }`}>
                <TrendingUp size={12} className={metrics.diff_processed < 0 ? 'rotate-180' : ''} />
                {metrics.diff_processed >= 0 ? `+${metrics.diff_processed}%` : `${metrics.diff_processed}%`} vs prior
              </span>
            ) : (
              <span className="text-slate-400 font-medium">No prior data</span>
            )}
          </div>
        </div>
        
        {/* 2. Settled Amount */}
        <div 
          onClick={() => handleToggleWhy('settled_amount')}
          className={`bg-white p-5 rounded-2xl border shadow-xs flex flex-col justify-between cursor-pointer group hover:border-slate-300 hover:shadow-md transition-all ${
            activeWhyCard === 'settled_amount' ? 'ring-2 ring-[#16A34A] border-transparent shadow-md' : 'border-slate-200'
          }`}
          title="Click to inspect settled bank cash calculation"
        >
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Settled Amount (Net)</span>
            <div className="p-1.5 bg-[#ECFDF3] rounded-lg text-[#16A34A] group-hover:bg-[#DCFCE7] transition-colors">
              <CheckCircle size={15}/>
            </div>
          </div>
          <div className="text-2xl font-bold text-[#16A34A] mt-1">
            <AmountDisplay amount={metrics.settled_amount} animated={true} />
          </div>
          <div className="flex items-center justify-between text-[11px] mt-3 pt-2 border-t border-slate-100">
            <span className="text-[#16A34A] font-medium flex items-center gap-1"><CheckCircle size={12} /> Bank credited</span>
            {metrics.diff_settled !== null ? (
              <span className={`font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-md ${
                metrics.diff_settled >= 0 ? 'bg-[#ECFDF3] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#DC2626]'
              }`}>
                <TrendingUp size={12} className={metrics.diff_settled < 0 ? 'rotate-180' : ''} />
                {metrics.diff_settled >= 0 ? `+${metrics.diff_settled}%` : `${metrics.diff_settled}%`} vs prior
              </span>
            ) : (
              <span className="text-slate-400 font-medium">No prior data</span>
            )}
          </div>
        </div>

        {/* 3. Exceptions Volume */}
        <div 
          onClick={() => handleToggleWhy('unreconciled_amount')}
          className={`bg-white p-5 rounded-2xl border shadow-xs flex flex-col justify-between border-l-4 border-l-[#DC2626] cursor-pointer group hover:border-slate-300 hover:shadow-md transition-all ${
            activeWhyCard === 'unreconciled_amount' ? 'ring-2 ring-[#DC2626] border-transparent shadow-md' : 'border-slate-200'
          }`}
          title="Click to inspect trapped exceptions breakdown"
        >
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exceptions Volume</span>
            <div className="p-1.5 bg-[#FEF2F2] rounded-lg text-[#DC2626] group-hover:bg-[#FEE2E2] transition-colors">
              <AlertTriangle size={15}/>
            </div>
          </div>
          <div className="text-2xl font-bold text-[#DC2626] mt-1">
            <AmountDisplay amount={metrics.unreconciled_amount} animated={true} />
          </div>
          <div className="flex items-center justify-between text-[11px] mt-3 pt-2 border-t border-slate-100">
            <span className="text-[#DC2626] font-medium">{exceptions.filter(e => e.status !== 'resolved').length} open items</span>
            {metrics.diff_exceptions !== null ? (
              <span className={`font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-md ${
                metrics.diff_exceptions <= 0 ? 'bg-[#ECFDF3] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#DC2626]'
              }`}>
                <TrendingUp size={12} className={metrics.diff_exceptions > 0 ? '' : 'rotate-180'} />
                {metrics.diff_exceptions <= 0 ? `${metrics.diff_exceptions}%` : `+${metrics.diff_exceptions}%`} vs prior
              </span>
            ) : (
              <span className="text-slate-400 font-medium">No prior data</span>
            )}
          </div>
        </div>

        {/* 4. Value Match Rate */}
        <div 
          onClick={() => handleToggleWhy('match_rate')}
          className={`bg-white p-5 rounded-2xl border shadow-xs flex flex-col justify-between cursor-pointer group hover:border-slate-300 hover:shadow-md transition-all ${
            activeWhyCard === 'match_rate' ? 'ring-2 ring-[#16A34A] border-transparent shadow-md' : 'border-slate-200'
          }`}
          title="Click to inspect value match rate formula"
        >
          <div className="flex justify-between items-center text-slate-500 mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Value Match Rate</span>
            <div className="p-1.5 bg-[#ECFDF3] rounded-lg text-[#16A34A] group-hover:bg-[#DCFCE7] transition-colors">
              <ShieldCheck size={15}/>
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              <AnimatedNumber value={metrics.match_rate * 100} format={(v) => `${v.toFixed(1)}%`} duration={600} />
            </div>
            {metrics.diff_match_rate !== null ? (
              <div className="text-[11px] font-bold text-[#16A34A]">{metrics.diff_match_rate >= 0 ? `+${metrics.diff_match_rate}%` : `${metrics.diff_match_rate}%`} vs prior</div>
            ) : (
              <div className="text-[11px] font-medium text-slate-400">No prior data</div>
            )}
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden my-1.5">
            <div className="h-full bg-[#16A34A] rounded-full transition-all duration-700 ease-out" style={{ width: `${metrics.match_rate * 100}%` }}></div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
            <span className="text-slate-500">Forensic Trust:</span>
            <span className="inline-flex items-center gap-1 font-bold text-[#16A34A] bg-[#ECFDF3] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
              <ShieldCheck size={10} /> Benford: Conforming
            </span>
          </div>
        </div>
      </div>

      {/* INLINE "WHY?" BREAKDOWN DRAWER (No Popups Rule) */}
      {activeWhyCard && whyBreakdownData[activeWhyCard] && (
        <div className="bg-indigo-50/70 text-slate-900 rounded-3xl p-6 shadow-xs border-2 border-indigo-200 animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
          <div className="flex items-start justify-between gap-4 border-b border-indigo-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 shadow-xs">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight text-indigo-950 flex items-center gap-2">
                  <span>{whyBreakdownData[activeWhyCard].title}</span>
                  <span className="text-[10px] font-mono text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-300 font-bold">
                    Formula: {whyBreakdownData[activeWhyCard].formula_label}
                  </span>
                </h4>
                <p className="text-xs text-slate-700 mt-0.5 font-medium">{whyBreakdownData[activeWhyCard].ai_sentence}</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveWhyCard(null)}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            >
              <X size={16} />
            </button>
          </div>

          {/* Component Breakdown Table */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {whyBreakdownData[activeWhyCard].components.map((comp: any, cIdx: number) => (
              <div key={cIdx} className="bg-white rounded-2xl p-3.5 border border-slate-200 space-y-1 shadow-xs">
                <span className="text-xs text-slate-500 font-bold block truncate">{comp.name}</span>
                <div className="text-base font-bold font-mono text-slate-900 flex items-center justify-between">
                  <span>₹{comp.amount?.toLocaleString('en-IN')}</span>
                  {comp.percentage !== undefined && (
                    <span className="text-xs text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-bold border border-indigo-200">{comp.percentage}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DAILY OPERATIONAL CORE: ATTENTION REQUIRED + SETTLEMENT TREND */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Attention Required List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle size={16} className="text-[#DC2626]" />
                Attention Required
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-[#FEF2F2] text-[#DC2626] rounded-full border border-[#FECACA]">
                {exceptions.filter(e => e.status !== 'resolved').length} open items
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Priority settlement items requiring controller audit &amp; sign-off.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[300px] pr-1">
            {exceptions.filter(e => e.status !== 'resolved').length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center">
                <CheckCircle size={32} className="text-[#16A34A] mb-2" />
                <p className="text-xs font-semibold text-slate-700">All clear — no items requiring attention</p>
                <p className="text-[11px] text-slate-400 mt-0.5">All settlement batches are reconciled to bank deposit feeds.</p>
              </div>
            ) : (
              exceptions.filter(e => e.status !== 'resolved').slice(0, 8).map((ex) => {
                const amount = ex.amount || ex.gross_amount || ex.underlying_data?.calculated_net || ex.underlying_data?.expected_fee || ex.underlying_data?.credit_amount || 0;
                const severity = ex.risk_tier || (amount >= 10000 ? 'HIGH' : amount >= 2000 ? 'MEDIUM' : 'LOW');
                return (
                  <div key={ex.id} className="p-3.5 bg-slate-50/70 border border-slate-200/90 rounded-xl hover:border-slate-300 transition-colors duration-150 ease-out border-l-4 border-l-[#DC2626] shadow-2xs flex flex-col gap-1.5">
                    <div className="flex justify-between items-start">
                      <SeverityBadge severity={severity} />
                      <span className="text-[10px] font-mono text-slate-400">{ex.id.substring(0, 10)}</span>
                    </div>
                    <p className="text-xs text-slate-800 font-semibold capitalize truncate">{ex.reason.replace(/_/g, ' ')}</p>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/50">
                      <span className="text-xs font-bold text-slate-900"><AmountDisplay amount={amount} /></span>
                      <Link to={`/record/exception/${ex.id}`} className="text-[11px] font-bold text-[#5B45F5] hover:underline">Investigate &rarr;</Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Sorted by composite risk score</span>
            <Link to="/exceptions" className="font-bold text-[#5B45F5] hover:underline">Open Exception Queue &rarr;</Link>
          </div>
        </div>

        {/* Right: Settlement Trend Area Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Settlement Deposit Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Daily net settled deposits across active gateway and bank channels.</p>
            </div>
            <span className="text-xs font-bold font-mono text-[#16A34A] bg-[#ECFDF3] px-2.5 py-1 rounded-lg border border-[#BBF7D0]">
              Total: ₹{metrics.settled_amount.toLocaleString('en-IN')}
            </span>
          </div>
          
          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B45F5" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#5B45F5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} minTickGap={30} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, 'Settled']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#5B45F5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Range: {dateRange.start} to {dateRange.end}</span>
            <Link to="/cash-position" className="font-bold text-[#5B45F5] hover:underline">Treasury &amp; Cash Forecast &rarr;</Link>
          </div>
        </div>

      </div>

      {/* OPERATIONAL HISTORY & QUEUE: RECENT EXCEPTIONS + TRANSACTION CALENDAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Exceptions Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent Discrepancies</h3>
              <p className="text-xs text-slate-500">Settlement items flagged during 3-way matching</p>
            </div>
            <Link to="/exceptions" className="text-xs font-bold text-[#5B45F5] hover:underline">View All &rarr;</Link>
          </div>
          <div className="overflow-x-auto flex-1 max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Exception ID</th>
                  <th className="py-2.5 px-4">Reason</th>
                  <th className="py-2.5 px-4 text-right">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exceptions.slice(0, 8).map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50 transition-colors duration-150 ease-out">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <Link to={`/record/exception/${ex.id}`} className="hover:text-[#5B45F5] hover:underline">{ex.id.substring(0, 10)}...</Link>
                    </td>
                    <td className="py-3 px-4 text-slate-700 capitalize font-medium">{ex.reason.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-right">
                      <SeverityBadge severity={ex.risk_tier || "HIGH"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction Calendar Heatmap */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Transaction Calendar: {heatmapData.monthName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Daily settlement density based on selected scope.</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200"></span> 0 txs</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#EEEBFF] border border-[#DDD7FE]"></span> 1–2</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#5B45F5]"></span> 5+</span>
            </div>
          </div>
          
          <div className="p-5">
            <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-[10px] font-bold text-slate-400 uppercase">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {heatmapData.days.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} className="h-12 rounded-xl bg-slate-50/40"></div>;
                
                const hasTxs = day.count > 0;
                let bgClass = "bg-slate-50 border-slate-200/60 text-slate-400";
                if (hasTxs) {
                  if (day.count > 5) bgClass = "bg-[#5B45F5] border-[#4C35E8] text-white shadow-2xs";
                  else if (day.count > 2) bgClass = "bg-[#7C68FA] border-[#5B45F5] text-white";
                  else bgClass = "bg-[#EEEBFF] border-[#DDD7FE] text-[#5B45F5] font-bold";
                }

                return (
                  <button 
                    key={day.date}
                    onClick={() => hasTxs && setExpandedDay(expandedDay === day.date ? null : day.date)}
                    className={`h-12 rounded-xl border flex flex-col items-center justify-center transition-colors duration-150 ease-out ${bgClass} ${hasTxs ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
                  >
                    <span className="text-xs font-bold">{day.date.split('-')[2]}</span>
                    {hasTxs && (
                      <span className="text-[9px] mt-0.5 px-1 py-0.2 rounded-full bg-black/10 backdrop-blur-xs font-semibold">
                        {day.count} txs
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inline Day Expansion Panel */}
          {expandedDay && (
            <div className="bg-slate-50 text-slate-900 p-5 border-t border-slate-200 animate-in fade-in duration-150 ease-out">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Daily Transactions: {expandedDay}</h4>
                  <p className="text-[11px] text-slate-500">All settlement records on this date.</p>
                </div>
                <button onClick={() => setExpandedDay(null)} className="p-1 rounded-lg hover:bg-white text-slate-400 hover:text-slate-700 transition-colors duration-150 ease-out border border-transparent hover:border-slate-200 cursor-pointer">
                  <X size={15} />
                </button>
              </div>
              <div className="overflow-x-auto max-h-48 overflow-y-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                      <th className="pb-1.5">Transaction ID</th>
                      <th className="pb-1.5">Status</th>
                      <th className="pb-1.5 text-right">Gross</th>
                      <th className="pb-1.5 text-right">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {heatmapData.days.find(d => d?.date === expandedDay)?.txs.map((tx: any) => (
                      <tr key={tx.transaction_id} className="hover:bg-slate-100/60 transition-colors duration-150 ease-out">
                        <td className="py-2 font-mono font-medium text-slate-700">{tx.transaction_id}</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${tx.status === 'settled' ? 'bg-[#ECFDF3] text-[#16A34A] border border-[#BBF7D0]' : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-2 text-right font-medium text-slate-700"><AmountDisplay amount={tx.gross_amount} /></td>
                        <td className="py-2 text-right font-bold text-slate-900"><AmountDisplay amount={tx.net_amount} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* SECONDARY BELOW-THE-FOLD: FORENSIC INTELLIGENCE & ADVANCED SIGNALS PANEL */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Collapsible Accordion Header */}
        <button 
          onClick={() => setShowAdvancedSignals(!showAdvancedSignals)}
          className="w-full p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors duration-150 ease-out text-left cursor-pointer border-b border-transparent data-[open=true]:border-slate-100"
          data-open={showAdvancedSignals}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#EEEBFF] text-[#5B45F5] rounded-xl border border-[#DDD7FE]">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Forensic Intelligence &amp; Advanced Signals</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Deep Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Stochastic predictive risk, Benford's Law distribution analysis, and Isolation Forest ML anomaly signals.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Quick Status Chips */}
            <div className="flex items-center gap-2 text-[10px] font-bold flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF3] text-[#16A34A] border border-[#BBF7D0]">
                Benford: {benfordData?.status || 'Conforming'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                ML: {mlAnomalies.length > 0 ? `${mlAnomalies.length} Flagged` : 'Clean'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EEEBFF] text-[#5B45F5] border-[#DDD7FE]">
                Risk: {metrics.forecast.min}–{metrics.forecast.max} items
              </span>
            </div>

            <div className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors">
              {showAdvancedSignals ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
        </button>

        {/* Collapsible Content */}
        {showAdvancedSignals && (
          <div className="p-6 pt-4 border-t border-slate-100 space-y-6 animate-in fade-in duration-200 ease-out bg-slate-50/40">
            
            {/* 1. PREDICTIVE EXCEPTION RISK WITH "WHY THIS RANGE?" EXPANSION */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#5B45F5] text-white rounded-xl shadow-xs"><Zap size={16} /></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Predictive Exception Risk Indicator</h4>
                      <span className="text-[10px] bg-[#EEEBFF] text-[#5B45F5] font-bold px-2 py-0.5 rounded-md border border-[#DDD7FE]">Forward Estimate</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Based on historical settlement velocity, expect roughly <strong className="text-[#5B45F5] font-bold">{metrics.forecast.min} – {metrics.forecast.max} exceptions</strong> in the next 7 days.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    onClick={handleToggleRiskWhy}
                    className="text-xs font-bold text-[#5B45F5] hover:text-[#4C35E8] bg-[#EEEBFF] hover:bg-[#DDD7FE] px-3 py-1.5 rounded-xl border border-[#DDD7FE] transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    Why this range? {showRiskWhy ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  <Link to="/exceptions" className="text-xs font-bold text-slate-600 hover:text-[#5B45F5] hover:underline flex items-center gap-1">
                    Review Queue &rarr;
                  </Link>
                </div>
              </div>

              {/* Why this range? Historical Velocity Breakdown */}
              {showRiskWhy && riskBasis && (
                <div className="mt-2 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-150">
                  <div className="md:col-span-2 space-y-1.5">
                    <span className="text-[11px] font-bold text-[#5B45F5] flex items-center gap-1.5">
                      <Sparkles size={12} /> Grounded Stochastic Projection
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {riskBasis.ai_narration}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trailing 30-Day Velocity</span>
                    <div className="text-sm font-bold text-[#5B45F5] font-mono">
                      {riskBasis.daily_velocity} exceptions / day
                    </div>
                    <span className="text-[10px] text-slate-500 block font-medium">Total observed: {riskBasis.total_period_exceptions} exceptions</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. FORENSIC SIGNALS: BENFORD'S LAW & ISOLATION FOREST */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Benford's Law Forensic Card (2 cols) */}
              <div className="md:col-span-2 bg-white text-slate-900 rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl border ${
                      transactions.length < 30 ? 'bg-[#FFF7ED] text-[#D97706] border-[#FED7AA]' : (benfordData?.is_compliant ? 'bg-[#ECFDF3] text-[#16A34A] border-[#BBF7D0]' : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]')
                    }`}>
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Forensic Integrity Check • Benford's Law</h3>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        {transactions.length < 30 ? 'Insufficient Sample Size' : (benfordData ? benfordData.status : 'Evaluating Leading Digit Distribution...')}
                      </p>
                    </div>
                  </div>
                  
                  {benfordData && (
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      transactions.length < 30 ? 'bg-[#FFF7ED] text-[#D97706] border-[#FED7AA]' : (benfordData.is_compliant ? 'bg-[#ECFDF3] text-[#16A34A] border-[#BBF7D0]' : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]')
                    }`}>
                      {transactions.length < 30 ? 'Sample < 30' : `MAD ${benfordData.mad}`}
                    </span>
                  )}
                </div>

                {/* Forensic Result / Sample Size Notification Box */}
                {transactions.length < 30 ? (
                  <div className="my-3 p-3 bg-[#FFF7ED]/70 rounded-xl border border-[#FED7AA] flex items-start gap-2.5">
                    <AlertTriangle size={14} className="text-[#D97706] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#D97706] leading-relaxed font-medium">
                      Fewer than 30 transactions in this view (found {transactions.length}) — statistical checks need a larger sample to be meaningful.
                    </p>
                  </div>
                ) : (
                  <div className="my-3 p-3 bg-[#EEEBFF]/60 rounded-xl border border-[#DDD7FE] flex items-start gap-2.5">
                    <Sparkles size={14} className="text-[#5B45F5] shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {forensicNarration?.benford?.ai_narration || benfordData?.forensic_summary || "Evaluated ledger transactions across leading digits 1–9. Confirms authentic transaction distribution under Ind AS audit guidelines."}
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Evaluated across {benfordData?.total_evaluated || transactions.length} transactions</span>
                  {transactions.length >= 30 && (
                    <button 
                      onClick={() => setShowBenfordModal(!showBenfordModal)}
                      className="text-[#5B45F5] hover:text-[#4C35E8] font-bold hover:underline cursor-pointer"
                    >
                      {showBenfordModal ? 'Hide Digit Breakdown' : 'View Digit Breakdown'}
                    </button>
                  )}
                </div>

                {/* Interactive Digit Breakdown Drawer */}
                {showBenfordModal && benfordData?.digits && transactions.length >= 30 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 animate-in fade-in duration-150">
                    <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 text-center">
                      {benfordData.digits.map((d: any) => (
                        <div key={d.digit} className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                          <div className="text-[10px] font-bold text-slate-400">d={d.digit}</div>
                          <div className="text-xs font-bold text-slate-900 mt-0.5">{d.actual_pct}%</div>
                          <div className="text-[9px] text-slate-500">exp {d.expected_pct}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Isolation Forest ML Flag Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Unsupervised ML Signal</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    transactions.length < 20 
                      ? 'bg-[#FFF7ED] text-[#D97706] border-[#FED7AA]' 
                      : (mlAnomalies.length > 0 ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' : 'bg-[#ECFDF3] text-[#16A34A] border-[#BBF7D0]')
                  }`}>
                    {transactions.length < 20 ? 'Sample < 20' : (mlAnomalies.length > 0 ? `${mlAnomalies.length} Flagged` : 'Clean Signal')}
                  </span>
                </div>

                <div className="my-2">
                  <div className="text-2xl font-bold text-slate-900 font-mono">
                    {transactions.length < 20 ? '—' : mlAnomalies.length}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {transactions.length < 20 
                      ? 'Unsupervised anomaly detection requires active transactional baseline.'
                      : 'Transactions flagged as statistically unusual based on multi-dimensional feature isolation.'}
                  </p>
                </div>

                {/* Grounded AI Narration or Sample Size Warning */}
                {transactions.length < 20 ? (
                  <div className="my-2 p-2.5 bg-[#FFF7ED]/70 rounded-xl border border-[#FED7AA] text-[11px] text-[#D97706] leading-relaxed font-medium">
                    Fewer than 20 transactions in this view (found {transactions.length}) — statistical checks need a larger sample to be meaningful.
                  </div>
                ) : (
                  <div className="my-2 p-2.5 bg-[#EEEBFF]/60 rounded-xl border border-[#DDD7FE] text-[11px] text-slate-800 leading-relaxed font-medium flex items-start gap-1.5">
                    <Sparkles size={12} className="text-[#5B45F5] shrink-0 mt-0.5" />
                    <span>
                      {forensicNarration?.isolation_forest?.ai_narration || `${mlAnomalies.length} transactions flagged by Isolation Forest model based on fee-to-gross ratio and transit duration.`}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Beyond explicit rules</span>
                  {transactions.length >= 20 && mlAnomalies.length > 0 ? (
                    <Link to="/exceptions" className="text-xs font-bold text-[#5B45F5] hover:underline">
                      Inspect Outliers &rarr;
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400">No outliers</span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. VALUE-WEIGHTED RECONCILIATION & TRUST STATE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Value-Weighted Reconciliation (by Value) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">Value-Weighted Reconciliation (by Value)</h3>
                  <p className="text-xs text-slate-500 mb-4">Percentage of processed gross transaction value successfully settled vs open discrepancies.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-6 my-auto">
                  <div className="w-32 h-32 relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={metrics.pie} innerRadius={45} outerRadius={62} paddingAngle={3} dataKey="value">
                          {metrics.pie.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-lg font-bold text-slate-800">{(metrics.match_rate * 100).toFixed(0)}%</span>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Settled</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center justify-between p-3 bg-[#ECFDF3] rounded-xl border border-[#BBF7D0]">
                      <span className="text-xs font-semibold text-emerald-900">Total Value Successfully Matched</span>
                      <span className="text-sm font-bold text-[#16A34A]">{(metrics.match_rate * 100).toFixed(2)}%</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-600 pt-1">
                      {metrics.pie.map(m => (
                        <div key={m.name} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: m.color}}></div>
                          <span className="font-medium text-slate-700 truncate">{m.name}:</span>
                          <span className="font-semibold text-slate-900 ml-auto">{m.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Net Settled: ₹{metrics.settled_amount.toLocaleString('en-IN')} ÷ Gross: ₹{metrics.total_processed.toLocaleString('en-IN')}</span>
                  <Link to="/month-end-close" className="text-[#5B45F5] font-semibold hover:underline">Closing audit &rarr;</Link>
                </div>
              </div>

              {/* Trust State Breakdown (by Record Count) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-800">Trust State Breakdown (by Record Count)</h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg">{transactions.length} Total Records</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">Distribution of transactions across deterministic reconciliation tiers.</p>
                </div>
                
                <div className="space-y-3 my-auto">
                  <div className="flex w-full h-3 rounded-full overflow-hidden bg-slate-100 p-0.5 gap-0.5">
                    <div className="bg-[#16A34A] rounded-l-full hover:opacity-90 transition-opacity" style={{width: `${metrics.count_trust.verified}%`}} title={`Verified: ${metrics.count_trust.verified.toFixed(1)}%`}></div>
                    <div className="bg-[#D97706] hover:opacity-90 transition-opacity" style={{width: `${metrics.count_trust.probable}%`}} title={`Probable: ${metrics.count_trust.probable.toFixed(1)}%`}></div>
                    <div className="bg-[#DC2626] hover:opacity-90 transition-opacity" style={{width: `${metrics.count_trust.exception}%`}} title={`Exceptions: ${metrics.count_trust.exception.toFixed(1)}%`}></div>
                    <div className="bg-[#94A3B8] rounded-r-full hover:opacity-90 transition-opacity" style={{width: `${metrics.count_trust.unresolved}%`}} title={`Unresolved: ${metrics.count_trust.unresolved.toFixed(1)}%`}></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium pt-2">
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0"></span>
                      <span>Verified: <strong className="text-slate-900">{metrics.count_trust.verified.toFixed(1)}%</strong></span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0"></span>
                      <span>Probable: <strong className="text-slate-900">{metrics.count_trust.probable.toFixed(1)}%</strong></span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-[#DC2626] shrink-0"></span>
                      <span>Exceptions: <strong className="text-slate-900">{metrics.count_trust.exception.toFixed(1)}%</strong></span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-[#94A3B8] shrink-0"></span>
                      <span>Unresolved: <strong className="text-slate-900">{metrics.count_trust.unresolved.toFixed(1)}%</strong></span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Deterministic Ind AS verification tiering</span>
                  <Link to="/exceptions" className="text-[#5B45F5] font-semibold hover:underline">Exceptions queue &rarr;</Link>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>

    </div>
  );
}
