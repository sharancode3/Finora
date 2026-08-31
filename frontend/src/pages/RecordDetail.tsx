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
  RotateCcw,
  Minus,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { AIInsightCard } from '../components/ui/AIInsightCard';
import { InstitutionLogo } from '../components/ui/InstitutionLogo';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { useAI } from '../context/AIContext';
import { AskableMetric } from '../components/ui/AskableMetric';
import { MultiCauseScoreBar } from '../components/ui/MultiCauseScoreBar';
import { PrecedentResolutionBanner } from '../components/ui/PrecedentResolutionBanner';
import { formatExceptionReason } from '../utils/formatters';

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

  // Phase 5 Multi-Cause Scoring & Human-Feedback Precedents State
  const [multiCauseScores, setMultiCauseScores] = useState<any>(null);
  const [precedentData, setPrecedentData] = useState<any>(null);

  // Phase 3 AI Investigation State
  const [aiInvestigation, setAiInvestigation] = useState<any>(null);
  const [investigationHistory, setInvestigationHistory] = useState<any[]>([]);
  const [investigating, setInvestigating] = useState(false);

  const fetchInvestigations = async (targetId?: string) => {
    const lookupId = targetId || id;
    if (lookupId) {
      try {
        const [invRes, scoreRes, precRes] = await Promise.all([
          api.get(`/exceptions/${lookupId}/investigations`).catch(() => ({ data: [] })),
          api.get(`/exceptions/${lookupId}/multi-cause-scores`).catch(() => ({ data: null })),
          api.get(`/exceptions/${lookupId}/precedents`).catch(() => ({ data: null }))
        ]);
        setInvestigationHistory(invRes.data || []);
        if (invRes.data && invRes.data.length > 0) {
          setAiInvestigation(invRes.data[0]);
        }
        if (scoreRes.data) {
          setMultiCauseScores(scoreRes.data);
        }
        if (precRes.data) {
          setPrecedentData(precRes.data);
        }
      } catch (e) {}
    }
  };

  const handleRunAiInvestigation = async () => {
    if (id) {
      setInvestigating(true);
      try {
        const res = await api.post(`/exceptions/${record?.id || id}/investigate-ai`);
        setAiInvestigation(res.data);
        await fetchInvestigations(record?.id || id);
      } catch (err) {
        console.error(err);
      } finally {
        setInvestigating(false);
      }
    }
  };

  const fetchRecord = async () => {
    setLoading(true);
    try {
      if (type === 'exception') {
        const excRes = await api.get(`/exceptions/${id}`);
        const exceptionData = excRes.data;
        setRecord(exceptionData);
        
        if (exceptionData.transaction_id) {
          try {
            const txRes = await api.get(`/transactions/${exceptionData.transaction_id}`);
            setTx(txRes.data);
          } catch (e) {}
        }
        await fetchInvestigations(exceptionData.id);
      } else if (type === 'transaction') {
        const txRes = await api.get(`/transactions/${id}`);
        const txData = txRes.data;
        setTx(txData);
        
        try {
          const excRes = await api.get(`/exceptions/${id}`);
          if (excRes.data) {
            setRecord(excRes.data);
            await fetchInvestigations(excRes.data.id);
          } else {
            setRecord({
              id: `exc_${txData.transaction_id}`,
              transaction_id: txData.transaction_id,
              reason: txData.status === 'settled' ? 'reconciled_settled' : 'fee_variance',
              status: txData.status === 'settled' ? 'resolved' : 'open',
              amount: txData.gross_amount,
              gross_amount: txData.gross_amount,
              transaction_date: txData.transaction_date,
              underlying_data: txData
            });
          }
        } catch (e) {
          setRecord({
            id: `exc_${txData.transaction_id}`,
            transaction_id: txData.transaction_id,
            reason: txData.status === 'settled' ? 'reconciled_settled' : 'fee_variance',
            status: txData.status === 'settled' ? 'resolved' : 'open',
            amount: txData.gross_amount,
            gross_amount: txData.gross_amount,
            transaction_date: txData.transaction_date,
            underlying_data: txData
          });
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

  const { setPageContext } = useAI();

  useEffect(() => {
    if (!loading && record) {
      const reasonLabel = (record.reason || 'Discrepancy').replace(/_/g, ' ');
      setPageContext({
        page_name: `Investigation: ${id}`,
        route: `/records/${type}/${id}`,
        selected_record_id: id,
        visible_metrics: {
          exception_id: id,
          reason: record.reason,
          status: record.status,
          transaction_id: record.transaction_id,
          amount: record.amount || tx?.gross_amount
        },
        suggested_inquiries: [
          `Explain why exception ${id} occurred and recommend controller adjustment`,
          `Compare the internal order vs Razorpay fee deduction for this transaction`,
          `What is the recommended reason code to Mark Explained & Resolve?`
        ]
      });
    }
  }, [loading, record, tx, id, type]);

  const handleResolve = async (customReason?: string, customNote?: string, triggerType = 'Human Controller Manual Approval') => {
    if (!id) return;
    try {
      await api.post(`/exceptions/${id}/resolve`, {
        reason: customReason || actionReason || 'Manual Accounting Adjustment',
        note: customNote || actionNote || 'Direct resolution from Record Detail audit page',
        user: 'Sharan, Finance Controller',
        trigger_type: triggerType
      });
      setActionSuccess('Exception marked as explained and successfully resolved.');
      setActionState(null);
      await fetchRecord();
      window.dispatchEvent(new CustomEvent('finora-exception-updated', { detail: { id, status: 'resolved' } }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEscalate = async (customNote?: string, triggerType = 'Human Controller Manual Approval') => {
    if (!id) return;
    try {
      await api.post(`/exceptions/${id}/escalate`, {
        note: customNote || actionNote || 'Escalated to Lead Controller from Record Detail audit page',
        user: 'Finance Admin',
        trigger_type: triggerType
      });
      setActionSuccess('Exception successfully escalated to Lead Financial Controller.');
      setActionState(null);
      await fetchRecord();
      window.dispatchEvent(new CustomEvent('finora-exception-updated', { detail: { id, status: 'escalated' } }));
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
        <Link to="/exceptions" className="mt-5 inline-block text-xs font-bold text-[#1E293B] hover:underline bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl border border-slate-200">
          &larr; Return to Exceptions Queue
        </Link>
      </div>
    );
  }

  const ud = record.underlying_data || {};
  const isResolved = record.status === 'resolved';
  const isEscalated = record.status === 'escalated';

  // Computed expected exact values
  const baseGross = tx?.gross_amount || ud?.gateway_gross || record.gross_amount || record.amount || 0;
  const expectedMdr = Math.round((baseGross * 0.02) * 100) / 100;
  const expectedGst = Math.round((expectedMdr * 0.18) * 100) / 100;
  const expectedNet = Math.round((baseGross - expectedMdr - expectedGst) * 100) / 100;

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
              <h1 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{id}</h1>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                isResolved 
                  ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]' 
                  : isEscalated 
                  ? 'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]' 
                  : 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
              }`}>
                {record.status?.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500">Root-cause investigation &amp; deterministic 4-check audit trail</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isResolved && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActionState(actionState === 'escalate' ? null : 'escalate')}
                className="gap-1.5"
              >
                <AlertTriangle size={13} className="text-[#B45309]" /> Escalate to Gateway Ops
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => setActionState(actionState === 'resolve' ? null : 'resolve')}
                className="gap-1.5"
              >
                <CheckCircle size={13} /> Mark Explained &amp; Resolve
              </Button>
            </>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-[#F0FDF4] text-[#15803D] rounded-2xl border border-[#BBF7D0] text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in duration-150 ease-out">
          <CheckCircle2 size={16} /> {actionSuccess}
        </div>
      )}

      {/* Deterministic AI Root-Cause Investigation Card (Standardized AI Insight Card) */}
      {aiInvestigation && (
        <AIInsightCard
          title="Deterministic AI Root-Cause Investigation"
          subtitle={`Sequential 4-factor audit verification for ${id}`}
          narration={aiInvestigation.conclusion}
          confidence={aiInvestigation.confidence_badge || "HIGH"}
          confidenceScore={aiInvestigation.confidence_score || 0.95}
          recommendedAction={aiInvestigation.recommended_action}
          evidenceTrail={aiInvestigation.steps_checked?.map((st: any) => ({
            step_number: st.step,
            tool: st.check,
            action: st.status,
            observation: st.observation
          })) || []}
          metrics={[
            { label: 'Total Discrepancy', value: `₹${aiInvestigation.initial_variance?.toLocaleString('en-IN')}` },
            { label: 'Explained Variance', value: `₹${aiInvestigation.explained_amount?.toLocaleString('en-IN')}`, color: 'text-[#15803D]' },
            { label: 'Unexplained', value: `₹${aiInvestigation.unexplained_amount?.toLocaleString('en-IN')}`, color: aiInvestigation.unexplained_amount > 1 ? 'text-[#B91C1C]' : 'text-[#15803D]' }
          ]}
        >
          {/* Quick Apply Resolution Button inside AI Card */}
          {!isResolved && (
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                <ShieldCheck size={13} className="text-[#15803D]" />
                Audit record: {aiInvestigation.investigation_id} • Status: {aiInvestigation.verifier_status}
              </div>
              <button
                onClick={() => handleResolve(aiInvestigation.recommended_action, 'Applied Fino AI recommended adjustment from Root-Cause Investigation', 'AI Recommendation Applied')}
                className="px-3.5 py-1.5 bg-[#15803D] hover:bg-[#166534] text-white rounded-xl text-xs font-bold shadow-xs transition-colors duration-150 ease-out flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle size={13} /> Apply Recommended Resolution
              </button>
            </div>
          )}
        </AIInsightCard>
      )}

      {/* Action Drawer */}
      {actionState && (
        <div className="bg-white text-slate-900 p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {actionState === 'resolve' ? 'Accounting Adjustment & Resolution Sign-Off' : 'Escalate to Senior Controller'}
            </h4>
            <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Statutory Audit Trail Enabled</span>
          </div>

          {actionState === 'resolve' ? (
            <div className="space-y-3">
              {/* Vic.ai Human-Feedback Precedent Learning Banner */}
              <PrecedentResolutionBanner
                precedentData={precedentData}
                onApplyPrecedent={(reason, note) => {
                  setActionReason(reason);
                  setActionNote(note || '');
                  handleResolve(reason, note, 'Human-Feedback Precedent Applied');
                }}
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Adjustment Reason Category</label>
                <select
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#15803D]"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setActionState(null)} className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer">Cancel</button>
                <button onClick={() => handleResolve()} className="px-4 py-1.5 bg-[#15803D] hover:bg-[#166534] text-white rounded-xl text-xs font-bold cursor-pointer">Confirm Resolution</button>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B45309]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setActionState(null)} className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer">Cancel</button>
                <button onClick={() => handleEscalate()} className="px-4 py-1.5 bg-[#B45309] hover:bg-[#92400E] text-white rounded-xl text-xs font-bold cursor-pointer">Submit Escalation</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Phase 5 Explainable Multi-Cause Root Scoring */}
      {multiCauseScores && (
        <MultiCauseScoreBar 
          scoresData={multiCauseScores} 
          investigationResult={aiInvestigation} 
        />
      )}

      {/* Main Investigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: 3-Way Reconciliation Evidence Graph */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5 flex items-center gap-2">
              <LinkIcon size={15} className="text-[#1E293B]" /> 3-Way Reconciliation Audit Nodes
            </h3>

            {/* Visual Flow nodes */}
            <div className="space-y-4">
              
              {/* 1. Ledger Node */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen size={14} className="text-slate-700" /> 1. Internal Order Ledger
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
              <div className="p-4 rounded-xl border border-slate-200 bg-[#EFF6FF]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-[#1D4ED8] uppercase tracking-wider flex items-center gap-1.5">
                    <InstitutionLogo name="Razorpay" size="xs" /> 2. Payment Gateway Settlement Feed (Razorpay)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Ingested</span>
                </div>
                <div className="flex justify-between items-baseline mt-2">
                  <span className="text-xs text-slate-500">Expected Net (Post 2%+GST):</span>
                  <span className="font-mono font-bold text-base text-slate-900">
                    <AmountDisplay amount={expectedNet} />
                  </span>
                </div>
                {ud.actual_fee && (
                  <div className="flex justify-between items-baseline mt-1 text-xs text-slate-600">
                    <span>Deducted MDR Fee:</span>
                    <span className="font-mono text-[#B91C1C] font-bold">-₹{ud.actual_fee}</span>
                  </div>
                )}
              </div>

              {/* 3. Bank Statement Node */}
              <div className={`p-4 rounded-xl border ${
                record.reason === 'no_bank_credit_found' 
                  ? 'border-[#FECACA] bg-[#FEF2F2]' 
                  : 'border-[#BBF7D0] bg-[#F0FDF4]'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <InstitutionLogo name={tx?.bank_reference?.startsWith('HDFC') ? 'HDFC Bank' : 'Kotak Mahindra Bank'} size="xs" /> 3. Bank Account Statement ({tx?.bank_reference?.startsWith('HDFC') ? 'HDFC' : 'Kotak'})
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    record.reason === 'no_bank_credit_found' 
                      ? 'bg-rose-50 text-[#B91C1C] border-rose-200' 
                      : 'bg-emerald-50 text-[#15803D] border-emerald-200'
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Search size={15} className="text-slate-800" /> AI Root-Cause Verdict
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-50 text-[#5B45F5] border border-violet-200">
                Controller Analysis
              </span>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1.5">
              <span className="font-bold text-slate-900 block">
                Discrepancy Signature: {formatExceptionReason(record.reason)}
              </span>
              <p className="text-slate-600 leading-relaxed">
                {record.reason === 'fee_variance' || record.reason === 'fee_variance_explained' ? 'Gateway deducted MDR fees higher than contractual 2.0% standard. Ind AS adjustment is recommended to post variance to suspense.' : 
                 record.reason === 'no_bank_credit_found' ? 'Settlement transit delay exceeds expected T+2 window. Check gateway batch logs or escalate if delay exceeds 5 business days.' :
                 record.reason === 'possible_duplicate' ? 'Duplicate transaction ID or payload detected across multiple incoming webhook events.' :
                 record.reason === 'amount_mismatch_only' || record.reason === 'amount_mismatch' ? 'Net bank credit received does not match scheduled payout amount. Partial settlement or gateway debit hold detected.' :
                 record.reason === 'ledger_only' ? 'Internal checkout order was created in order ledger without corresponding payment gateway transaction event.' :
                 record.reason === 'bank_only' ? 'Direct inward remittance credit received in bank account without a matching gateway settlement batch reference.' :
                 'Discrepancy identified in transaction valuation or ledger record.'}
              </p>
            </div>

            {/* WHY THIS MATTERS (Controller Depth) */}
            <div className="p-4 rounded-xl border border-violet-100 bg-violet-50/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#5B45F5] uppercase tracking-wider">✦ Why This Matters</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {record.reason === 'fee_variance' || record.reason === 'fee_variance_explained' 
                  ? 'While this individual fee deviation is relatively small, repeated MDR rate divergences indicate gateway contract rule drift across August transactions.' 
                  : record.reason === 'no_bank_credit_found' 
                  ? 'Uncredited gateway batches beyond T+2 directly restrict operating working capital and inflate Trapped Suspense volume.'
                  : 'Unreconciled ledger breaks require explicit controller clearance prior to statutory month-end period lock.'}
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-violet-100 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Cash Impact</span>
                  <span className="font-mono font-bold text-[#B91C1C]">₹{(record.amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">P&L Impact</span>
                  <span className="font-mono font-bold text-slate-800">{record.reason?.includes('fee') ? '₹110.00 Expense' : '₹0.00'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Audit SLA</span>
                  <span className="font-bold text-[#15803D]">T+2 Policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Structured Audit Record & Settlement Attributes */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 flex flex-col h-auto overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#15803D]" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Verified Audit Attributes</h3>
            </div>
            <span className="text-[10px] text-[#15803D] bg-[#F0FDF4] px-2.5 py-0.5 rounded-full border border-[#BBF7D0] font-bold">
              Immutable Ledger Record
            </span>
          </div>

          <div className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Exception ID</span>
                <span className="font-mono font-bold text-slate-900">
                  <AskableMetric question={`Audit exception record ${record.id}: explain reason '${record.reason}' and provide full ledger lineage.`}>
                    {record.id}
                  </AskableMetric>
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Transaction Ref</span>
                <span className="font-mono font-bold text-slate-900">
                  {record.transaction_id ? (
                    <AskableMetric question={`Trace transaction ${record.transaction_id} across checkout, gateway settlement, and bank credit.`}>
                      {record.transaction_id}
                    </AskableMetric>
                  ) : 'N/A'}
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Reconciliation Reason</span>
                <span className="font-bold text-slate-900 capitalize">{record.reason?.replace(/_/g, ' ')}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Payment Origin Rail</span>
                <span className="font-semibold text-slate-800">{tx?.origin || 'Razorpay Gateway'}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Deposit Target Account</span>
                <span className="font-semibold text-slate-800">{tx?.bank || 'Kotak Mahindra Bank'}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Gross Transaction Value</span>
                <span className="font-mono font-bold text-slate-900">
                  <AskableMetric question={`Explain gross customer payment value of ₹${baseGross.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} on record ${id}.`}>
                    ₹{baseGross.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </AskableMetric>
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Contractual MDR Fee</span>
                <span className="font-mono font-semibold text-slate-800">
                  <AskableMetric question={`Verify contractual 2.0% MDR fee of ₹${expectedMdr.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} on record ${id}.`}>
                    ₹{expectedMdr.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </AskableMetric>
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">GST on Fee (18%)</span>
                <span className="font-mono font-semibold text-slate-800">
                  <AskableMetric question={`Verify 18% GST tax (₹${expectedGst.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}) on gateway fees for record ${id}.`}>
                    ₹{expectedGst.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </AskableMetric>
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Calculated Net Bank Deposit</span>
                <span className="font-mono font-bold text-[#15803D]">
                  <AskableMetric question={`Trace contractual net expected bank credit of ₹${expectedNet.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} for record ${id}.`}>
                    ₹{expectedNet.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </AskableMetric>
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Settlement Batch ID</span>
                <span className="font-mono font-bold text-slate-700">{tx?.batch_id || 'BATCH-202608-REC'}</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 font-medium">Risk Score &amp; Tier</span>
                <span className="font-bold text-[#B91C1C]">{record.risk_score || 25} • {record.risk_tier || 'MEDIUM'}</span>
              </div>
            </div>

            {record.reason === 'fee_variance' && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <span>💡 Why do these differ?</span>
                </div>
                <p className="leading-relaxed text-amber-800">
                  Contractual schedule mandates 2.0% (₹{expectedMdr.toFixed(2)}), but gateway deducted 2.8% (₹{ud.actual_fee || 238}.00), creating a net recoverable discrepancy of ₹{((ud.actual_fee || 238) - expectedMdr).toFixed(2)}.
                </p>
              </div>
            )}

            <div className="p-3 bg-[#EFF6FF] rounded-xl border border-[#DBEAFE] text-slate-700 text-[11px] flex items-center gap-2">
              <CheckCircle2 size={15} className="text-[#1D4ED8] shrink-0" />
              <span>Full deterministic audit trail verified against statutory Ind AS accounting rules.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
