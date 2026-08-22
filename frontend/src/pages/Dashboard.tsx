import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ShieldCheck, AlertTriangle, CheckCircle, TrendingUp, HelpCircle } from 'lucide-react';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { ProgressRing } from '../components/ui/ProgressRing';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [attentionItems, setAttentionItems] = useState<any[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [metricsRes, attentionRes, exceptionsRes] = await Promise.all([
          api.get('/dashboard/metrics'),
          api.get('/dashboard/attention'),
          api.get('/records/exceptions')
        ]);
        setMetrics(metricsRes.data);
        setAttentionItems(attentionRes.data);
        setExceptions(exceptionsRes.data.slice(0, 5));
        setLoading(false);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-32 bg-slate-100 rounded-xl"></div>
      <div className="h-16 bg-slate-100 rounded-xl"></div>
      <div className="grid grid-cols-3 gap-6"><div className="h-64 col-span-2 bg-slate-100 rounded-xl"></div><div className="h-64 bg-slate-100 rounded-xl"></div></div>
    </div>;
  }

  // Mock data for charts
  const matchMethodsData = [
    { name: 'Exact', value: 85, color: '#10b981' },
    { name: 'Batched', value: 8, color: '#3b82f6' },
    { name: 'Fuzzy', value: 5, color: '#f59e0b' },
    { name: 'Exception', value: 2, color: '#f43f5e' }
  ];

  const trendData = [
    { date: 'Aug 16', amount: 3200000 },
    { date: 'Aug 17', amount: 2800000 },
    { date: 'Aug 18', amount: 3500000 },
    { date: 'Aug 19', amount: 2900000 },
    { date: 'Aug 20', amount: 3800000 },
    { date: 'Aug 21', amount: 4200000 },
    { date: 'Aug 22', amount: 4800000 },
  ];

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Row: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500 mb-2">
            <span className="text-sm font-medium">Total Processed</span>
            <button className="text-slate-400 hover:text-primary-accent"><HelpCircle size={14}/></button>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            <AmountDisplay amount={metrics?.total_processed * 100000} />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500 mb-2">
            <span className="text-sm font-medium">Settled Amount</span>
            <span className="text-xs font-semibold text-emerald-500 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
              <TrendingUp size={12} className="mr-1" /> +12%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            <AmountDisplay amount={metrics?.settled_amount || 0} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between border-l-4 border-l-rose-500">
          <div className="flex justify-between items-start text-slate-500 mb-2">
            <span className="text-sm font-medium">Unreconciled</span>
            <button className="text-slate-400 hover:text-primary-accent"><HelpCircle size={14}/></button>
          </div>
          <div className="text-2xl font-bold text-rose-600">
            <AmountDisplay amount={metrics?.unreconciled_amount || 0} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start text-slate-500 mb-2">
            <span className="text-sm font-medium">Reconciliation Rate</span>
            <button className="text-slate-400 hover:text-primary-accent"><HelpCircle size={14}/></button>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-slate-900">
              {(metrics?.match_rate * 100).toFixed(1)}%
            </div>
            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${metrics?.match_rate * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust State Bar */}
      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Trust State Breakdown</h3>
        <div className="flex w-full h-3 rounded-full overflow-hidden">
          <div className="bg-emerald-500 hover:opacity-90 cursor-pointer transition-opacity" style={{width: '85%'}} title="Verified: 85%"></div>
          <div className="bg-amber-400 hover:opacity-90 cursor-pointer transition-opacity" style={{width: '10%'}} title="Probable: 10%"></div>
          <div className="bg-rose-500 hover:opacity-90 cursor-pointer transition-opacity" style={{width: '3%'}} title="Exception: 3%"></div>
          <div className="bg-slate-300 hover:opacity-90 cursor-pointer transition-opacity" style={{width: '2%'}} title="Unresolved: 2%"></div>
        </div>
        <div className="flex justify-between text-xs mt-3 text-slate-500 font-medium">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> VERIFIED (85%)</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"></div> PROBABLE (10%)</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> EXCEPTION (3%)</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-300"></div> UNRESOLVED (2%)</div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Matching Methods */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-border shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex justify-between">
            Value-Weighted Reconciliation
          </h3>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-40 h-40 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={matchMethodsData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {matchMethodsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-800">97.4%</span>
                <span className="text-[10px] text-slate-500">Match</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                <span className="text-sm font-medium text-slate-600">Record Match Rate</span>
                <span className="font-bold text-slate-800">95.3%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded border border-emerald-100">
                <span className="text-sm font-medium text-emerald-800">Financial Value Reconciled</span>
                <span className="font-bold text-emerald-700">97.41%</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                {matchMethodsData.map(m => (
                  <div key={m.name} className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: m.color}}></div>
                    {m.name}: {m.value}%
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Attention Required */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            Attention Required
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-3">
            {attentionItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <CheckCircle size={32} className="text-emerald-400 mb-2" />
                <p className="text-sm">All clear — no items requiring attention</p>
              </div>
            ) : (
              attentionItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors border-l-2 border-l-rose-500 shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <SeverityBadge severity={item.severity} />
                    <span className="text-[11px] font-mono text-slate-400">{item.record_id?.split('-')[1] || item.record_id}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{item.message}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-bold text-slate-900"><AmountDisplay amount={item.amount} /></span>
                    <Link to={`/record/exception/${item.record_id}`} className="text-xs font-semibold text-primary-accent hover:underline">Investigate &rarr;</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Fourth Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Exceptions Table */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-semibold text-slate-700">Recent Exceptions</h3>
            <Link to="/exceptions" className="text-xs font-medium text-primary-accent hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-border text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-3 pl-5">ID</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3 pr-5 text-right">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {exceptions.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 pl-5 text-[12px] font-mono text-slate-600">
                      <Link to={`/record/exception/${ex.id}`} className="hover:text-primary-accent hover:underline">{ex.id.substring(0, 8)}...</Link>
                    </td>
                    <td className="p-3 text-[12px] text-slate-700">{ex.reason.replace('_', ' ').toLowerCase()}</td>
                    <td className="p-3 text-[13px] font-semibold text-slate-900">
                      <AmountDisplay amount={ex.amount} />
                    </td>
                    <td className="p-3 pr-5 text-right">
                      <SeverityBadge severity={ex.severity || 'MEDIUM'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cash at a Glance */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-5 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold text-slate-700">Cash at a Glance</h3>
            <Link to="/cash-position" className="text-xs font-medium text-primary-accent hover:underline">View Forecast &rarr;</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-sm font-medium text-slate-600">Available</span>
              <span className="text-lg font-bold text-slate-900"><AmountDisplay amount={metrics?.cash_available || 1050000.0} /></span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-lg">
              <span className="text-sm font-medium text-slate-600">Pending Settlements</span>
              <span className="text-lg font-bold text-amber-600"><AmountDisplay amount={metrics?.pending_settlements || 250000.0} /></span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-lg border-l-2 border-l-primary-accent">
              <span className="text-sm font-medium text-slate-600">Expected Inflows (7d)</span>
              <span className="text-lg font-bold text-primary-accent"><AmountDisplay amount={metrics?.expected_inflows || 500000.0} /></span>
            </div>
          </div>
        </div>

      </div>

      {/* Fifth Row: Area Chart */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-semibold text-slate-700">Settlement Trend</h3>
          <button className="text-xs flex items-center text-slate-500 hover:text-primary-accent transition-colors">
            <HelpCircle size={14} className="mr-1" /> Why?
          </button>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val/100000}L`} />
              <Tooltip 
                formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, 'Settled']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
