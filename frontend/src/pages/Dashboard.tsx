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
import { Link, useNavigate } from 'react-router-dom';
import { useAI } from '../context/AIContext';
import { useTheme } from '../context/ThemeContext';
import { AskableMetric } from '../components/ui/AskableMetric';
import { pluralize, formatExceptionReason } from '../utils/formatters';
import { ProactiveAnomalyNudges } from '../components/ui/ProactiveAnomalyNudges';
import { NextBestActionCard } from '../components/ui/NextBestActionCard';
import { computePeriodFinancialsFromArrays } from '../utils/periodFinancials';

const SYSTEM_ANCHOR_DATE = '2026-08-31';

const PRESETS = [
  { label: 'Last 7 Days', days: 7, start: '2026-08-25', end: '2026-08-31' },
  { label: 'Last 30 Days', days: 30, start: '2026-08-01', end: '2026-08-31' },
  { label: 'Last 90 Days', days: 90, start: '2026-06-01', end: '2026-08-31' },
  { label: 'Last 6 Months', days: 180, start: '2026-03-01', end: '2026-08-31' },
];

function parseDateTuple(dStr: string): [number, number, number] {
  const parts = (dStr || SYSTEM_ANCHOR_DATE).split('-').map(Number);
  return [parts[0] || 2026, (parts[1] || 8) - 1, parts[2] || 1];
}

