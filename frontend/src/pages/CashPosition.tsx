import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { 
  Wallet, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  AlertTriangle, 
  Zap, 
  Minus, 
  ArrowRight, 
  ChevronDown,
  ShieldCheck,
  DollarSign,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { CardSkeleton, ChartSkeleton } from '../components/ui/Skeleton';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Cell, 
  Line, 
  ComposedChart 
} from 'recharts';

export default function CashPosition() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scenarioActive, setScenarioActive] = useState(false);
  
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('all');

  useEffect(() => {
    api.get('/accounts/').then(res => setAccounts(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    // Read global date range from Dashboard state, fallback to August
    let start = '2026-08-01';
    let end = '2026-08-31';
    try {
      const stored = localStorage.getItem('finora_dashboard_range');
      if (stored) {
        const parsed = JSON.parse(stored);
        start = parsed.start;
        end = parsed.end;
      }
    } catch (e) {}

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/analytics/cash-position?start_date=${start}&end_date=${end}&account_id=${selectedAccount}`);
        setAnalytics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedAccount]);

  if (loading && !analytics) {
    return (
      <div className="space-y-7 pb-20 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-7 w-64 bg-slate-200/80 rounded-xl animate-pulse" />
            <div className="h-4 w-96 bg-slate-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-9 w-44 bg-slate-200/80 rounded-xl animate-pulse" />
        </div>
        <CardSkeleton count={3} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton height="h-80" />
          <ChartSkeleton height="h-80" />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const { dso, leakage, waterfall, anomaly, scenario, monte_carlo } = analytics;

  // Adapt Waterfall data for Recharts [start, end]
  const waterfallData = (waterfall || []).map((step: any) => ({
    name: step.name,
    range: [step.start, step.end],
    color: step.color
  }));

  // Toggle override
  const displayNet = scenarioActive ? scenario.projected_with_exceptions : leakage.net;

  // Fan chart data
  const fanChartData = (monte_carlo?.fan_chart || []).map((d: any) => ({
    date: d.date,
    day: d.day,
    p10: scenarioActive ? d.resolved_p10 : d.p10,
    p50: scenarioActive ? d.resolved_p50 : d.p50,
    p90: scenarioActive ? d.resolved_p90 : d.p90,
    // delta for area chart layering
    range: scenarioActive ? [d.resolved_p10, d.resolved_p90] : [d.p10, d.p90]
  }));

  const activeP10 = scenarioActive ? (monte_carlo?.fan_chart?.[6]?.resolved_p10 || 0) : monte_carlo?.day7_p10;
  const activeP90 = scenarioActive ? (monte_carlo?.fan_chart?.[6]?.resolved_p90 || 0) : monte_carlo?.day7_p90;
  const activeDate = monte_carlo?.fan_chart?.[6]?.date || 'Sep 07';

  return (
    <div className="space-y-7 pb-20 max-w-7xl mx-auto">
      
      {/* Anomaly Banner */}
      {anomaly.is_anomalous && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xs ${
          anomaly.direction === 'down' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          <AlertTriangle className={`mt-0.5 shrink-0 ${anomaly.direction === 'down' ? 'text-amber-500' : 'text-blue-500'}`} size={18} />
          <div className="text-xs">
            <span className="font-bold block mb-0.5 text-slate-900">Volume Statistical Anomaly Flagged</span>
            {anomaly.description}
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cash Position & Treasury Intelligence</h1>
          <p className="text-slate-500 mt-1 text-sm">Monte Carlo probabilistic forecasting, settlement delay transit (DSO), and cash leakage waterfall.</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Account Filter */}
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

          {/* What-If Scenario Toggle */}
          <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2.5">
            <span className={`text-xs font-semibold px-2 transition-colors ${!scenarioActive ? 'text-slate-900' : 'text-slate-400'}`}>Current State</span>
            <button 
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${scenarioActive ? 'bg-indigo-600' : 'bg-slate-200'}`}
              onClick={() => setScenarioActive(!scenarioActive)}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${scenarioActive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className={`text-xs font-bold flex items-center gap-1 pr-2 transition-colors ${scenarioActive ? 'text-indigo-600' : 'text-slate-400'}`}>
              <Zap size={13} /> Resolve Exceptions
            </span>
          </div>
        </div>
      </div>

      {/* Top 3 Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Usable Cash */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 text-slate-500">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Final Net Settled Cash</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600"><Wallet size={16} /></div>
          </div>
          <div className="text-3xl font-bold text-slate-900 flex items-center gap-2 mt-2">
            <AmountDisplay amount={displayNet} animated={true} />
            {scenarioActive && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                +<AmountDisplay amount={scenario.trapped_in_exceptions} animated={true} />
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {scenarioActive ? 'Projected assuming 100% exception resolution' : 'Actual money deposited in bank account'}
          </p>
        </div>

        {/* DSO Transit Delay */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 text-slate-500">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Settlement Delay (DSO)</span>
            <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Clock size={16} /></div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <div className="text-3xl font-bold text-slate-900">{dso.current} <span className="text-base font-normal text-slate-500">days</span></div>
            <div className={`flex items-center gap-0.5 text-xs font-bold ${
              dso.trend_direction === 'up' ? 'text-rose-600' : dso.trend_direction === 'down' ? 'text-emerald-600' : 'text-slate-400'
            }`}>
              {dso.trend_direction === 'up' ? <TrendingUp size={13} /> : dso.trend_direction === 'down' ? <TrendingDown size={13} /> : <Minus size={13} />}
              vs {dso.prior}d prior
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Average days money is in transit between gateway & bank</p>
        </div>

        {/* Cash Conversion Rate */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 text-slate-500">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cash Conversion Rate</span>
            <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600"><TrendingUp size={16} /></div>
          </div>
          <div className="text-3xl font-bold text-indigo-600 mt-2">{leakage.conversion_rate}%</div>
          <p className="text-[11px] text-slate-400 mt-2">Gross collected volume successfully converted to usable cash</p>
        </div>

      </div>

      {/* Monte Carlo 7-Day Treasury Forecast Fan Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">7-Day Monte Carlo Cash Forecast (1,000 Trials)</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                80% Confidence Envelope
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical probabilistic range sampling historical settlement delay variance and exception volatility.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-indigo-500/20 border border-indigo-500"></div>
              <span>80% CI (P10–P90)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-indigo-600"></div>
              <span>Median (P50)</span>
            </div>
          </div>
        </div>

        {/* Prediction Statement Banner */}
        <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <Sparkles size={16} />
            </div>
            <p className="text-xs text-slate-800">
              <span className="font-bold text-indigo-950">Treasury Forecast:</span> 80% probability available cash lands between{' '}
              <span className="font-mono font-bold text-indigo-900">₹{activeP10?.toLocaleString('en-IN')}</span> and{' '}
              <span className="font-mono font-bold text-indigo-900">₹{activeP90?.toLocaleString('en-IN')}</span> by{' '}
              <span className="font-bold text-slate-900">{activeDate}</span>.
            </p>
          </div>
          {scenarioActive && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
              Trapped Cash Unlocked (+₹{scenario.trapped_in_exceptions?.toLocaleString('en-IN')})
            </span>
          )}
        </div>

        {/* Fan Chart Render */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={fanChartData} margin={{ top: 10, right: 30, left: 15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} 
                domain={['dataMin - 10000', 'dataMax + 10000']}
              />
              <Tooltip 
                formatter={(val: any, name: any) => [
                  `₹${Number(val).toLocaleString('en-IN')}`, 
                  name === 'p50' ? 'Median (P50)' : name === 'p10' ? 'Pessimistic (P10)' : 'Optimistic (P90)'
                ]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              {/* Shaded 80% CI Band */}
              <Area type="monotone" dataKey="p90" stroke="transparent" fill="#6366f1" fillOpacity={0.12} />
              <Area type="monotone" dataKey="p10" stroke="transparent" fill="#ffffff" fillOpacity={1.0} />
              
              {/* Median Line */}
              <Line 
                type="monotone" 
                dataKey="p50" 
                stroke="#4f46e5" 
                strokeWidth={2.5} 
                dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }} 
                activeDot={{ r: 6 }} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Waterfall Visual & Leakage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Waterfall Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800">Cash Flow Waterfall</h3>
            <p className="text-xs text-slate-500">Gross processed volume stepping down through fees & GST to Net Cash.</p>
          </div>
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value: any) => [`₹${(value[1] - value[0]).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="range" radius={6}>
                  {waterfallData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leakage Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
           <div>
             <h3 className="text-sm font-bold text-slate-800">Cash Conversion & Leakage</h3>
             <p className="text-xs text-slate-500 mb-6">Granular deductions accounting for the gross-to-net spread.</p>
           </div>
           
           <div className="space-y-4 my-auto">
              <div>
                <div className="flex justify-between items-end mb-1.5 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">Gross Processed Volume</span>
                    <span className="text-[11px] text-slate-400">Total customer charges</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900"><AmountDisplay amount={leakage.gross} /></div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1.5 text-xs">
                  <div>
                    <span className="font-bold text-rose-600 block">Gateway MDR Fee (~2%)</span>
                    <span className="text-[11px] text-slate-400">Razorpay interchange & processing</span>
                  </div>
                  <div className="font-mono font-bold text-rose-600">-<AmountDisplay amount={leakage.fees} /></div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(leakage.fees / leakage.gross) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1.5 text-xs">
                  <div>
                    <span className="font-bold text-amber-600 block">GST on Gateway Fees (18%)</span>
                    <span className="text-[11px] text-slate-400">Tax input credit available</span>
                  </div>
                  <div className="font-mono font-bold text-amber-600">-<AmountDisplay amount={leakage.gst} /></div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${(leakage.gst / leakage.gross) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1.5 text-xs">
                  <div>
                    <span className="font-bold text-amber-700 block">Trapped in Open Exceptions</span>
                    <span className="text-[11px] text-slate-400">Pending reconciliation / suspense</span>
                  </div>
                  <div className="font-mono font-bold text-amber-700"><AmountDisplay amount={scenario.trapped_in_exceptions} /></div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(scenario.trapped_in_exceptions / leakage.gross) * 100}%` }}></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-end mb-2 text-xs">
                  <div>
                    <span className="font-bold text-emerald-700 block flex items-center gap-1">Final Settled Net Cash <ArrowRight size={13}/></span>
                    <span className="text-[11px] text-slate-400">Transferred to Bank Account</span>
                  </div>
                  <div className="font-mono text-base font-extrabold text-emerald-700"><AmountDisplay amount={displayNet} /></div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${leakage.conversion_rate}%` }}></div>
                </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
