import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Wallet, Clock, TrendingUp, Info, Zap } from 'lucide-react';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Button } from '../components/ui/Button';

export default function CashPosition() {
  const [cashPos, setCashPos] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cashRes, forecastRes] = await Promise.all([
          api.get('/forecast/cash-position'),
          api.get('/forecast/projected')
        ]);
        setCashPos(cashRes.data);
        setForecast(forecastRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Mock data for actual vs projected
  const chartData = [
    { date: 'Aug 18', actual: 1200000, projected: null },
    { date: 'Aug 19', actual: 1250000, projected: null },
    { date: 'Aug 20', actual: 1300000, projected: null },
    { date: 'Aug 21', actual: 1400000, projected: null },
    { date: 'Aug 22 (Today)', actual: 1050000, projected: 1050000 },
    { date: 'Aug 23', actual: null, projected: 1100000 },
    { date: 'Aug 24', actual: null, projected: 1350000 },
    { date: 'Aug 25', actual: null, projected: 1550000 },
  ];

  if (loading) {
    return <div className="p-10 flex justify-center text-slate-400"><Info size={24} className="animate-pulse" /></div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Cash Position & Forecast</h2>
          <p className="text-slate-500 mt-1 text-sm">Real-time liquidity and 7-day projection.</p>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Clock size={12} /> Last updated: Just now
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-slate-500">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Wallet size={20} /></div>
            <span className="font-semibold text-sm">Available Cash</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            <AmountDisplay amount={cashPos?.cash_available || 0} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-slate-500">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20} /></div>
            <span className="font-semibold text-sm">Pending Settlements</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            <AmountDisplay amount={cashPos?.pending_settlements || 0} />
          </div>
          <p className="text-xs text-slate-400 mt-2">Expected within 48h</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-slate-500">
            <div className="p-2 bg-indigo-50 text-primary-accent rounded-lg"><TrendingUp size={20} /></div>
            <span className="font-semibold text-sm">Projected Inflow (7d)</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            <AmountDisplay amount={forecast?.expected_inflows || 0} />
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp size={10} className="text-emerald-500" /> +15% vs last week
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <Info className="text-blue-500 mt-0.5 shrink-0" size={18} />
        <div className="text-sm text-blue-900">
          <span className="font-bold block mb-1">Projection Confidence: High</span>
          Forecast is based on historical settlement patterns and currently unresolved exceptions. Actual cash flow may vary based on weekend settlement schedules.
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-6">Actual vs Projected Balance</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `₹${val/100000}L`} dx={-10} />
              <Tooltip 
                formatter={(value: any, name: any) => [`₹${value.toLocaleString('en-IN')}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="actual" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
              <Area type="monotone" dataKey="projected" stroke="#94a3b8" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorProjected)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* What-If Simulator (Stub) */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Zap size={120} />
        </div>
        <div className="relative z-10 max-w-xl">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Zap size={18} className="text-amber-400" /> What-If Simulator
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Simulate how business decisions affect your short-term liquidity. (Coming in Phase 7)
          </p>
          <div className="flex gap-4">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex-1 opacity-75">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Delay Vendor Payout</label>
              <select className="w-full bg-slate-900 border border-slate-600 rounded text-sm text-slate-300 py-2 px-3" disabled>
                <option>By 7 days</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="primary" disabled className="bg-indigo-600 hover:bg-indigo-600 cursor-not-allowed">
                Run Simulation
              </Button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
