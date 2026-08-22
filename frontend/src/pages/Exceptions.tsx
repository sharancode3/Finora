import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ShieldCheck, Search, Filter, Calendar, ChevronDown, ChevronRight, CheckCircle, Info, Activity } from 'lucide-react';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { Button } from '../components/ui/Button';

export default function Exceptions() {
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchExceptions();
  }, [activeFilter]);

  const fetchExceptions = async () => {
    setLoading(true);
    try {
      // If we had more filters we'd pass them as query params, e.g., ?reason=FEE_MISMATCH
      const res = await api.get('/records/exceptions');
      setExceptions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRow(prev => prev === id ? null : id);
  };

  const filteredExceptions = exceptions.filter(ex => 
    ex.id.toLowerCase().includes(search.toLowerCase()) || 
    (ex.related_settlement_id && ex.related_settlement_id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header & Stats */}
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Exceptions Queue</h2>
          <p className="text-slate-500 mt-1 text-sm">Review unmatched records and deterministic failure reasons.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-lg border border-border shadow-sm flex flex-col items-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total</span>
            <span className="text-xl font-bold text-slate-900">{exceptions.length}</span>
          </div>
          <div className="bg-white p-4 rounded-lg border border-border shadow-sm flex flex-col items-center border-t-2 border-t-rose-600">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Critical</span>
            <span className="text-xl font-bold text-rose-600">
              {exceptions.filter(e => e.severity === 'CRITICAL').length}
            </span>
          </div>
          <div className="bg-white p-4 rounded-lg border border-border shadow-sm flex flex-col items-center border-t-2 border-t-orange-500">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">High</span>
            <span className="text-xl font-bold text-orange-600">
              {exceptions.filter(e => e.severity === 'HIGH').length}
            </span>
          </div>
          <div className="bg-white p-4 rounded-lg border border-border shadow-sm flex flex-col items-center border-t-2 border-t-amber-400">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Medium</span>
            <span className="text-xl font-bold text-amber-600">
              {exceptions.filter(e => e.severity === 'MEDIUM').length}
            </span>
          </div>
          <div className="bg-white p-4 rounded-lg border border-border shadow-sm flex flex-col items-center border-t-2 border-t-blue-400">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Low</span>
            <span className="text-xl font-bold text-blue-600">
              {exceptions.filter(e => e.severity === 'LOW').length}
            </span>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-sm flex flex-col items-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Value At Risk</span>
            <span className="text-xl font-bold text-white">
              <AmountDisplay amount={exceptions.reduce((sum, e) => sum + (e.amount || 0), 0)} />
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
          {['All', 'Amount Mismatch', 'Missing', 'Duplicate', 'Fee/Tax'].map(f => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeFilter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-border rounded-lg text-sm focus:outline-none focus:border-primary-accent focus:ring-1 focus:ring-primary-accent"
            />
          </div>
          <button className="flex items-center justify-center gap-2 p-2 border border-border rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <Calendar size={16} />
          </button>
          <button className="flex items-center justify-center gap-2 p-2 border border-border rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* DataTable */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center text-slate-400"><Info size={24} className="animate-pulse" /></div>
        ) : filteredExceptions.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-500">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No exceptions found</h3>
            <p className="text-sm">All records reconciled successfully.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-border text-[12px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="p-4 pl-6 w-10"></th>
                <th className="p-4">Record ID</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Trust State</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Severity</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredExceptions.map((ex) => (
                <React.Fragment key={ex.id}>
                  <tr 
                    className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${expandedRow === ex.id ? 'bg-indigo-50/30' : ''}`}
                    onClick={() => toggleRow(ex.id)}
                  >
                    <td className="p-4 pl-6 text-slate-400">
                      {expandedRow === ex.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </td>
                    <td className="p-4 text-[13px] font-mono text-slate-900 font-medium">{ex.id.substring(0, 12)}...</td>
                    <td className="p-4 text-[13px] text-slate-700">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-100">
                        {ex.reason}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 text-[12px] font-medium text-rose-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> EXCEPTION
                      </span>
                    </td>
                    <td className="p-4 text-[13px] text-slate-600">2026-08-22</td>
                    <td className="p-4 text-[14px] font-bold text-slate-900"><AmountDisplay amount={ex.amount} /></td>
                    <td className="p-4"><SeverityBadge severity={ex.severity || 'MEDIUM'} /></td>
                    <td className="p-4 pr-6 text-right">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); toggleRow(ex.id); }}>Investigate</Button>
                    </td>
                  </tr>
                  
                  {/* Expanded Inline Accordion */}
                  {expandedRow === ex.id && (
                    <tr>
                      <td colSpan={8} className="p-0 border-b border-border bg-slate-50/80 shadow-inner">
                        <div className="p-6 pl-14">
                          
                          {/* AI Summary Banner */}
                          {ex.ai_summary && (
                            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg flex gap-3">
                              <div className="mt-0.5"><Activity size={18} className="text-primary-accent" /></div>
                              <div>
                                <h4 className="text-xs font-bold text-indigo-900 mb-1 uppercase tracking-wider">AI Summary</h4>
                                <p className="text-sm text-indigo-800 leading-relaxed">{ex.ai_summary}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            {/* Recommended Action */}
                            <div className="bg-white p-4 rounded-lg border border-border shadow-sm flex flex-col">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recommended Action</h4>
                              <p className="text-sm text-slate-700 mb-4 flex-1">
                                {ex.recommended_action || "Manual review required. Please check source systems to verify the transaction status."}
                              </p>
                              <div className="flex gap-2">
                                <Button variant="primary" size="sm" className="flex-1">Mark Explained</Button>
                                <Button variant="outline" size="sm" className="flex-1">Escalate</Button>
                              </div>
                            </div>

                            {/* Evidence Cards */}
                            <div className="lg:col-span-2 grid grid-cols-3 gap-3">
                              <div className="bg-white p-3 rounded-lg border border-border shadow-sm">
                                <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Settlement Record</h5>
                                {ex.related_settlement_id ? (
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between"><span className="text-[11px] text-slate-400">ID</span><span className="text-[11px] font-mono text-slate-700">{ex.related_settlement_id}</span></div>
                                    <div className="flex justify-between"><span className="text-[11px] text-slate-400">Amount</span><span className="text-[12px] font-semibold text-slate-900"><AmountDisplay amount={ex.amount} /></span></div>
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-slate-400 italic py-2">No settlement linked</div>
                                )}
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-border shadow-sm">
                                <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Bank Record</h5>
                                {ex.related_bank_id ? (
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between"><span className="text-[11px] text-slate-400">ID</span><span className="text-[11px] font-mono text-slate-700">{ex.related_bank_id}</span></div>
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-slate-400 italic py-2">No bank record found</div>
                                )}
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-border shadow-sm">
                                <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Ledger Record</h5>
                                {ex.related_ledger_id ? (
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between"><span className="text-[11px] text-slate-400">ID</span><span className="text-[11px] font-mono text-slate-700">{ex.related_ledger_id}</span></div>
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-slate-400 italic py-2">No ledger record linked</div>
                                )}
                              </div>
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