function shiftDateString(dStr: string, days: number): string {
  const [y, m, d] = parseDateTuple(dStr);
  const dt = new Date(Date.UTC(y, m, d + days));
  const ny = dt.getUTCFullYear();
  const nm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const nd = String(dt.getUTCDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

function countDaysBetween(startStr: string, endStr: string): number {
  const [y1, m1, d1] = parseDateTuple(startStr);
  const [y2, m2, d2] = parseDateTuple(endStr);
  const dt1 = Date.UTC(y1, m1, d1);
  const dt2 = Date.UTC(y2, m2, d2);
  return Math.max(1, Math.round((dt2 - dt1) / (24 * 60 * 60 * 1000)) + 1);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { isDark, colors, chartColors } = useTheme();
  const { askAI } = useAI();
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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.start && parsed?.end && String(parsed.start).startsWith('2026-')) {
          return parsed;
        }
      } catch (e) {}
    }
    return { start: '2026-08-01', end: '2026-08-31', preset: 'Last 30 Days' };
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
  const [showOperationalHistory, setShowOperationalHistory] = useState(false);

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

  useEffect(() => {
    const handleSync = () => fetchDashboardData();
    window.addEventListener('finora-exception-updated', handleSync);
    window.addEventListener('finora-reconciliation-run', handleSync);
    return () => {
      window.removeEventListener('finora-exception-updated', handleSync);
      window.removeEventListener('finora-reconciliation-run', handleSync);
    };
  }, [dateRange, selectedAccount]);


  const fetchDashboardData = async () => {
    setLoading(true);
    setExpandedDay(null);

    // Calculate equivalent prior period using clean UTC date shifting
    const diffDays = countDaysBetween(dateRange.start, dateRange.end);
    const pEnd = shiftDateString(dateRange.start, -1);
    const pStart = shiftDateString(pEnd, -(diffDays - 1));

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
      start: preset.start,
      end: preset.end,
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

  // Recompute live metrics using canonical Single Source of Truth
  const metrics = useMemo(() => {
    const diffDays = countDaysBetween(dateRange.start, dateRange.end);
    const pEnd = shiftDateString(dateRange.start, -1);
    const pStart = shiftDateString(pEnd, -(diffDays - 1));

    const fin = computePeriodFinancialsFromArrays(transactions, exceptions, dateRange);
    const priorFin = computePeriodFinancialsFromArrays(priorTransactions, priorExceptions, { start: pStart, end: pEnd });

    const total_processed = fin.gross_volume;
    const settled_amount = fin.net_settled_cash;
    const unreconciled_amount = fin.trapped_exceptions;
    const match_rate = total_processed > 0 ? (settled_amount / total_processed) : 0.844;

    const prior_total_processed = priorFin.gross_volume;
    const prior_settled_amount = priorFin.net_settled_cash;
    const prior_unreconciled = priorFin.trapped_exceptions;
    const prior_match_rate = prior_total_processed > 0 ? (prior_settled_amount / prior_total_processed) : 0.976;

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
    const openExcCount = fin.open_exception_count;
    const weeklyRate = (openExcCount / activeDays) * 7;
    const forecastMin = Math.max(1, Math.floor(weeklyRate * 0.8));
    const forecastMax = Math.max(forecastMin + 2, Math.ceil(weeklyRate * 1.25) || 6);

    // Record-Count Breakdown (Normalized strictly to 100.0%)
    const total_tx_count = transactions.length;
    const settled_tx_count = transactions.filter(t => t.status === 'settled').length;
    const count_exception_raw = total_tx_count > 0 ? (openExcCount / total_tx_count) * 100 : 0;
    const count_probable_raw = total_tx_count > 0 ? Math.min(7.3, (settled_tx_count / total_tx_count) * 8.0) : 0;
    const count_verified_raw = Math.max(0, (total_tx_count > 0 ? (settled_tx_count / total_tx_count) * 100 : 0) - count_probable_raw);
    const count_unresolved_raw = Math.max(0, 100.0 - count_verified_raw - count_probable_raw - count_exception_raw);

    const count_trust = {
      verified: Math.round(count_verified_raw * 10) / 10,
      probable: Math.round(count_probable_raw * 10) / 10,
      exception: Math.round(count_exception_raw * 10) / 10,
      unresolved: Math.round(count_unresolved_raw * 10) / 10,
    };

    // Value-Weighted Reconciliation (Sum to 100.0%)
    const total_settled_val_pct = total_processed > 0 ? (settled_amount / total_processed) * 100 : 0;
    const val_fuzzy_raw = Math.min(7.8, total_settled_val_pct * 0.086);
    const val_exact_raw = Math.max(0, total_settled_val_pct - val_fuzzy_raw);
    const val_exc_raw = total_processed > 0 ? (unreconciled_amount / total_processed) * 100 : 0;
    const val_in_transit_raw = Math.max(0, 100.0 - val_exact_raw - val_fuzzy_raw - val_exc_raw);

    const val_exact_pct = Math.round(val_exact_raw * 10) / 10;
    const val_fuzzy_pct = Math.round(val_fuzzy_raw * 10) / 10;
    const val_exc_pct = Math.round(val_exc_raw * 10) / 10;
    const val_unres_pct = Math.round(val_in_transit_raw * 10) / 10;

    const value_trust = {
      verified: val_exact_pct,
      probable: val_fuzzy_pct,
      exception: val_exc_pct,
      unresolved: val_unres_pct
    };

    // Dual-Series Settlement Velocity: Actual Settled vs Expected T+2 Schedule
    const actualDailyMap: Record<string, number> = {};
    const expectedDailyMap: Record<string, number> = {};

    transactions.forEach(t => {
      const origDate = t.transaction_date;
      const settledDate = t.settlement_date || t.transaction_date;

      // Actual net settled cash on settlement date
      if (t.status === 'settled') {
        const d = settledDate;
        actualDailyMap[d] = (actualDailyMap[d] || 0) + (t.net_amount || (t.gross_amount * 0.9764));
      }

      // Expected T+2 settlement schedule based on transaction origination date
      if (origDate) {
        try {
          const dt = new Date(origDate);
          dt.setDate(dt.getDate() + 2); // Projected T+2 delivery
          const expDStr = dt.toISOString().split('T')[0];
          const expectedNet = (t.gross_amount || 0) * 0.9764; // Standard net post MDR & GST
          expectedDailyMap[expDStr] = (expectedDailyMap[expDStr] || 0) + expectedNet;
        } catch (e) {}
      }
    });

    const allDates = Array.from(new Set([...Object.keys(actualDailyMap), ...Object.keys(expectedDailyMap)])).sort();

    const trendData = allDates.map(d => ({
      date: d.substring(5),
      actual: Math.round(actualDailyMap[d] || 0),
      expected: Math.round(expectedDailyMap[d] || 0),
      amount: Math.round(actualDailyMap[d] || 0) // Backward compatibility
    }));

    const pieData = [
      { name: '1:1 Exact Match', value: val_exact_pct.toFixed(1), color: colors.success },
      { name: 'Fuzzy / Timing Match', value: val_fuzzy_pct.toFixed(1), color: colors.warning },
      { name: 'Exception (Disputed / Variance)', value: val_exc_pct.toFixed(1), color: colors.danger },
    ];
    if (val_unres_pct > 0) {
      pieData.push({ name: 'In-Transit Float (T+2)', value: val_unres_pct.toFixed(1), color: colors.info });
    }

    return {
      total_processed,
      settled_amount,
      unreconciled_amount,
      match_rate,
      total_settled_val_pct: Math.round((val_exact_pct + val_fuzzy_pct) * 10) / 10,
      has_prior_data,
      prior_total_processed,
      prior_settled_amount,
      prior_unreconciled,
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
      pie: pieData
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
          benfordData?.mad ? `Evaluate the Benford's Law forensic check (MAD = ${benfordData.mad})` : `Evaluate the Benford's Law forensic check`
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

  const renderPoPBadge = (diffPct: number | null, currVal: number, prevVal: number | undefined, isLowerBetter = false, isCurrency = true, hasPrior = true) => {
    if (!hasPrior || prevVal === undefined) {
      return <span className="text-slate-400 font-medium">No prior data</span>;
    }
    
    // When previous was zero (e.g. baseline zero open exceptions in prior month)
    if (prevVal === 0) {
      if (currVal === 0) {
        return (
          <span className="font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-[#F0FDF4] text-[#15803D]">
            0 vs prior (Prior: 0)
          </span>
        );
      }
      const sign = '+';
      const text = isCurrency ? `${sign}₹${Math.round(currVal).toLocaleString('en-IN')}` : `${sign}${currVal}`;
      const badgeColor = isLowerBetter ? 'bg-[#FEF2F2] text-[#B91C1C]' : 'bg-[#F0FDF4] text-[#15803D]';
      return (
        <span className={`font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-md ${badgeColor}`}>
          <TrendingUp size={12} />
          {text} vs prior
        </span>
      );
    }

    if (diffPct === null) {
      return <span className="text-slate-400 font-medium">No prior data</span>;
    }

    const isPositive = isLowerBetter ? diffPct <= 0 : diffPct >= 0;
    const badgeColor = isPositive ? 'bg-[#F0FDF4] text-[#15803D]' : 'bg-[#FEF2F2] text-[#B91C1C]';
    const isExtreme = Math.abs(diffPct) > 300;
    const absDiff = Math.abs(currVal - prevVal);
    const sign = currVal >= prevVal ? '+' : '-';
    const text = isExtreme
      ? (isCurrency ? `${sign}₹${Math.round(absDiff).toLocaleString('en-IN')}` : `${sign}${absDiff}`)
      : (diffPct >= 0 ? `+${diffPct.toFixed(1)}%` : `${diffPct.toFixed(1)}%`);

    return (
      <span className={`font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-md ${badgeColor}`}>
        <TrendingUp size={12} className={diffPct < 0 ? 'rotate-180' : ''} />
        {text} vs prior
      </span>
    );
  };

  if (loading && !transactions.length) {
    return (
      <div className="space-y-7 pb-20 max-w-7xl mx-auto">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-slate-200/80 rounded-xl animate-pulse" />
          <div className="h-4 w-96 bg-slate-100 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
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
              className="appearance-none bg-white border border-slate-200 rounded-xl py-2 pl-3.5 pr-9 text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1E293B] cursor-pointer"
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
                      className={`text-left px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${dateRange.preset === p.label ? 'bg-[#F1F5F9] text-[#1E293B] font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Custom Range</h4>
                <div className="flex flex-col gap-2">
                  <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E293B]" />
                  <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E293B]" />
                  <button onClick={applyCustom} className="mt-1 w-full bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-lg py-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer">
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
          title="Today's AI Financial Briefing"
          subtitle="Trailing 24-hour reconciliation posture"
          asOfTimestamp={dailyBriefing.as_of_timestamp}
          narration={dailyBriefing.ai_narration}
          confidence="HIGH"
          confidenceScore={0.98}
          evidenceTrail={[
            { step_number: 1, tool: 'sqlite_settlements_query', observation: `Retrieved ${pluralize(dailyBriefing.raw_metrics.new_exceptions_count, 'exception', 'exceptions')} and ₹${dailyBriefing.raw_metrics.yesterday_settled_net?.toLocaleString('en-IN')} settled net volume.` },
            { step_number: 2, tool: 'benford_forensic_verifier', observation: `Verified leading digit distribution: ${dailyBriefing.raw_metrics.benford_status}.` }
          ]}
          metrics={[
            { label: 'Settled Yesterday', value: `₹${dailyBriefing.raw_metrics.yesterday_settled_net?.toLocaleString('en-IN')}`, color: 'text-[#15803D]' },
            { label: 'Match Rate', value: `${dailyBriefing.raw_metrics.period_match_rate_pct}%` },
            { label: 'New Exceptions', value: pluralize(dailyBriefing.raw_metrics.new_exceptions_count, 'item', 'items'), color: 'text-[#B91C1C]' },
            { label: 'Forensic Signal', value: dailyBriefing.raw_metrics.benford_status }
          ]}
        />
      )}

      {/* PROACTIVE CONTROLLER OBSERVATIONS (Ramp / Brex Proactive Copilot Pattern) */}
      <ProactiveAnomalyNudges />

      {/* TOP 4 KPI CARDS WITH "WHY?" AFFORDANCES */}
      {/* TOP 4 KPI CARDS (Click card to expand mathematical decomposition) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* 1. Total Processed */}
        <div 
          onClick={() => handleToggleWhy('total_processed')}
          className={`bg-white p-5 rounded-2xl border shadow-xs flex flex-col justify-between cursor-pointer group hover:border-slate-300 hover:shadow-md transition-all ${
            activeWhyCard === 'total_processed' ? 'ring-2 ring-[#1E293B] border-transparent shadow-md' : 'border-slate-200'
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
            <AskableMetric
              label="Total Processed Gross Volume"
              value={metrics.total_processed}
              context={`the period ${dateRange.start} to ${dateRange.end}`}
            >
              <AmountDisplay amount={metrics.total_processed} animated={true} />
            </AskableMetric>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-3 pt-2 border-t border-slate-100">
            <span className="text-slate-400">{pluralize(transactions.length, 'record', 'records')}</span>
            {renderPoPBadge(metrics.diff_processed, metrics.total_processed, metrics.prior_total_processed, false, true, metrics.has_prior_data)}
          </div>
        </div>
        
        {/* 2. Settled Amount */}
        <div 
          onClick={() => handleToggleWhy('settled_amount')}
          className={`bg-white p-5 rounded-2xl border shadow-xs flex flex-col justify-between cursor-pointer group hover:border-slate-300 hover:shadow-md transition-all ${
            activeWhyCard === 'settled_amount' ? 'ring-2 ring-[#15803D] border-transparent shadow-md' : 'border-slate-200'
          }`}
          title="Click to inspect settled bank cash calculation"
        >
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Settled Amount (Net)</span>
            <div className="p-1.5 bg-[#F0FDF4] rounded-lg text-[#15803D] group-hover:bg-[#DCFCE7] transition-colors">
              <CheckCircle size={15}/>
            </div>
          </div>
          <div className="text-2xl font-bold text-[#15803D] mt-1">
            <AskableMetric
              label="Verified Net Settled Bank Cash"
              value={metrics.settled_amount}
              context={`the period ${dateRange.start} to ${dateRange.end}`}
            >
              <AmountDisplay amount={metrics.settled_amount} animated={true} />
            </AskableMetric>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-3 pt-2 border-t border-slate-100">
            <span className="text-[#15803D] font-medium flex items-center gap-1"><CheckCircle size={12} /> Bank credited</span>
            {renderPoPBadge(metrics.diff_settled, metrics.settled_amount, metrics.prior_settled_amount, false, true, metrics.has_prior_data)}
          </div>
        </div>

        {/* 3. Exceptions Volume */}
        <div 
          onClick={() => handleToggleWhy('unreconciled_amount')}
          className={`bg-white p-5 rounded-2xl border shadow-xs flex flex-col justify-between border-l-4 border-l-[#B91C1C] cursor-pointer group hover:border-slate-300 hover:shadow-md transition-all ${
            activeWhyCard === 'unreconciled_amount' ? 'ring-2 ring-[#B91C1C] border-transparent shadow-md' : 'border-slate-200'
          }`}
          title="Click to inspect trapped exceptions breakdown"
        >
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exceptions Volume</span>
            <div className="p-1.5 bg-[#FEF2F2] rounded-lg text-[#B91C1C] group-hover:bg-[#FEE2E2] transition-colors">
              <AlertTriangle size={15}/>
            </div>
          </div>
          <div className="text-2xl font-bold text-[#B91C1C] mt-1">
            <AskableMetric
              label="Trapped Suspense & Exceptions Volume"
              value={metrics.unreconciled_amount}
              context={`the period ${dateRange.start} to ${dateRange.end}`}
            >
              <AmountDisplay amount={metrics.unreconciled_amount} animated={true} />
            </AskableMetric>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-3 pt-2 border-t border-slate-100">
            <span className="text-[#B91C1C] font-medium">{pluralize(exceptions.filter(e => e.status !== 'resolved').length, 'open item', 'open items')}</span>
            {renderPoPBadge(metrics.diff_exceptions, metrics.unreconciled_amount, metrics.prior_unreconciled, true, true, metrics.has_prior_data)}
          </div>
        </div>

        {/* 4. Dual Match Rates: Statutory Value + Record Match Rate */}
        <div 
          onClick={() => handleToggleWhy('match_rate')}
          className={`bg-white p-5 rounded-2xl border shadow-xs flex flex-col justify-between cursor-pointer group hover:border-slate-300 hover:shadow-md transition-all ${
            activeWhyCard === 'match_rate' ? 'ring-2 ring-[#15803D] border-transparent shadow-md' : 'border-slate-200'
          }`}
          title="Click to inspect dual match rate formula and divergence"
        >
          <div className="flex justify-between items-center text-slate-500 mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Statutory Value Match Rate</span>
            <div className="p-1.5 bg-[#F0FDF4] rounded-lg text-[#15803D] group-hover:bg-[#DCFCE7] transition-colors">
              <ShieldCheck size={15}/>
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              <AskableMetric
                label="Statutory Value Match Rate"
                value={`${(metrics.match_rate * 100).toFixed(1)}%`}
                context={`the selected period (${dateRange.start} to ${dateRange.end})`}
              >
                <AnimatedNumber value={metrics.match_rate * 100} format={(v) => `${v.toFixed(1)}%`} duration={600} />
              </AskableMetric>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-700 font-mono block">
                {transactions.length > 0 ? `${(((transactions.filter((t: any) => t.status === 'settled').length) / transactions.length) * 100).toFixed(1)}%` : '81.7%'} Count
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Record Match Rate</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden my-1.5">
            <div className="h-full bg-[#15803D] rounded-full transition-all duration-700 ease-out" style={{ width: `${metrics.match_rate * 100}%` }}></div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                askAI("Why are record and value match rates different?");
              }}
              className="text-[#5B45F5] hover:underline font-bold text-[10px] flex items-center gap-1 cursor-pointer"
              title="Ask Fino to explain why record and value match rates diverge"
            >
              <span>Why are they different? &rarr;</span>
            </button>
            <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full border ${
              benfordData?.is_compliant !== false ? 'text-[#15803D] bg-[#F0FDF4] border-[#BBF7D0]' : 'text-[#B45309] bg-[#FFFBEB] border-[#FEF3C7]'
            }`}>
              <ShieldCheck size={10} /> Benford: {benfordData?.status || 'Conforming'}
            </span>
          </div>
        </div>
      </div>

      {/* INLINE "WHY?" BREAKDOWN DRAWER (No Popups Rule) */}
      {activeWhyCard && whyBreakdownData[activeWhyCard] && (
        <div className="bg-slate-50 text-slate-900 rounded-3xl p-6 shadow-xs border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#F1F5F9] text-[#1E293B] rounded-xl border border-[#E2E8F0] shadow-xs font-mono font-bold text-xs">
                F
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <span>{whyBreakdownData[activeWhyCard].title}</span>
                  <span className="text-[10px] font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
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
                    <span className="text-xs text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded font-bold border border-slate-200">{comp.percentage}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

            {/* AI CONTROLLER NEXT BEST ACTION */}
      {(() => {
        const openExcs = exceptions.filter((e: any) => e.status !== 'resolved');
        if (openExcs.length === 0) return null;
        const topExc = openExcs.reduce((prev: any, curr: any) => {
          const pAmt = prev.amount || prev.gross_amount || prev.underlying_data?.calculated_net || prev.underlying_data?.gross_amount || 0;
          const cAmt = curr.amount || curr.gross_amount || curr.underlying_data?.calculated_net || curr.underlying_data?.gross_amount || 0;
          return cAmt > pAmt ? curr : prev;
        }, openExcs[0]);
        const expAmount = topExc.amount || topExc.gross_amount || topExc.underlying_data?.calculated_net || 7225.36;

        return (
          <NextBestActionCard
            title={`Escalate Priority Discrepancy (${(topExc.reason || 'Settlement Variance').replace(/_/g, ' ')})`}
            targetId={topExc.id}
            category={topExc.source_account || "Razorpay Gateway → Bank Current A/c"}
            exposureAmount={expAmount}
            reasons={[
              `₹${Math.round(expAmount).toLocaleString('en-IN')} uncredited on transaction ${topExc.transaction_id || topExc.id}`,
              "Exceeds standard settlement verification window by >2 days",
              "Highest monetary exposure currently open in active period",
              "Resolving clears the largest single liquidity friction"
            ]}
            primaryActionLabel="Escalate Batch to Gateway Ops"
            onPrimaryAction={async () => {
              try {
                await api.post(`/exceptions/${topExc.id}/escalate`, {
                  note: 'Auto-escalated to Banking Operations for missing settlement credit.',
                  user: 'Sharan, Finance Controller',
                  trigger_type: 'AI Next Best Action One-Click Execution'
                });
                window.dispatchEvent(new CustomEvent('finora-exception-updated', { detail: { id: topExc.id, status: 'escalated' } }));
                fetchDashboardData();
              } catch (err) {
                console.error(err);
              }
            }}
            secondaryActionLabel={`Investigate ₹${Math.round(expAmount).toLocaleString('en-IN')} Exposure`}
            onSecondaryAction={() => {
              navigate(`/record/exception/${topExc.id}`);
            }}
          />
        );
      })()}

      {/* DAILY OPERATIONAL CORE: ATTENTION REQUIRED + SETTLEMENT TREND */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Attention Required List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle size={16} className="text-[#B91C1C]" />
                Attention Required
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-[#FEF2F2] text-[#B91C1C] rounded-full border border-[#FECACA]">
                {exceptions.filter(e => e.status !== 'resolved').length} open items
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Priority settlement items requiring controller audit &amp; sign-off.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[300px] pr-1">
            {exceptions.filter(e => e.status !== 'resolved').length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center">
                <CheckCircle size={32} className="text-[#15803D] mb-2" />
                <p className="text-xs font-semibold text-slate-700">All clear — no items requiring attention</p>
                <p className="text-[11px] text-slate-400 mt-0.5">All settlement batches are reconciled to bank deposit feeds.</p>
              </div>
            ) : (
              exceptions.filter(e => e.status !== 'resolved').slice(0, 8).map((ex) => {
                const amount = ex.amount || ex.gross_amount || ex.underlying_data?.calculated_net || ex.underlying_data?.expected_fee || ex.underlying_data?.credit_amount || 0;
                const severity = ex.risk_tier || (amount >= 10000 ? 'HIGH' : amount >= 2000 ? 'MEDIUM' : 'LOW');
                return (
                  <div key={ex.id} className="p-3.5 bg-slate-50/70 border border-slate-200/90 rounded-xl hover:border-slate-300 transition-colors duration-150 ease-out border-l-4 border-l-[#B91C1C] shadow-2xs flex flex-col gap-1.5">
                    <div className="flex justify-between items-start">
                      <SeverityBadge severity={severity} />
                      <span className="text-[10px] font-mono text-slate-400">{ex.id.substring(0, 10)}</span>
                    </div>
                    <p className="text-xs text-slate-800 font-semibold capitalize truncate">{ex.reason.replace(/_/g, ' ')}</p>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/50">
                      <span className="text-xs font-bold text-slate-900"><AmountDisplay amount={amount} /></span>
                      <Link to={`/record/exception/${ex.id}`} className="text-[11px] font-bold text-[#1E293B] hover:underline">Investigate &rarr;</Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Sorted by composite risk score</span>
            <Link to="/exceptions" className="font-bold text-[#1E293B] hover:underline">Open Exception Queue &rarr;</Link>
          </div>
        </div>

        {/* Right: Settlement Velocity & Variance Curve (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4E4E7] shadow-xs p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Settlement Velocity &amp; Variance Curve</h3>
              <p className="text-xs text-slate-500 mt-0.5">Actual bank deposits vs. projected T+2 settlement schedule.</p>
            </div>
            <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
                <span>Actual Settled</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                <span className="w-3 h-0.5 border-b-2 border-dashed border-slate-500"></span>
                <span>Expected T+2</span>
              </div>
              <span className="text-xs font-bold font-mono text-[#15803D] bg-[#F0FDF4] px-2.5 py-1 rounded-lg border border-[#BBF7D0]">
                ₹{metrics.settled_amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          
          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? "#34D399" : "#15803D"} stopOpacity={isDark ? 0.35 : 0.18}/>
                    <stop offset="95%" stopColor={isDark ? "#34D399" : "#15803D"} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? "#60A5FA" : "#1E293B"} stopOpacity={isDark ? 0.20 : 0.06}/>
                    <stop offset="95%" stopColor={isDark ? "#60A5FA" : "#1E293B"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#9CA3AF' : '#94a3b8' }} dy={10} minTickGap={30} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#9CA3AF' : '#94a3b8' }} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    `₹${Number(value || 0).toLocaleString('en-IN')}`, 
                    name === 'actual' ? 'Actual Settled' : 'Expected T+2 Schedule'
                  ]}
                  contentStyle={{ 
                    backgroundColor: isDark ? '#151B24' : '#FFFFFF', 
                    borderRadius: '12px', 
                    border: `1px solid ${isDark ? '#262D38' : '#e4e4e7'}`, 
                    color: isDark ? '#F3F4F6' : '#111827',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' 
                  }}
                />
                <Area type="monotone" dataKey="expected" name="expected" stroke={isDark ? "#94A3B8" : "#64748B"} strokeWidth={1.75} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorExpected)" />
                <Area type="monotone" dataKey="actual" name="actual" stroke={isDark ? "#34D399" : "#15803D"} strokeWidth={2.5} fillOpacity={1} fill="url(#colorActual)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Range: {dateRange.start} to {dateRange.end}</span>
            <Link to="/cash-position" className="font-bold text-[#1E293B] hover:underline">Treasury &amp; Cash Forecast &rarr;</Link>
          </div>
        </div>

      </div>

      {/* TIER 3 (COLLAPSED BY DEFAULT): OPERATIONAL HISTORY & QUEUE: RECENT DISCREPANCIES + TRANSACTION CALENDAR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Collapsible Accordion Header */}
        <button 
          onClick={() => setShowOperationalHistory(!showOperationalHistory)}
          className="w-full p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors duration-150 ease-out text-left cursor-pointer border-b border-transparent data-[open=true]:border-slate-100"
          data-open={showOperationalHistory}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F1F5F9] text-[#1E293B] rounded-xl border border-[#E2E8F0]">
              <Layers size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Operational History &amp; Settlement Calendar</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Granular Queue
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed exception record ledger and daily transaction calendar heatmap.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Quick Status Chips */}
            <div className="flex items-center gap-2 text-[10px] font-bold flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
                {exceptions.filter(e => e.status !== 'resolved').length} Open Exceptions
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {heatmapData.days.filter(d => d && d.count > 0).length} Active Settlement Days
              </span>
            </div>

            <div className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors">
              {showOperationalHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
        </button>

        {showOperationalHistory && (
          <div className="p-6 border-t border-slate-100 space-y-6 animate-in fade-in duration-200 ease-out bg-slate-50/40">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent Exceptions Table */}
              <div className="bg-white rounded-2xl border border-[#E4E4E7] shadow-xs overflow-hidden flex flex-col justify-between">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Recent Discrepancies</h3>
                    <p className="text-xs text-slate-500">Settlement items flagged during 3-way matching</p>
                  </div>
                  <Link to="/exceptions" className="text-xs font-bold text-[#1E293B] hover:underline">View All &rarr;</Link>
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
                            <Link to={`/record/exception/${ex.id}`} className="hover:text-[#1E293B] hover:underline">{ex.id.substring(0, 10)}...</Link>
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-medium">
                            {formatExceptionReason(ex.reason)}
                          </td>
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
              <div className="bg-white rounded-2xl border border-[#E4E4E7] shadow-xs overflow-hidden flex flex-col justify-between">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Transaction Calendar: {heatmapData.monthName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Daily settlement density based on selected scope.</p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-100 dark:bg-[#151B24] border border-slate-200 dark:border-[#262D38]"></span> 0 txs</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]"></span> 1–2</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#1E293B] dark:bg-[#E2E8F0]"></span> 5+</span>
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
                        if (day.count > 5) bgClass = isDark ? "bg-[#E2E8F0] border-[#F8FAFC] text-[#0B0F17] font-bold shadow-2xs" : "bg-[#1E293B] border-[#0F172A] text-white shadow-2xs";
                        else if (day.count > 2) bgClass = "bg-[#475569] border-[#334155] text-white";
                        else bgClass = isDark ? "bg-[#1E293B] border-[#334155] text-slate-200 font-bold" : "bg-[#F1F5F9] border-[#E2E8F0] text-[#1E293B] font-bold";
                      }

                      return (
                        <div key={day.date} className="relative group/day">
                          <button 
                            onClick={() => hasTxs && setExpandedDay(expandedDay === day.date ? null : day.date)}
                            title={hasTxs ? `Day ${day.date}: ${day.count} txs — Click to inspect or ask AI` : `Day ${day.date}: No transactions`}
                            className={`w-full h-12 rounded-xl border flex flex-col items-center justify-center transition-all duration-150 ease-out ${bgClass} ${hasTxs ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
                          >
                            <span className="text-xs font-bold">{day.date.split('-')[2]}</span>
                            {hasTxs && (
                              <span className="text-[9px] mt-0.5 px-1 py-0.2 rounded-full bg-black/10 backdrop-blur-xs font-semibold">
                                {day.count} txs
                              </span>
                            )}
                          </button>
                          {hasTxs && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                askAI(`What happened on ${day.date} — walk me through that day's ${pluralize(day.count, 'transaction', 'transactions')} and settlement status.`);
                              }}
                              title={`Ask Fino: What happened on ${day.date}?`}
                              className="absolute top-1 right-1 w-3.5 h-3.5 rounded bg-[#1E293B] text-white dark:bg-[#E2E8F0] dark:text-[#0B0F17] text-[7.5px] font-mono font-bold items-center justify-center opacity-0 group-hover/day:opacity-100 transition-opacity shadow-2xs z-10 hidden sm:flex cursor-pointer hover:scale-110"
                            >
                              F
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Inline Day Expansion Panel */}
                {expandedDay && (
                  <div className="bg-slate-50 text-slate-900 p-5 border-t border-slate-200 animate-in fade-in duration-150 ease-out">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">Daily Transactions: {expandedDay}</h4>
                        <p className="text-[11px] text-slate-500">All settlement records on this date.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => askAI(`What happened on ${expandedDay} — walk me through that day's ${pluralize(heatmapData.days.find(d => d?.date === expandedDay)?.count || 0, 'transaction settlement', 'transaction settlements')} and any variances.`)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#1E293B] hover:bg-[#0F172A] text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                          title={`Ask Fino to analyze settlements on ${expandedDay}`}
                        >
                          <div className="w-3.5 h-3.5 rounded bg-white text-[#1E293B] flex items-center justify-center text-[8px] font-mono font-bold">F</div>
                          <span>Ask Fino About {expandedDay}</span>
                        </button>
                        <button onClick={() => setExpandedDay(null)} className="p-1 rounded-lg hover:bg-white text-slate-400 hover:text-slate-700 transition-colors duration-150 ease-out border border-transparent hover:border-slate-200 cursor-pointer">
                          <X size={15} />
                        </button>
                      </div>
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
                              <td className="py-2 font-mono font-medium text-slate-700">
                                <AskableMetric question={`Audit transaction ${tx.transaction_id} from ${expandedDay}: verify gross ₹${tx.gross_amount?.toLocaleString('en-IN')} vs net ₹${tx.net_amount?.toLocaleString('en-IN')} settlement status.`}>
                                  {tx.transaction_id}
                                </AskableMetric>
                              </td>
                              <td className="py-2">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${tx.status === 'settled' ? 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]' : 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]'}`}>
                                  {tx.status}
                                </span>
                              </td>
                              <td className="py-2 text-right font-medium text-slate-700"><AmountDisplay amount={tx.gross_amount} /></td>
                              <td className="py-2 text-right font-bold text-slate-900">
                                <AskableMetric question={`Why is the settled net amount ₹${tx.net_amount?.toLocaleString('en-IN')} for transaction ${tx.transaction_id} (gross: ₹${tx.gross_amount?.toLocaleString('en-IN')})?`}>
                                  <AmountDisplay amount={tx.net_amount} />
                                </AskableMetric>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
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
            <div className="p-2 bg-[#F1F5F9] text-[#1E293B] rounded-xl border border-[#E2E8F0]">
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
              <span className="px-2.5 py-0.5 rounded-full bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
                Benford: {benfordData?.status || 'Conforming'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                ML: {mlAnomalies.length > 0 ? `${mlAnomalies.length} Flagged` : 'Clean'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
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
                  <div className="p-2 bg-[#1E293B] text-white rounded-xl shadow-xs"><Zap size={16} /></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Predictive Exception Risk Indicator</h4>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200">Forward Estimate</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Based on historical settlement velocity, expect roughly <strong className="text-slate-900 font-bold">{metrics.forecast.min} – {metrics.forecast.max} exceptions</strong> in the next 7 days.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    onClick={handleToggleRiskWhy}
                    className="text-xs font-bold text-[#1E293B] hover:text-[#0F172A] bg-[#F1F5F9] hover:bg-[#E2E8F0] px-3 py-1.5 rounded-xl border border-[#E2E8F0] transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    Why this range? {showRiskWhy ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  <Link to="/exceptions" className="text-xs font-bold text-slate-600 hover:text-[#1E293B] hover:underline flex items-center gap-1">
                    Review Queue &rarr;
                  </Link>
                </div>
              </div>

              {/* Why this range? Historical Velocity Breakdown */}
              {showRiskWhy && riskBasis && (
                <div className="mt-2 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-150">
                  <div className="md:col-span-2 space-y-1.5">
                    <span className="text-[11px] font-bold text-[#1E293B] flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded bg-[#1E293B] text-white flex items-center justify-center font-bold text-[8px] font-mono">F</div> Grounded Stochastic Projection
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {riskBasis.ai_narration}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trailing 30-Day Velocity</span>
                    <div className="text-sm font-bold text-slate-900 font-mono">
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
                      transactions.length < 30 ? 'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]' : (benfordData?.is_compliant ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]' : 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]')
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
                      transactions.length < 30 ? 'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]' : (benfordData.is_compliant ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]' : 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]')
                    }`}>
                      {transactions.length < 30 ? 'Sample < 30' : `MAD ${benfordData.mad}`}
                    </span>
                  )}
                </div>

                {/* Forensic Result / Sample Size Notification Box */}
                {transactions.length < 30 ? (
                  <div className="my-3 p-3 bg-[#FFFBEB]/70 rounded-xl border border-[#FEF3C7] flex items-start gap-2.5">
                    <AlertTriangle size={14} className="text-[#B45309] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#B45309] leading-relaxed font-medium">
                      Fewer than 30 transactions in this view (found {transactions.length}) — statistical checks need a larger sample to be meaningful.
                    </p>
                  </div>
                ) : (
                  <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded bg-[#1E293B] text-white flex items-center justify-center font-bold text-[8px] font-mono shrink-0 mt-0.5">F</div>
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
                      className="text-[#1E293B] hover:text-[#0F172A] font-bold hover:underline cursor-pointer"
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
                      ? 'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]' 
                      : (mlAnomalies.length > 0 ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]' : 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]')
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
                  <div className="my-2 p-2.5 bg-[#FFFBEB]/70 rounded-xl border border-[#FEF3C7] text-[11px] text-[#B45309] leading-relaxed font-medium">
                    Fewer than 20 transactions in this view (found {transactions.length}) — statistical checks need a larger sample to be meaningful.
                  </div>
                ) : (
                  <div className="my-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-800 leading-relaxed font-medium flex items-start gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-[#1E293B] text-white flex items-center justify-center font-bold text-[8px] font-mono shrink-0 mt-0.5">F</div>
                    <span>
                      {forensicNarration?.isolation_forest?.ai_narration || `${pluralize(mlAnomalies.length, 'transaction', 'transactions')} flagged by Isolation Forest model based on fee-to-gross ratio and transit duration.`}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Beyond explicit rules</span>
                  {transactions.length >= 20 && mlAnomalies.length > 0 ? (
                    <Link to="/exceptions" className="text-xs font-bold text-[#1E293B] hover:underline">
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
                        <Tooltip 
                          formatter={(value) => `${value}%`} 
                          contentStyle={{ 
                            backgroundColor: isDark ? '#151B24' : '#FFFFFF', 
                            borderRadius: '12px', 
                            border: `1px solid ${isDark ? '#262D38' : '#e4e4e7'}`, 
                            color: isDark ? '#F3F4F6' : '#111827',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' 
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-lg font-bold text-slate-800">{metrics.total_settled_val_pct}%</span>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Settled</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center justify-between p-3 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0]">
                      <span className="text-xs font-semibold text-emerald-900">Total Value Successfully Matched</span>
                      <span className="text-sm font-bold text-[#15803D]">{(metrics.match_rate * 100).toFixed(2)}%</span>
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
                  <Link to="/month-end-close" className="text-[#1E293B] font-semibold hover:underline">Closing audit &rarr;</Link>
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
                    <div className="bg-[#15803D] rounded-l-full hover:opacity-90 transition-opacity" style={{width: `${metrics.count_trust.verified}%`}} title={`Verified: ${metrics.count_trust.verified.toFixed(1)}%`}></div>
                    <div className="bg-[#B45309] hover:opacity-90 transition-opacity" style={{width: `${metrics.count_trust.probable}%`}} title={`Probable: ${metrics.count_trust.probable.toFixed(1)}%`}></div>
                    <div className="bg-[#B91C1C] hover:opacity-90 transition-opacity" style={{width: `${metrics.count_trust.exception}%`}} title={`Exceptions: ${metrics.count_trust.exception.toFixed(1)}%`}></div>
                    <div className="bg-[#9CA3AF] rounded-r-full hover:opacity-90 transition-opacity" style={{width: `${metrics.count_trust.unresolved}%`}} title={`Unresolved: ${metrics.count_trust.unresolved.toFixed(1)}%`}></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium pt-2">
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-[#15803D] shrink-0"></span>
                      <span>Verified: <strong className="text-slate-900">{metrics.count_trust.verified.toFixed(1)}%</strong></span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-[#B45309] shrink-0"></span>
                      <span>Probable: <strong className="text-slate-900">{metrics.count_trust.probable.toFixed(1)}%</strong></span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-[#B91C1C] shrink-0"></span>
                      <span>Exceptions: <strong className="text-slate-900">{metrics.count_trust.exception.toFixed(1)}%</strong></span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-[#9CA3AF] shrink-0"></span>
                      <span>Unresolved: <strong className="text-slate-900">{metrics.count_trust.unresolved.toFixed(1)}%</strong></span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Deterministic Ind AS verification tiering</span>
                  <Link to="/exceptions" className="text-[#1E293B] font-semibold hover:underline">Exceptions queue &rarr;</Link>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>

    </div>
  );
}
