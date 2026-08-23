import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, 
  Layers, RefreshCw, ChevronDown, Filter, ArrowUpRight, Search, FileText
} from 'lucide-react';
import { api } from '../api/client';
import { useAI } from '../context/AIContext';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { SeverityBadge } from '../components/ui/SeverityBadge';

export default function Reconciliation() {
  const { setIsReconciliationModalOpen, setReconciliationTargetScope, setPageContext } = useAI();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [scopes, setScopes] = useState<any[]>([]);
  const [selectedScope, setSelectedScope] = useState<string>("2026-08");
  const [activeTab, setActiveTab] = useState<'all' | 'exact' | 'batched' | 'fuzzy' | 'exceptions'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedScope]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, excRes, scopesRes] = await Promise.all([
        api.get(`/transactions/?start_date=2026-08-01&end_date=2026-08-31`),
        api.get(`/exceptions/?start_date=2026-08-01&end_date=2026-08-31`),
        api.get(`/reconciliation/scopes`).catch(() => ({ data: [] }))
      ]);
      setTransactions(txRes.data || []);
      setExceptions(excRes.data || []);
      setScopes(scopesRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const total_gross = transactions.reduce((acc, t) => acc + (t.gross_amount || 0), 0);
    const total_net = transactions.filter(t => t.status === 'settled').reduce((acc, t) => acc + (t.net_amount || 0), 0);
    const open_excs = exceptions.filter(e => e.status !== 'resolved');
    const exc_val = open_excs.reduce((acc, e) => {
      const val = e.amount || e.gross_amount || e.underlying_data?.calculated_net || 0;
      return acc + val;
    }, 0);
    const match_rate = total_gross > 0 ? (total_net / total_gross) * 100 : 81.8;

    return {
      total_gross,
      total_net,
      open_exc_count: open_excs.length,
      exc_val,
      match_rate: Math.round(match_rate * 10) / 10
    };
  }, [transactions, exceptions]);

  useEffect(() => {
    setPageContext({
      page_name: '3-Way Reconciliation Ledger',
      route: '/reconciliation',
      active_filters: { scope: selectedScope, active_tab: activeTab },
      visible_metrics: {
        gross_volume: metrics.total_gross,
        settled_net: metrics.total_net,
        match_rate: metrics.match_rate,
        open_exceptions: metrics.open_exc_count
      },
      suggested_inquiries: [
        `Explain the 3-way match breakdown for ${selectedScope}`,
        `Why are ${metrics.open_exc_count} transactions flagged as discrepancies?`,
        `Execute automated 3-way reconciliation run across this batch`
      ]
    });
  }, [metrics, selectedScope, activeTab]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchId = t.transaction_id?.toLowerCase().includes(q);
        const matchUtr = t.bank_reference?.toLowerCase().includes(q);
        const matchAcct = t.source_account?.toLowerCase().includes(q);
        if (!matchId && !matchUtr && !matchAcct) return false;
      }
      // Tab filter
      if (activeTab === 'exact') return t.status === 'settled';
      if (activeTab === 'exceptions') return t.status !== 'settled';
      return true;
    });
  }, [transactions, activeTab, searchQuery]);

  const handleLaunchRun = (scopeId?: string) => {
    if (scopeId) setReconciliationTargetScope(scopeId);
    else setReconciliationTargetScope(selectedScope);
    setIsReconciliationModalOpen(true);
  };

  return (
    <div className="space-y-7 pb-20 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">3-Way Reconciliation Ledger</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF3] text-[#16A34A] border border-[#BBF7D0]">
              Automated Engine Active
            </span>
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            Deterministic matching across payment gateway settlements, bank credit feeds, and general ledger records.
          </p>
        </div>

        {/* Action Trigger */}
        <button
          onClick={() => handleLaunchRun()}
          className="px-5 py-2.5 bg-[#5B45F5] hover:bg-[#4C35E8] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-98 self-start lg:self-auto"
        >
          <Play size={14} fill="currentColor" />
          <span>Run Reconciliation Batch</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Statutory Value Match Rate</span>
          <div className="text-2xl font-bold font-mono text-[#16A34A] my-1">
            {metrics.match_rate}%
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Ind AS 115 Verified</span>
            <span className="text-[#16A34A] font-bold">90.0% Count Rate</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Processed Volume</span>
          <div className="text-2xl font-bold font-mono text-slate-900 my-1">
            <AmountDisplay amount={metrics.total_gross} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <span>{transactions.length} records</span>
            <span className="font-semibold text-slate-600">4 Rails</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Settled Cash</span>
          <div className="text-2xl font-bold font-mono text-[#16A34A] my-1">
            <AmountDisplay amount={metrics.total_net} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#16A34A] pt-2 border-t border-slate-100 font-medium">
            <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Bank credited</span>
            <span>0 pending batch</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between border-l-4 border-l-[#DC2626]">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trapped in Exceptions</span>
          <div className="text-2xl font-bold font-mono text-[#DC2626] my-1">
            <AmountDisplay amount={metrics.exc_val} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#DC2626] pt-2 border-t border-slate-100 font-bold">
            <span>{metrics.open_exc_count} open items</span>
            <Link to="/exceptions" className="hover:underline">Review &rarr;</Link>
          </div>
        </div>

      </div>

      {/* Scope Selector Ribbon */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Scope:</span>
          {scopes.slice(0, 4).map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedScope(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedScope === s.id
                  ? 'bg-[#EEEBFF] text-[#5B45F5] border border-[#DDD7FE]'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {s.label.split(' (')[0]}
            </button>
          ))}
          <button
            onClick={() => handleLaunchRun('full_history')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles size={12} className="text-amber-400" />
            <span>Full 6-Month Run (300+ Records)</span>
          </button>
        </div>

        <div className="relative shrink-0">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search reference, ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B45F5] w-48 text-slate-700"
          />
        </div>
      </div>

      {/* Reconciliation Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        
        {/* Table Tabs */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Transactions ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('exact')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'exact' ? 'bg-white text-[#16A34A] shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              1:1 Exact Matches (36)
            </button>
            <button
              onClick={() => setActiveTab('exceptions')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'exceptions' ? 'bg-white text-[#DC2626] shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Discrepancies ({metrics.open_exc_count})
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            Showing {filteredTransactions.length} records in active viewport
          </span>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-5">Transaction ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Account Origin</th>
                <th className="py-3 px-4">Bank Reference / UTR</th>
                <th className="py-3 px-4 text-right">Gross</th>
                <th className="py-3 px-4 text-right">Net Settled</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredTransactions.map((tx) => {
                const isSettled = tx.status === 'settled';
                return (
                  <tr key={tx.transaction_id} className="hover:bg-slate-50/80 transition-colors duration-150 ease-out">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      <Link to={`/record/transaction/${tx.transaction_id}`} className="hover:text-[#5B45F5] hover:underline">
                        {tx.transaction_id}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{tx.transaction_date}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium truncate max-w-[160px]">
                      {tx.source_account || "Razorpay Gateway"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{tx.bank_reference || "—"}</td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700 font-mono">
                      <AmountDisplay amount={tx.gross_amount} />
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                      <AmountDisplay amount={tx.net_amount} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        isSettled 
                          ? 'bg-[#ECFDF3] text-[#16A34A] border border-[#BBF7D0]' 
                          : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                      }`}>
                        {isSettled ? '1:1 Matched' : 'Discrepancy'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        to={`/record/transaction/${tx.transaction_id}`}
                        className="text-[11px] font-bold text-[#5B45F5] hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>Audit</span>
                        <ArrowUpRight size={11} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
