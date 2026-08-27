import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, AlertTriangle, ShieldCheck, 
  ArrowRight, X, Play, Loader2, RefreshCw, Layers, Database,
  FileCheck, Shield, ChevronRight, BarChart3
} from 'lucide-react';
import { api } from '../api/client';
import { useAI } from '../context/AIContext';

interface ScopeOption {
  id: string;
  label: string;
  period: string;
  record_count: number;
  gross_volume: number;
  is_active: boolean;
  description: string;
}

export interface ReconciliationRunModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onCompleted?: () => void;
  initialScope?: string;
}

export function ReconciliationRunModal(props?: ReconciliationRunModalProps) {
  const { 
    isReconciliationModalOpen: ctxOpen, 
    setIsReconciliationModalOpen: setCtxOpen,
    reconciliationTargetScope,
    setReconciliationTargetScope 
  } = useAI();
  const navigate = useNavigate();

  const isOpen = props?.isOpen !== undefined ? props.isOpen : ctxOpen;
  const handleClose = () => {
    if (props?.onClose) props.onClose();
    else setCtxOpen(false);
  };

  const [scopes, setScopes] = useState<ScopeOption[]>([]);
  const [selectedScope, setSelectedScope] = useState<string>("2026-08");
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [accounts, setAccounts] = useState<any[]>([]);

  // Execution States: 'config' | 'running' | 'completed'
  const [executionState, setExecutionState] = useState<'config' | 'running' | 'completed'>('config');
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [resultData, setResultData] = useState<any>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedScope(props?.initialScope || reconciliationTargetScope || "2026-08");
      setExecutionState('config');
      setProgressPct(0);
      setCurrentStageIndex(0);
      setResultData(null);
      setConsoleLogs([]);
      
      // Load scopes and accounts
      api.get('/reconciliation/scopes').then((res: any) => setScopes(res.data)).catch(console.error);
      api.get('/accounts/').then((res: any) => setAccounts(res.data)).catch(console.error);
    }
  }, [isOpen, props?.initialScope, reconciliationTargetScope]);

  if (!isOpen) return null;

  const handleStartRun = async () => {
    setExecutionState('running');
    setProgressPct(5);
    setCurrentStageIndex(0);
    setConsoleLogs([
      `[INIT] Initializing Finora 3-Way Reconciliation Engine for scope '${selectedScope}'...`,
      `[CONFIG] Account filter: ${selectedAccount === 'all' ? 'All Active Rails (Razorpay + Kotak + HDFC + PayPal)' : selectedAccount}`
    ]);

    try {
      // 1. Fetch real grounded pipeline computation from backend
      const res = await api.post('/reconciliation/run', {
        scope: selectedScope,
        account_id: selectedAccount,
        user: "Sharan, Finance Controller"
      });
      const data = res.data;
      setResultData(data);

      // 2. Animate sequential stages so the user sees the real demo moment
      const stages = data.stages || [];
      const stageDelay = 650; // ms per stage

      for (let i = 0; i < stages.length; i++) {
        await new Promise(r => setTimeout(r, stageDelay));
        setCurrentStageIndex(i + 1);
        const newPct = Math.min(100, Math.round(((i + 1) / stages.length) * 100));
        setProgressPct(newPct);

        const s = stages[i];
        const logTime = new Date().toLocaleTimeString('en-US', { hour12: false });
        setConsoleLogs(prev => [
          ...prev,
          `[${logTime}] STAGE ${s.stage_number} COMPLETE: ${s.title} -> ${s.output_metric} (${s.output_value || 'Done'})`
        ]);
      }

      await new Promise(r => setTimeout(r, 400));
      setExecutionState('completed');
      
      // Broadcast state change across app so live counters update instantly
      window.dispatchEvent(new CustomEvent('finora-exception-updated', {
        detail: { scope: selectedScope, matchRate: data.value_match_rate }
      }));
      window.dispatchEvent(new CustomEvent('finora-audit-log-updated'));
    } catch (err) {
      console.error(err);
      setConsoleLogs(prev => [...prev, `[ERROR] Reconciliation run failed: ${String(err)}`]);
      setExecutionState('config');
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-7 py-5 border-b border-[#E4E4E7] flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs font-mono shrink-0 shadow-xs">
              F
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Run Automated 3-Way Reconciliation</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
                  Deterministic Pipeline
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Executes multi-tier UTR matching, batch aggregation, fuzzy resolution, and statistical anomaly scanning.
              </p>
            </div>
          </div>

          <button 
            onClick={handleClose} 
            disabled={executionState === 'running'}
            className={`p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors ${executionState === 'running' ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-7 space-y-6">
          
          {/* ============================================================ */}
          {/* STEP 1: CONFIGURATION */}
          {/* ============================================================ */}
          {executionState === 'config' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Select Reconciliation Scope Batch
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {scopes.map(s => {
                    const isSelected = selectedScope === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedScope(s.id)}
                        className={`p-4 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                          isSelected 
                            ? 'border-[#1E293B] bg-slate-50 ring-2 ring-[#1E293B] shadow-xs' 
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900">{s.label}</span>
                              {s.is_active && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">Active</span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">{s.period}</span>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#1E293B] bg-[#1E293B] text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700">{s.record_count} transactions</span>
                          <span className="font-bold font-mono text-slate-900">₹{(s.gross_volume / 1000).toFixed(1)}k Gross</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Account Scope Filter */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Integration Channels</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Filter by specific linked payment gateway or bank current account.</p>
                </div>
                <select
                  value={selectedAccount}
                  onChange={e => setSelectedAccount(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#1E293B] cursor-pointer"
                >
                  <option value="all">All Linked Accounts (Combined Rails)</option>
                  {accounts.map(a => (
                    <option key={a.account_id} value={a.account_id}>{a.name}</option>
                  ))}
                </select>
              </div>

              {/* 5 Deterministic Verification Pillars Callout */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Shield size={14} className="text-[#1E293B]" />
                  <span>Deterministic 7-Stage Pipeline Architecture</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                    <span className="font-bold text-slate-900 block">1. 1:1 UTR Check</span>
                    Exact reference match
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                    <span className="font-bold text-slate-900 block">2. Batch Subset</span>
                    Multi-order grouping
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                    <span className="font-bold text-slate-900 block">3. Fuzzy Window</span>
                    ±2 day transit drift
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                    <span className="font-bold text-slate-900 block">4. Forensic MAD</span>
                    Benford &amp; ML outliers
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: RUNNING SEQUENTIAL PIPELINE */}
          {/* ============================================================ */}
          {executionState === 'running' && resultData && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Progress Header */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Loader2 size={18} className="text-[#1E293B] animate-spin" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Executing Reconciliation Pipeline...
                      </h3>
                      <p className="text-xs text-slate-500">
                        Processing {resultData.total_records} records for {resultData.scope_title}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold font-mono text-[#1E293B]">
                    {progressPct}%
                  </span>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#1E293B] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* 7 Pipeline Stages List */}
              <div className="space-y-2.5">
                {resultData.stages.map((stage: any, idx: number) => {
                  const isDone = currentStageIndex > idx;
                  const isCurrent = currentStageIndex === idx;
                  
                  return (
                    <div 
                      key={stage.stage_id}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                        isDone 
                          ? 'bg-[#F0FDF4]/50 border-[#BBF7D0]' 
                          : isCurrent 
                            ? 'bg-[#F1F5F9] border-[#E2E8F0] shadow-xs' 
                            : 'bg-slate-50/50 border-slate-200/60 opacity-40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isDone 
                            ? 'bg-[#15803D] text-white' 
                            : isCurrent 
                              ? 'bg-[#1E293B] text-white' 
                              : 'bg-slate-200 text-slate-500'
                        }`}>
                          {isDone ? <CheckCircle2 size={16} /> : isCurrent ? <Loader2 size={14} className="animate-spin" /> : stage.stage_number}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{stage.title}</span>
                            {isDone && (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
                                {stage.trust_badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{stage.details}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {isDone ? (
                          <div>
                            <span className="text-xs font-bold font-mono text-slate-900 block">{stage.output_metric}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{stage.output_value}</span>
                          </div>
                        ) : isCurrent ? (
                          <span className="text-xs font-bold text-[#1E293B] flex items-center gap-1">
                            <span>Processing</span>
                            <span className="inline-block animate-pulse">...</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Pending</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Terminal Log Stream */}
              <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] space-y-1 max-h-36 overflow-y-auto shadow-inner">
                <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1 font-bold">Engine Execution Telemetry Log</div>
                {consoleLogs.map((log, lIdx) => (
                  <div key={lIdx} className="leading-relaxed opacity-90">{log}</div>
                ))}
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: COMPLETED OUTCOME OVERVIEW */}
          {/* ============================================================ */}
          {executionState === 'completed' && resultData && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Success Banner */}
              <div className="bg-[#F0FDF4] p-5 rounded-2xl border border-[#BBF7D0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-[#15803D] text-white rounded-2xl shadow-xs">
                    <FileCheck size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950">
                      Reconciliation Run Certified &amp; Completed
                    </h3>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Batch for {resultData.scope_title} successfully processed. Audit trail entry permanently stored in SQLite ledger.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold px-3 py-1 bg-white text-[#15803D] rounded-xl border border-[#BBF7D0] self-start sm:self-auto shadow-2xs">
                  {resultData.executed_at}
                </span>
              </div>

              {/* 4 Outcome Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Value Match Rate</span>
                  <div className="text-2xl font-bold font-mono text-[#15803D] my-1">
                    {resultData.value_match_rate}%
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Count rate: {resultData.count_match_rate}%</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Gross Processed</span>
                  <div className="text-2xl font-bold font-mono text-slate-900 my-1">
                    ₹{resultData.gross_processed?.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{resultData.total_records} transactions</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Net Settled Cash</span>
                  <div className="text-2xl font-bold font-mono text-[#15803D] my-1">
                    ₹{resultData.net_settled?.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium">Bank credited</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between border-l-4 border-l-[#B91C1C]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Exceptions Trapped</span>
                  <div className="text-2xl font-bold font-mono text-[#B91C1C] my-1">
                    {resultData.exceptions_count} items
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">₹{resultData.exceptions_unresolved_value?.toLocaleString('en-IN')}</span>
                </div>

              </div>

              {/* Match Tier Breakdown Bar */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Deterministic Match Tier Breakdown</span>
                  <span className="text-slate-500 font-mono">{resultData.total_records} Total Processed</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">1:1 Exact Matches</span>
                    <div className="text-base font-bold font-mono text-slate-900 mt-1">
                      {resultData.exact_matches_count} records
                    </div>
                    <span className="text-[11px] text-[#15803D] font-bold font-mono">₹{resultData.exact_matches_amount?.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Batched Matches</span>
                    <div className="text-base font-bold font-mono text-slate-900 mt-1">
                      {resultData.batched_matches_count} records
                    </div>
                    <span className="text-[11px] text-[#1E293B] font-bold font-mono">₹{resultData.batched_matches_amount?.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Fuzzy Matches</span>
                    <div className="text-base font-bold font-mono text-slate-900 mt-1">
                      {resultData.fuzzy_matches_count} records
                    </div>
                    <span className="text-[11px] text-[#B45309] font-bold font-mono">₹{resultData.fuzzy_matches_amount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Action Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => {
                    handleClose();
                    navigate('/exceptions');
                  }}
                  className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
                >
                  <span>Review Exceptions Queue</span>
                  <ArrowRight size={14} className="text-[#B91C1C]" />
                </button>

                <button
                  onClick={() => {
                    handleClose();
                    navigate('/dashboard');
                  }}
                  className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
                >
                  <span>Open Executive Dashboard</span>
                  <ArrowRight size={14} className="text-[#1E293B]" />
                </button>

                <button
                  onClick={() => {
                    handleClose();
                    navigate('/settings');
                  }}
                  className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
                >
                  <span>Inspect Audit Trail Log</span>
                  <ArrowRight size={14} className="text-[#15803D]" />
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-7 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-medium">
            {executionState === 'config' && "Deterministic Execution • Ind AS–aligned audit standard"}
            {executionState === 'running' && "Evaluating deterministic rules & statistical distribution..."}
            {executionState === 'completed' && "Reconciliation run logged in immutable audit history"}
          </div>

          <div className="flex items-center gap-3">
            {executionState === 'config' && (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartRun}
                  className="px-5 py-2.5 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-98"
                >
                  <Play size={14} fill="currentColor" />
                  <span>Start Reconciliation Run</span>
                </button>
              </>
            )}

            {executionState === 'completed' && (
              <>
                <button
                  onClick={() => setExecutionState('config')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Run Another Batch</span>
                </button>
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
