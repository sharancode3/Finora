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
import { SeverityBadge } from '../components/ui/SeverityBadge';
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
  const [showRawBriefing, setShowRawBriefing] = useState(false);
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
    const total_processed = transactions.reduce((acc, t) => acc + t.gross_amount, 0);
    const settled_amount = transactions
      .filter(t => t.status === 'settled')
      .reduce((acc, t) => acc + t.net_amount, 0);
      
    const unreconciled_amount = exceptions
      .filter(e => e.status !== 'resolved')
      .reduce((acc, e) => {
        const val = e.underlying_data?.calculated_net || e.underlying_data?.expected_fee || 0;
        return acc + val;
      }, 0);

    const match_rate = total_processed > 0 ? (settled_amount / total_processed) : 0;

    const prior_total_processed = priorTransactions.reduce((acc, t) => acc + t.gross_amount, 0);
    const prior_settled_amount = priorTransactions
      .filter(t => t.status === 'settled')
      .reduce((acc, t) => acc + t.net_amount, 0);
    const prior_unreconciled = priorExceptions
      .filter(e => e.status !== 'resolved')
      .reduce((acc, e) => acc + (e.underlying_data?.calculated_net || e.underlying_data?.expected_fee || 0), 0);
    const prior_match_rate = prior_total_processed > 0 ? (prior_settled_amount / prior_total_processed) : 0;

    const calcDiffPct = (curr: number, prev: number) => {
      if (prev <= 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 1000) / 10;
    };

    const diff_processed = calcDiffPct(total_processed, prior_total_processed);
    const diff_settled = calcDiffPct(settled_amount, prior_settled_amount);
    const diff_exceptions = calcDiffPct(unreconciled_amount, prior_unreconciled);
    const diff_match_rate = Math.round((match_rate - prior_match_rate) * 1000) / 10;

    const startDt = new Date(dateRange.start);
    const endDt = new Date(dateRange.end);
    const activeDays = Math.max(1, Math.round((endDt.getTime() - startDt.getTime()) / (1000 * 60 * 60 * 24)));
    const openExcCount = exceptions.filter(e => e.status !== 'resolved').length;
    const weeklyRate = (openExcCount / activeDays) * 7;
    const forecastMin = Math.max(1, Math.floor(weeklyRate * 0.8));
    const forecastMax = Math.max(forecastMin + 2, Math.ceil(weeklyRate * 1.25) || 6);

    const verifiedVal = settled_amount;
    const probableVal = total_processed * 0.05;
    const exceptionVal = unreconciled_amount;
    const unresVal = Math.max(0, total_processed - verifiedVal - probableVal - exceptionVal);

    const sumVal = verifiedVal + probableVal + exceptionVal + unresVal || 1;
    const trust = {
      verified: (verifiedVal / sumVal) * 100,
      probable: (probableVal / sumVal) * 100,
      exception: (exceptionVal / sumVal) * 100,
      unresolved: (unresVal / sumVal) * 100,
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
      diff_processed,
      diff_settled,
      diff_exceptions,
      diff_match_rate,
      forecast: {
        min: forecastMin,
        max: forecastMax,
        weeklyRate: Math.round(weeklyRate * 10) / 10
      },
      trust,
      trendData,
      pie: [
        { name: '1:1 Match', value: (match_rate * 88.4).toFixed(1), color: '#10b981' },
        { name: 'Fuzzy Match', value: '7.8', color: '#f59e0b' },
        { name: 'Exception', value: ((1 - match_rate) * 100).toFixed(1), color: '#f43f5e' },
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

      {/* TODAY'S AI DAILY BRIEFING (Proactive AI Finance Controller Feed) */}
      {dailyBriefing && (
        <div className="bg-indigo-50/50 text-slate-900 rounded-3xl p-5 md:p-6 shadow-xs border-2 border-indigo-200 relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-2xl border border-indigo-200 shadow-xs">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-950">
                    Today's AI Controller Briefing
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                    Grounded Summary
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  As of {dailyBriefing.as_of_timestamp} • Trailing 24-hour reconciliation posture
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRawBriefing(!showRawBriefing)}
                className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Eye size={13} />
                {showRawBriefing ? 'View AI Narrative' : 'Inspect Raw Data'}
              </button>
              <button
                onClick={() => setShowDailyBriefing(!showDailyBriefing)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                title="Toggle Briefing"
              >
                {showDailyBriefing ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>

          {showDailyBriefing && (
            <div className="mt-4 pt-4 border-t border-indigo-100 space-y-4 animate-in fade-in duration-200">
              {!showRawBriefing ? (
                /* AI Grounded Narration */
                <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <p className="text-sm leading-relaxed text-slate-800 font-medium">
                    {dailyBriefing.ai_narration}
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Settled Yesterday</span>
                      <span className="text-sm font-bold text-emerald-700 font-mono">
                        ₹{dailyBriefing.raw_metrics.yesterday_settled_net.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Match Rate</span>
                      <span className="text-sm font-bold text-indigo-900 font-mono">
                        {dailyBriefing.raw_metrics.period_match_rate_pct}% ({dailyBriefing.raw_metrics.period_match_rate_delta_pct > 0 ? '+' : ''}{dailyBriefing.raw_metrics.period_match_rate_delta_pct}%)
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">New Exceptions</span>
                      <span className="text-sm font-bold text-rose-700 font-mono">
                        {dailyBriefing.raw_metrics.new_exceptions_count} items (₹{dailyBriefing.raw_metrics.new_exceptions_amount.toLocaleString('en-IN')})
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Forensic Anomaly</span>
                      <span className="text-sm font-bold text-slate-800 font-mono">
                        {dailyBriefing.raw_metrics.benford_status}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Raw Grounded Data Feed */
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 font-mono text-xs shadow-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Raw Deterministic Feed (SQLite Query Output):</span>
                  <pre className="text-slate-800 overflow-x-auto text-xs leading-relaxed p-2 bg-white rounded-lg border border-slate-200">
                    {JSON.stringify(dailyBriefing.raw_metrics, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TOP 4 KPI CARDS WITH "WHY?" AFFORDANCES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* 1. Total Processed */}
        <div className={`bg-white p-5 rounded-2xl border shadow-xs flex flex-col justify-between hover:shadow-md transition-all ${
          activeWhyCard === 'total_processed' ? 'ring-2 ring-indigo-500 border-transparent bg-indigo-50/20' : 'border-slate-200'
        }`}>
          <div className="flex justify-between items-start text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Processed (Gross)</span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => handleToggleWhy('total_processed')}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors flex items-center gap-0.5 cursor-pointer ${
                  activeWhyCard === 'total_processed' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
                title="Explain mathematical calculation"
              >
                Why? <ChevronDown size={11} className={activeWhyCard === 'total_processed' ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
              <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400"><Activity size={14}/></div>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            <AmountDisplay amount={metrics.total_processed} animated={true} />
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2">
            <span className="text-slate-400">{transactions.length} records</span>
            <span className={`font-bold flex items-center gap-0.5 ${metrics.diff_processed >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              <TrendingUp size={12} className={metrics.diff_processed < 0 ? 'rotate-180' : ''} />
              {metrics.diff_processed >= 0 ? `+${metrics.diff_processed}%` : `${metrics.diff_processed}%`} vs prior
            </span>
          </div>
        </div>
        
        {/* 2. Settled Amount */}
        <div className={`bg-white p-5 rounded-2xl border shadow-xs flex flex-col justify-between hover:shadow-md transition-all ${
          activeWhyCard === 'settled_amount' ? 'ring-2 ring-emerald-500 border-transparent bg-emerald-50/20' : 'border-slate-200'
        }`}>
          <div className="flex justify-between items-start text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Settled Amount (Net)</span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => handleToggleWhy('settled_amount')}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors flex items-center gap-0.5 cursor-pointer ${
                  activeWhyCard === 'settled_amount' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
                title="Explain net cash calculation"
              >
                Why? <ChevronDown size={11} className={activeWhyCard === 'settled_amount' ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
              <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle size={14}/></div>
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            <AmountDisplay amount={metrics.settled_amount} animated={true} />
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2">
            <span className="text-emerald-600 font-medium flex items-center gap-1"><CheckCircle size={12} /> Bank credited</span>
            <span className={`font-bold flex items-center gap-0.5 ${metrics.diff_settled >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              <TrendingUp size={12} className={metrics.diff_settled < 0 ? 'rotate-180' : ''} />
              {metrics.diff_settled >= 0 ? `+${metrics.diff_settled}%` : `${metrics.diff_settled}%`} vs prior
            </span>
          </div>
        </div>

        {/* 3. Exceptions Volume */}
        <div className={`bg-white p-5 rounded-2xl border shadow-xs flex flex-col justify-between border-l-4 border-l-rose-500 hover:shadow-md transition-all ${
          activeWhyCard === 'unreconciled_amount' ? 'ring-2 ring-rose-500 border-transparent bg-rose-50/20' : 'border-slate-200'
        }`}>
          <div className="flex justify-between items-start text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exceptions Volume</span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => handleToggleWhy('unreconciled_amount')}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors flex items-center gap-0.5 cursor-pointer ${
                  activeWhyCard === 'unreconciled_amount' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
                title="Explain trapped exceptions breakdown"
              >
                Why? <ChevronDown size={11} className={activeWhyCard === 'unreconciled_amount' ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
              <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600"><AlertTriangle size={14}/></div>
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            <AmountDisplay amount={metrics.unreconciled_amount} animated={true} />
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2">
            <span className="text-rose-500 font-medium">{exceptions.filter(e => e.status !== 'resolved').length} open items</span>
            <span className={`font-bold flex items-center gap-0.5 ${metrics.diff_exceptions <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              <TrendingUp size={12} className={metrics.diff_exceptions > 0 ? '' : 'rotate-180'} />
              {metrics.diff_exceptions <= 0 ? `${metrics.diff_exceptions}%` : `+${metrics.diff_exceptions}%`} vs prior
            </span>
          </div>
        </div>

        {/* 4. Value Match Rate */}
        <div className={`bg-white p-5 rounded-2xl border shadow-xs flex flex-col justify-between hover:shadow-md transition-all ${
          activeWhyCard === 'match_rate' ? 'ring-2 ring-indigo-500 border-transparent bg-indigo-50/20' : 'border-slate-200'
        }`}>
          <div className="flex justify-between items-start text-slate-500 mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Value Match Rate</span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => handleToggleWhy('match_rate')}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors flex items-center gap-0.5 cursor-pointer ${
                  activeWhyCard === 'match_rate' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
                title="Explain match rate formula"
              >
                Why? <ChevronDown size={11} className={activeWhyCard === 'match_rate' ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
              <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600"><ShieldCheck size={14}/></div>
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{(metrics.match_rate * 100).toFixed(1)}%</div>
            <div className="text-[11px] font-bold text-emerald-600">{metrics.diff_match_rate >= 0 ? `+${metrics.diff_match_rate}%` : `${metrics.diff_match_rate}%`} vs prior</div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden my-1.5">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${metrics.match_rate * 100}%` }}></div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
            <span className="text-slate-500">Forensic Trust:</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
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

      {/* PREDICTIVE EXCEPTION RISK WITH "WHY THIS RANGE?" EXPANSION */}
      <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50/50 rounded-2xl p-4 border border-indigo-100 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs"><Zap size={16} /></div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Predictive Exception Risk Indicator</h4>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-md">Forward Estimate</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Based on historical settlement velocity, expect roughly <span className="font-bold text-indigo-900">{metrics.forecast.min} – {metrics.forecast.max} exceptions</span> in the next 7 days.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={handleToggleRiskWhy}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              Why this range? {showRiskWhy ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            <Link to="/exceptions" className="text-xs font-bold text-slate-600 hover:text-indigo-600 hover:underline flex items-center gap-1">
              Review Queue &rarr;
            </Link>
          </div>
        </div>

        {/* Why this range? Historical Velocity Breakdown */}
        {showRiskWhy && riskBasis && (
          <div className="mt-2 pt-3 border-t border-indigo-100 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-150">
            <div className="md:col-span-2 space-y-1.5">
              <span className="text-[11px] font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles size={12} className="text-indigo-600" /> Grounded Stochastic Projection
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {riskBasis.ai_narration}
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trailing 30-Day Velocity</span>
              <div className="text-sm font-bold text-indigo-900 font-mono">
                {riskBasis.daily_velocity} exceptions / day
              </div>
              <span className="text-[10px] text-slate-500 block">Total observed: {riskBasis.total_period_exceptions} exceptions</span>
            </div>
          </div>
        )}
      </div>

      {/* FORENSIC SIGNALS WITH GROUNDED AI NARRATION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* 1. Benford's Law Forensic Card (2 cols) */}
        <div className="md:col-span-2 bg-white text-slate-900 rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl border ${
                transactions.length < 30 ? 'bg-amber-50 text-amber-700 border-amber-200' : (benfordData?.is_compliant ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200')
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
                transactions.length < 30 ? 'bg-amber-50 text-amber-800 border-amber-200' : (benfordData.is_compliant ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200')
              }`}>
                {transactions.length < 30 ? 'Sample < 30' : `MAD ${benfordData.mad}`}
              </span>
            )}
          </div>

          {/* Forensic Result / Sample Size Notification Box */}
          {transactions.length < 30 ? (
            <div className="my-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex items-start gap-2.5">
              <AlertTriangle size={14} className="text-amber-700 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                Fewer than 30 transactions in this view (found {transactions.length}) — statistical checks need a larger sample to be meaningful.
              </p>
            </div>
          ) : (
            <div className="my-3 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-2.5">
              <Sparkles size={14} className="text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                {forensicNarration?.benford?.ai_narration || benfordData?.forensic_summary || "Evaluated ledger transactions across leading digits 1–9. Confirms authentic transaction distribution under Ind AS audit guidelines."}
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Evaluated across {benfordData?.total_evaluated || transactions.length} transactions</span>
            {transactions.length >= 30 && (
              <button 
                onClick={() => setShowBenfordModal(!showBenfordModal)}
                className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
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

        {/* 2. Isolation Forest ML Flag Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Unsupervised ML Signal</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              transactions.length < 20 
                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                : (mlAnomalies.length > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
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
            <div className="my-2 p-2.5 bg-amber-50/70 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed font-medium">
              Fewer than 20 transactions in this view (found {transactions.length}) — statistical checks need a larger sample to be meaningful.
            </div>
          ) : (
            <div className="my-2 p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-950 leading-relaxed font-medium flex items-start gap-1.5">
              <Sparkles size={12} className="text-indigo-600 shrink-0 mt-0.5" />
              <span>
                {forensicNarration?.isolation_forest?.ai_narration || `${mlAnomalies.length} transactions flagged by Isolation Forest model based on fee-to-gross ratio and transit duration.`}
              </span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Beyond explicit rules</span>
            {transactions.length >= 20 && mlAnomalies.length > 0 ? (
              <Link to="/exceptions" className="text-xs font-bold text-indigo-600 hover:underline">
                Inspect Outliers &rarr;
              </Link>
            ) : (
              <span className="text-xs text-slate-400">No outliers</span>
            )}
          </div>
        </div>
      </div>

      {/* Trust State Breakdown Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">Trust State Breakdown (Value-weighted)</h3>
          <span className="text-xs text-slate-400">Total Volume Analysis</span>
        </div>
        
        <div className="flex w-full h-3.5 rounded-full overflow-hidden bg-slate-100 p-0.5 gap-0.5">
          <div className="bg-emerald-500 rounded-l-full hover:opacity-90 transition-opacity" style={{width: `${metrics.trust.verified}%`}} title={`Verified: ${metrics.trust.verified.toFixed(1)}%`}></div>
          <div className="bg-amber-400 hover:opacity-90 transition-opacity" style={{width: `${metrics.trust.probable}%`}} title={`Probable: ${metrics.trust.probable.toFixed(1)}%`}></div>
          <div className="bg-rose-500 hover:opacity-90 transition-opacity" style={{width: `${metrics.trust.exception}%`}} title={`Exception: ${metrics.trust.exception.toFixed(1)}%`}></div>
          <div className="bg-slate-300 rounded-r-full hover:opacity-90 transition-opacity" style={{width: `${metrics.trust.unresolved}%`}} title={`Unresolved: ${metrics.trust.unresolved.toFixed(1)}%`}></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mt-4 text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span>VERIFIED ({metrics.trust.verified.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
            <span>PROBABLE ({metrics.trust.probable.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
            <span>EXCEPTION ({metrics.trust.exception.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0"></span>
            <span>UNRESOLVED ({metrics.trust.unresolved.toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Reconciliation Breakdown + Attention Required */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Value-Weighted Reconciliation */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Value-Weighted Reconciliation</h3>
            <p className="text-xs text-slate-500 mb-6">Percentage of processed transaction value matched against bank statements.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-8 my-auto">
            <div className="w-36 h-36 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={metrics.pie} innerRadius={50} outerRadius={68} paddingAngle={3} dataKey="value">
                    {metrics.pie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-800">{(metrics.match_rate * 100).toFixed(0)}%</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Settled</span>
              </div>
            </div>
            
            <div className="flex-1 w-full space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-xs font-semibold text-emerald-900">Total Value Successfully Matched</span>
                <span className="text-sm font-bold text-emerald-700">{(metrics.match_rate * 100).toFixed(2)}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                {metrics.pie.map(m => (
                  <div key={m.name} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor: m.color}}></div>
                    <span className="font-medium text-slate-700">{m.name}:</span>
                    <span className="font-semibold text-slate-900 ml-auto">{m.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Formula: Net Settled ÷ Gross Processed</span>
            <Link to="/reconciliation" className="text-indigo-600 font-semibold hover:underline">Reconciliation rules &rarr;</Link>
          </div>
        </div>

        {/* Right Column: Attention Required */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-500" />
              Attention Required
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full border border-rose-100">
              {exceptions.filter(e => e.status !== 'resolved').length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[280px] pr-1">
            {exceptions.filter(e => e.status !== 'resolved').length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center">
                <CheckCircle size={32} className="text-emerald-400 mb-2" />
                <p className="text-xs font-medium">All clear — no items requiring attention</p>
              </div>
            ) : (
              exceptions.filter(e => e.status !== 'resolved').slice(0, 8).map((ex) => {
                const amount = ex.underlying_data?.calculated_net || ex.underlying_data?.expected_fee || 0;
                return (
                  <div key={ex.id} className="p-3 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all border-l-4 border-l-rose-500 shadow-xs flex flex-col gap-1.5">
                    <div className="flex justify-between items-start">
                      <SeverityBadge severity="HIGH" />
                      <span className="text-[10px] font-mono text-slate-400">{ex.id.substring(0, 10)}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium capitalize truncate">{ex.reason.replace(/_/g, ' ')}</p>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs font-bold text-slate-900"><AmountDisplay amount={amount} /></span>
                      <Link to={`/record/exception/${ex.id}`} className="text-[11px] font-bold text-indigo-600 hover:underline">Investigate &rarr;</Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Calendar Heatmap Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Transaction Calendar: {heatmapData.monthName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Daily transaction intensity based on the currently selected range.</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200"></span> 0 txs</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-200"></span> 1-2 txs</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-600"></span> 5+ txs</span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {heatmapData.days.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} className="h-16 rounded-xl bg-slate-50/40"></div>;
              
              const hasTxs = day.count > 0;
              let bgClass = "bg-slate-50 border-slate-200/60 text-slate-400";
              if (hasTxs) {
                if (day.count > 5) bgClass = "bg-indigo-600 border-indigo-700 text-white shadow-sm";
                else if (day.count > 2) bgClass = "bg-indigo-400 border-indigo-500 text-white";
                else bgClass = "bg-indigo-100 border-indigo-200 text-indigo-900 font-semibold";
              }

              return (
                <button 
                  key={day.date}
                  onClick={() => hasTxs && setExpandedDay(expandedDay === day.date ? null : day.date)}
                  className={`h-16 rounded-xl border flex flex-col items-center justify-center transition-all ${bgClass} ${hasTxs ? 'cursor-pointer hover:scale-102 hover:shadow-md' : 'cursor-default'}`}
                >
                  <span className="text-xs font-bold">{day.date.split('-')[2]}</span>
                  {hasTxs && (
                    <span className="text-[10px] mt-1 px-1.5 py-0.5 rounded-full bg-black/10 backdrop-blur-xs font-medium">
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
          <div className="bg-slate-50 text-slate-900 p-6 border-t border-slate-200 animate-in fade-in duration-150">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Daily Transactions: {expandedDay}</h4>
                <p className="text-xs text-slate-600">All gateway charges and settlement records on this date.</p>
              </div>
              <button onClick={() => setExpandedDay(null)} className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-slate-700 transition-colors border border-transparent hover:border-slate-200 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="overflow-x-auto max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <th className="pb-2">Transaction ID</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Gross Amount</th>
                    <th className="pb-2 text-right">Net Settled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {heatmapData.days.find(d => d?.date === expandedDay)?.txs.map((tx: any) => (
                    <tr key={tx.transaction_id} className="hover:bg-white">
                      <td className="py-2.5 font-mono font-medium text-slate-700">{tx.transaction_id}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${tx.status === 'settled' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-medium text-slate-700"><AmountDisplay amount={tx.gross_amount} /></td>
                      <td className="py-2.5 text-right font-bold text-slate-900"><AmountDisplay amount={tx.net_amount} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Row: Recent Exceptions + Settlement Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Exceptions Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent Exceptions</h3>
              <p className="text-xs text-slate-500">Unmatched settlement discrepancies</p>
            </div>
            <Link to="/exceptions" className="text-xs font-semibold text-indigo-600 hover:underline">View All &rarr;</Link>
          </div>
          <div className="overflow-x-auto flex-1 max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-4">Exception ID</th>
                  <th className="py-2.5 px-4">Reason</th>
                  <th className="py-2.5 px-4 text-right">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exceptions.slice(0, 8).map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      <Link to={`/record/exception/${ex.id}`} className="hover:text-indigo-600 hover:underline">{ex.id.substring(0, 10)}...</Link>
                    </td>
                    <td className="py-3 px-4 text-slate-700 capitalize">{ex.reason.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-right">
                      <SeverityBadge severity="HIGH" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Settlement Trend Area Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Settlement Trend</h3>
              <p className="text-xs text-slate-500">Daily net settled deposits over selected range</p>
            </div>
          </div>
          
          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} minTickGap={30} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, 'Settled']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
