import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { 
  FileCode, 
  ArrowLeft, 
  Link as LinkIcon, 
  AlertCircle, 
  Search, 
  CheckCircle, 
  CheckCircle2,
  Database,
  ShieldCheck,
  CreditCard,
  Building2,
  BookOpen,
  UserCheck,
  Flame,
  Clock,
  Sparkles
} from 'lucide-react';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';

export default function RecordDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [record, setRecord] = useState<any>(null);
  const [tx, setTx] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Resolution Action State
  const [actionState, setActionState] = useState<'resolve' | 'escalate' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [actionReason, setActionReason] = useState('Gateway Fee Adjustment');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchRecord = async () => {
    setLoading(true);
    try {
      if (type === 'exception') {
        const excRes = await api.get(`/exceptions/${id}`);
        const exceptionData = excRes.data;
        setRecord(exceptionData);
        
        if (exceptionData.transaction_id) {
          const txRes = await api.get(`/transactions/${exceptionData.transaction_id}`);
          setTx(txRes.data);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to fetch record');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && type) {
      fetchRecord();
    }
  }, [type, id]);

  const handleResolve = async () => {
    if (!id) return;
    try {
      await api.post(`/exceptions/${id}/resolve`, {
        reason: actionReason,
        note: actionNote || 'Direct resolution from Record Detail audit page'
      });
      setActionSuccess('Exception marked as explained and successfully resolved.');
      setActionState(null);
      await fetchRecord();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEscalate = async () => {
    if (!id) return;
    try {
      await api.post(`/exceptions/${id}/escalate`, {
        note: actionNote || 'Escalated to Lead Controller from Record Detail audit page'
      });
      setActionSuccess('Exception successfully escalated to Lead Financial Controller.');
      setActionState(null);
      await fetchRecord();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-20 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-slate-100 rounded-md animate-pulse" />
          </div>
        </div>
        <CardSkeleton count={2} />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="p-20 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-xl mx-auto my-12">
        <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Record Not Found</h2>
        <p className="mt-2 text-xs text-slate-500">{error || 'The requested exception or transaction record does not exist in the ledger.'}</p>
        <Link to="/exceptions" className="mt-5 inline-block text-xs font-bold text-indigo-600 hover:underline bg-indigo-50 px-4 py-2 rounded-xl">
          &larr; Return to Exceptions Queue
        </Link>
      </div>
    );
  }

  // Format JSON view
  const combinedData = {
    exception: record,
    transaction: tx
  };
  const jsonString = JSON.stringify(combinedData, null, 2);

  const ud = record.underlying_data || {};
  const isResolved = record.status === 'resolved';
  const isEscalated = record.status === 'escalated';

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Header & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/exceptions" className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-900">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Exception Investigation
              </h2>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                isResolved 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : isEscalated
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {record.status || 'OPEN'}
              </span>
            </div>
            <p className="text-slate-500 font-mono text-xs mt-0.5">{id} • Ref: {record.transaction_id || 'N/A'}</p>
          </div>
        </div>

        {/* Quick Action Buttons on Header */}
        {!isResolved && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActionState(actionState === 'resolve' ? null : 'resolve')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 size={14} /> Mark Explained & Resolve
            </button>
            <button
              onClick={() => setActionState(actionState === 'escalate' ? null : 'escalate')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck size={14} /> Escalate
            </button>
          </div>
        )}
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} /> {actionSuccess}
        </div>
      )}

      {/* Interactive Resolution Drawer */}
      {actionState && (
        <div className="bg-white text-slate-900 p-5 rounded-2xl border border-indigo-200 shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {actionState === 'resolve' ? 'Accounting Adjustment & Resolution Sign-Off' : 'Escalate to Senior Controller'}
            </h4>
            <span className="text-[10px] text-slate-500 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Ind AS Audit Trail Enabled</span>
          </div>

          {actionState === 'resolve' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Adjustment Reason Category</label>
                <select
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Gateway Fee Adjustment">Gateway Fee Adjustment (MDR Variance)</option>
                  <option value="Timing Difference (T+3 Bank Float)">Timing Difference (T+3 Bank Float)</option>
                  <option value="Refund Chargeback Offsetting">Refund Chargeback Offsetting</option>
                  <option value="Manual Accounting Adjustment">Manual Accounting Adjustment</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Audit Annotation Note</label>
                <input
                  type="text"
                  placeholder="Explain why this variance is approved (e.g. Contractual negotiated fee rate applied)..."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setActionState(null)} className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer">Cancel</button>
                <button onClick={handleResolve} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer">Confirm Resolution</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Escalation Rationale</label>
                <input
                  type="text"
                  placeholder="State reason for escalation (e.g. Unrecognized bank UTR credit after 10 days)..."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setActionState(null)} className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer">Cancel</button>
                <button onClick={handleEscalate} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer">Submit Escalation</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Investigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: 3-Way Reconciliation Evidence Graph */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5 flex items-center gap-2">
              <LinkIcon size={15} className="text-indigo-600" /> 3-Way Reconciliation Audit Nodes
            </h3>

            {/* Visual Flow nodes */}
            <div className="space-y-4">
              
              {/* 1. Ledger Node */}
              <div className="p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen size={14} className="text-indigo-600" /> 1. Internal Order Ledger
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Captured</span>
                </div>
                <div className="flex justify-between items-baseline mt-2">
                  <span className="text-xs text-slate-500">Gross Sale Amount:</span>
                  <span className="font-mono font-bold text-base text-slate-900">
                    <AmountDisplay amount={ud.gateway_gross || tx?.gross_amount || 0} />
                  </span>
                </div>
              </div>

              {/* 2. Gateway Settlement Node */}
              <div className="p-4 rounded-xl border-2 border-blue-100 bg-blue-50/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard size={14} className="text-blue-600" /> 2. Payment Gateway Settlement Feed
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Ingested</span>
                </div>
                <div className="flex justify-between items-baseline mt-2">
                  <span className="text-xs text-slate-500">Expected Net (Post 2%+GST):</span>
                  <span className="font-mono font-bold text-base text-slate-900">
                    <AmountDisplay amount={ud.calculated_net || (tx?.gross_amount ? tx.gross_amount * 0.976 : 0)} />
                  </span>
                </div>
                {ud.actual_fee && (
                  <div className="flex justify-between items-baseline mt-1 text-xs text-slate-600">
                    <span>Deducted MDR Fee:</span>
                    <span className="font-mono text-rose-600 font-bold">-₹{ud.actual_fee}</span>
                  </div>
                )}
              </div>

              {/* 3. Bank Statement Node */}
              <div className={`p-4 rounded-xl border-2 ${
                record.reason === 'no_bank_credit_found' 
                  ? 'border-rose-200 bg-rose-50/40' 
                  : 'border-emerald-100 bg-emerald-50/30'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 size={14} className="text-emerald-600" /> 3. Bank Account Statement
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    record.reason === 'no_bank_credit_found' 
                      ? 'bg-rose-50 text-rose-700 border-rose-200' 
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {record.reason === 'no_bank_credit_found' ? 'Credit Missing' : 'Batch Matched'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline mt-2">
                  <span className="text-xs text-slate-500">Bank Credit Ref:</span>
                  <span className="font-mono font-bold text-xs text-slate-900">
                    {tx?.bank_reference || (record.reason === 'no_bank_credit_found' ? 'Pending Bank UTR' : 'UTR892019482')}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Root-Cause Intelligence Notes */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Search size={15} className="text-indigo-600" /> Root-Cause Analysis
            </h3>
            
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1.5">
              <span className="font-bold text-slate-900 block capitalize">
                Discrepancy Signature: {record.reason?.replace(/_/g, ' ')}
              </span>
              <p className="text-slate-600 leading-relaxed">
                {record.reason === 'fee_variance' ? 'Gateway deducted MDR fees higher than contractual standard. Ind AS adjustment is recommended to post variance to suspense.' : 
                 record.reason === 'no_bank_credit_found' ? 'Settlement transit delay exceeds expected T+2 window. Check gateway batch logs or escalate if delay exceeds 5 business days.' :
                 'Discrepancy identified in transaction valuation or duplicate ledger record.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Raw JSON Audit File View */}
        <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 flex flex-col h-[650px] overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode size={16} className="text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-300 font-mono">underlying_data.json</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Immutable SQLite Record</span>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-[#0d1117]">
            <pre className="text-[12px] leading-relaxed text-slate-300 font-mono">
              {jsonString.split('\n').map((line, i) => (
                <div key={i} className="flex hover:bg-slate-800/50 px-2 rounded">
                  <span className="w-8 shrink-0 text-slate-600 select-none text-right pr-4 text-[11px]">{i + 1}</span>
                  <span className={`${line.includes('":') ? 'text-indigo-300' : ''} ${line.includes('null') ? 'text-slate-500' : ''}`}>{line}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
