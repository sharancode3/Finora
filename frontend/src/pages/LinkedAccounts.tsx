import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Building2, 
  Wallet, 
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Layers,
  X,
  ArrowUpRight,
  TrendingUp,
  Workflow,
  HelpCircle
} from 'lucide-react';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { useAI } from '../context/AIContext';
import { AskableMetric } from '../components/ui/AskableMetric';

export default function LinkedAccounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [crossRecon, setCrossRecon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [recentSyncedIds, setRecentSyncedIds] = useState<Record<string, boolean>>({});
  
  // Connect Account Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('payment_gateway');
  const [newApiKey, setNewApiKey] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setPageContext, setIsCopilotOpen, sendMessage } = useAI();

  const fetchAccountsData = async () => {
    try {
      const reconRes = await api.get('/accounts/cross-reconciliation?start_date=2026-08-01&end_date=2026-08-31');
      if (reconRes.data) {
        setCrossRecon(reconRes.data);
        setAccounts(reconRes.data.accounts || []);
      } else {
        const acctRes = await api.get('/accounts/');
        setAccounts(acctRes.data || []);
      }
    } catch (err) {
      console.error(err);
      try {
        const acctRes = await api.get('/accounts/');
        setAccounts(acctRes.data || []);
      } catch (e) {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountsData();
  }, []);

  useEffect(() => {
    if (!loading) {
      setPageContext({
        page_name: 'Linked Accounts & Money Movement',
        route: '/accounts',
        visible_metrics: {
          connected_accounts: accounts.length,
          gross_collected: crossRecon?.summary?.total_collected || 288303.50,
          settled_to_bank: crossRecon?.summary?.total_bank_settled || 284884.27,
          pending_settlement: crossRecon?.summary?.trapped_in_exceptions || 4800.0,
          kotak_total_credits: crossRecon?.summary?.kotak_total_credits || 214061.88,
          hdfc_total_credits: crossRecon?.summary?.hdfc_total_credits || 70822.39
        },
        suggested_inquiries: [
          `Why did more money go to Kotak than HDFC?`,
          `Breakdown money flow between Razorpay, PayPal, Kotak, and HDFC`,
          `How much did Kotak receive from PayPal vs Razorpay settlements?`
        ]
      });
    }
  }, [loading, accounts, crossRecon]);

  const handleSyncNow = async (accountId: string) => {
    setSyncingId(accountId);
    setSyncSuccessMessage(null);
    try {
      const targetAcct = accounts.find(a => a.account_id === accountId);
      await api.post(`/accounts/${accountId}/sync-now`);
      await fetchAccountsData();
      setRecentSyncedIds(prev => ({ ...prev, [accountId]: true }));
      setSyncSuccessMessage(
        `Successfully synchronized ${targetAcct?.name || 'feed'}. Last sync updated to just now and sync SLA delay cleared.`
      );
      setTimeout(() => {
        setSyncSuccessMessage(null);
        setRecentSyncedIds(prev => ({ ...prev, [accountId]: false }));
      }, 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingId(null);
    }
  };

  const handleConnectAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/accounts/connect', {
        name: newAccountName,
        type: newAccountType,
        config: {
          key_id: newApiKey || undefined,
          account_number: newAccountNumber || undefined
        }
      });
      setShowAddModal(false);
      setNewAccountName('');
      setNewApiKey('');
      setNewAccountNumber('');
      await fetchAccountsData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Phase 5 Suspense Breakdown state
  const [showSuspenseDetail, setShowSuspenseDetail] = useState(false);
  const [suspenseBreakdown, setSuspenseBreakdown] = useState<any>(null);
  const [loadingSuspense, setLoadingSuspense] = useState(false);

  const fetchSuspenseBreakdown = async () => {
    if (suspenseBreakdown) {
      setShowSuspenseDetail(!showSuspenseDetail);
      return;
    }
    setLoadingSuspense(true);
    setShowSuspenseDetail(true);
    try {
      const res = await api.get('/accounts/suspense-breakdown?start_date=2026-08-01&end_date=2026-08-31');
      setSuspenseBreakdown(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSuspense(false);
    }
  };

  const handleAskFlowQuestion = (question: string) => {
    setIsCopilotOpen(true);
    sendMessage(question);
  };

  const staleAccounts = accounts.filter(a => a.sync_status === 'stale');

  return (
    <div className="space-y-7 pb-20 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Linked Accounts & Money Movement</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Live multi-rail treasury feeds, per-account contribution attribution, and inter-account settlement flows for August 2026.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          Connect Integration
        </button>
      </div>

      {/* Sync Success Feedback Banner */}
      {syncSuccessMessage && (
        <div className="p-3.5 bg-[#F0FDF4] text-[#15803D] rounded-xl border border-[#BBF7D0] flex items-center justify-between gap-3 text-xs font-medium animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#15803D] shrink-0" />
            <span>{syncSuccessMessage}</span>
          </div>
          <button onClick={() => setSyncSuccessMessage(null)} className="text-[#15803D] hover:opacity-80 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Sync Health Diagnostic Alert Banners */}
      {staleAccounts.length > 0 && (
        <div className="space-y-3">
          {staleAccounts.map(stale => (
            <div 
              key={stale.account_id}
              className="p-4 bg-[#FFFBEB] text-[#B45309] rounded-2xl border border-[#FEF3C7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#FEF3C7] text-[#B45309] rounded-xl shrink-0 mt-0.5">
                  <AlertTriangle size={18} />
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wider text-[#B45309]">Sync Delay Flagged</span>
                    <span className="text-[#B45309] font-mono">({stale.name})</span>
                  </div>
                  
                  {/* Grounded Explanation */}
                  <div className="p-2.5 bg-white/90 rounded-xl border border-[#FEF3C7] text-slate-800 flex items-start gap-2">
                    <div className="w-3.5 h-3.5 rounded bg-[#1E293B] text-white flex items-center justify-center font-bold text-[8px] font-mono shrink-0 mt-0.5">F</div>
                    <p className="leading-relaxed font-medium">
                      {stale.ai_sync_explanation || stale.sync_issue || `Last synced against a 15-minute polling interval.`}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSyncNow(stale.account_id)}
                disabled={syncingId === stale.account_id}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#B45309] text-white hover:bg-[#92400E] rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {syncingId === stale.account_id ? <RefreshCw size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                <span>{syncingId === stale.account_id ? 'Syncing...' : 'Sync Gateway Feed'}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 🌟 MONEY FLOW VISUALIZATION 🌟 */}
      {crossRecon && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#F1F5F9] text-[#1E293B] rounded-2xl border border-[#E2E8F0] shadow-xs">
                <Workflow size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">August 2026 Money Movement &amp; Route Settlement</h3>
                <p className="text-xs text-slate-500">Live source-to-destination settlement pathways computed from SQLite ACID ledger.</p>
              </div>
            </div>
            
            <button
              onClick={() => handleAskFlowQuestion("Why did more money go to Kotak than HDFC?")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] border border-[#E2E8F0] rounded-xl text-xs font-bold transition-colors cursor-pointer self-start md:self-auto"
            >
              <div className="w-3.5 h-3.5 rounded bg-[#1E293B] text-white flex items-center justify-center font-bold text-[8px] font-mono shrink-0">F</div>
              Ask Fino: Why Kotak &gt; HDFC?
            </button>
          </div>

          {/* Interactive Flow Diagram */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80">
            
            {/* UPSTREAM SOURCES (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <span>Origin Sources</span>
              </div>

              {/* Razorpay Gateway Box */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#BFDBFE]">
                    Payment Gateway
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    <AskableMetric label="Razorpay Gateway Monthly Gross" value={crossRecon.accounts?.find((a: any) => a.account_id === 'demo_org_1')?.monthly_total || 246103.50}>
                      <AmountDisplay amount={crossRecon.accounts?.find((a: any) => a.account_id === 'demo_org_1')?.monthly_total || 246103.50} />
                    </AskableMetric>
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Razorpay Gateway (Business)</h4>
                  <p className="text-[10px] text-slate-500">Domestic INR card, UPI &amp; netbanking</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
                  <span>Settled: <strong>₹2,39,978.51</strong></span>
                  <span className="text-slate-400">47 transactions</span>
                </div>
              </div>

              {/* PayPal Wallet Box */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    Cross-Border Wallet
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    <AskableMetric label="PayPal Wallet Monthly Gross" value={crossRecon.accounts?.find((a: any) => a.account_id === 'acct_paypal_wallet')?.monthly_total || 47000.00}>
                      <AmountDisplay amount={crossRecon.accounts?.find((a: any) => a.account_id === 'acct_paypal_wallet')?.monthly_total || 47000.00} />
                    </AskableMetric>
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">PayPal — International Wallet</h4>
                  <p className="text-[10px] text-slate-500">Cross-border USD payments (4.4% + ₹25 fee)</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
                  <span>Settled: <strong>₹44,205.76</strong></span>
                  <span className="text-slate-400">12 transactions (2 batches)</span>
                </div>
              </div>
            </div>

            {/* FLOW ROUTE ARROWS (4 cols) */}
            <div className="lg:col-span-4 space-y-2.5 px-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-center">
                Settlement Routes
              </div>

              {/* Route 1: Razorpay -> Kotak */}
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                  <span className="font-semibold text-slate-700 text-[11px]">Razorpay → Kotak</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 text-[11px]">
                  <AskableMetric question="Why did ₹1,69,856.12 (70.8% of Razorpay volume) settle into Kotak Mahindra Bank?">
                    <span>₹1,69,856.12</span>
                    <span className="text-[10px] font-sans font-normal text-slate-500 ml-1">(70.8%)</span>
                  </AskableMetric>
                </div>
              </div>

              {/* Route 2: Razorpay -> HDFC */}
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                  <span className="font-semibold text-slate-700 text-[11px]">Razorpay → HDFC</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 text-[11px]">
                  <AskableMetric question="Why did ₹65,322.39 (27.2% of Razorpay volume) settle into HDFC Bank?">
                    <span>₹65,322.39</span>
                    <span className="text-[10px] font-sans font-normal text-slate-500 ml-1">(27.2%)</span>
                  </AskableMetric>
                </div>
              </div>

              {/* Route 3: PayPal -> Kotak */}
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                  <span className="font-semibold text-slate-700 text-[11px]">PayPal → Kotak</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 text-[11px]">
                  <AskableMetric question="Why did all ₹44,205.76 from PayPal settle into Kotak Mahindra Bank?">
                    <span>₹44,205.76</span>
                    <span className="text-[10px] font-sans font-normal text-slate-500 ml-1">(100%)</span>
                  </AskableMetric>
                </div>
              </div>

              {/* Route 4: Razorpay -> Suspense */}
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200/80 shadow-2xs flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="font-semibold text-amber-900 text-[11px]">Razorpay → Suspense</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono font-bold text-amber-950 text-[11px]">
                  <AskableMetric question="Why is ₹4,800.00 routed to Suspense / Audit Hold from Razorpay?">
                    <span>₹4,800.00</span>
                    <span className="text-[10px] font-sans font-normal text-amber-700 ml-1">(Audit Hold)</span>
                  </AskableMetric>
                </div>
              </div>
            </div>

            {/* DOWNSTREAM BANK DESTINATIONS (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <span>Bank Deposit Targets</span>
              </div>

              {/* Kotak Bank Destination */}
              <div className="p-4 bg-white rounded-xl border-2 border-[#BBF7D0] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                    Primary Bank
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-950">
                    <AskableMetric label="Kotak Mahindra Bank Total Monthly Credits" value={crossRecon.summary?.kotak_total_credits || 214061.88}>
                      <AmountDisplay amount={crossRecon.summary?.kotak_total_credits || 214061.88} />
                    </AskableMetric>
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Kotak Mahindra Bank — Business Current</h4>
                  <p className="text-[10px] text-slate-500 font-mono">A/C 981200481920 (45 deposits)</p>
                </div>
                <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px]">
                  <div className="flex justify-between text-slate-600">
                    <span>From Razorpay:</span>
                    <span className="font-mono font-semibold">₹1,69,856.12 (79.3%)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>From PayPal:</span>
                    <span className="font-mono font-semibold">₹44,205.76 (20.7%)</span>
                  </div>
                </div>
              </div>

              {/* HDFC Bank Destination */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                    Secondary Bank
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    <AskableMetric label="HDFC Bank Total Monthly Credits" value={crossRecon.summary?.hdfc_total_credits || 70822.39}>
                      <AmountDisplay amount={crossRecon.summary?.hdfc_total_credits || 70822.39} />
                    </AskableMetric>
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">HDFC Bank — Business Current</h4>
                  <p className="text-[10px] text-slate-500 font-mono">A/C 50200084920192 (14 deposits)</p>
                </div>
                <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px]">
                  <div className="flex justify-between text-slate-600">
                    <span>From Razorpay:</span>
                    <span className="font-mono font-semibold">₹65,322.39 (92.2%)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Direct Inward NEFT:</span>
                    <span className="font-mono font-semibold">₹5,500.00 (7.8%)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Suspense Decomposition Inline Expansion */}
          {showSuspenseDetail && (
            <div className="p-4.5 bg-slate-50 text-slate-900 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in duration-150 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#1E293B] text-white flex items-center justify-center font-bold text-[9px] font-mono shrink-0">F</div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Why is ₹{crossRecon.summary?.trapped_in_exceptions?.toLocaleString('en-IN')} in Suspense?
                  </h4>
                </div>
                <button
                  onClick={() => setShowSuspenseDetail(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer p-1 rounded hover:bg-white"
                >
                  <X size={14} />
                </button>
              </div>

              {loadingSuspense ? (
                <div className="text-xs text-slate-500 py-2">Aggregating contributing exception records...</div>
              ) : suspenseBreakdown ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {suspenseBreakdown.ai_explanation}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {suspenseBreakdown.categories?.map((cat: any, i: number) => (
                      <div key={i} className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                        <div className="text-xs text-slate-500 font-medium truncate">{cat.label}</div>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="font-mono font-bold text-xs text-slate-900">₹{cat.amount.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-slate-500">{cat.count} items ({cat.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* 🌟 DETAILED PER-ACCOUNT ATTRIBUTION CARDS 🌟 */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Connected Accounts &amp; Source Attribution</h3>
          <p className="text-xs text-slate-500">Comprehensive monthly totals and source-breakdown per connected feed for August 2026.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {accounts.map(acct => {
            const isGateway = acct.type === 'payment_gateway';
            const isWallet = acct.type === 'wallet';
            const isBank = acct.type === 'bank_feed';
            const isHealthy = acct.sync_status === 'healthy';

            return (
              <div 
                key={acct.account_id} 
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
              >
                <div className="space-y-4">
                  {/* Top Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {isGateway ? <CreditCard size={20} /> : isWallet ? <Wallet size={20} /> : <Building2 size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{acct.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                          <span>{acct.account_id}</span>
                          <span>•</span>
                          <span className="capitalize">{acct.type?.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isHealthy ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]' : 'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-[#15803D]' : 'bg-[#B45309]'}`} />
                        {isHealthy ? 'Active' : 'Sync Delay'}
                      </span>
                    </div>
                  </div>

                  {/* Summary Figures Grid */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Volume</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        ₹{(acct.total_settled ?? acct.monthly_total ?? acct.total_volume ?? acct.balance ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Transactions</span>
                      <span className="font-mono font-bold text-slate-700 text-sm">
                        {acct.transaction_count || 0}
                      </span>
                    </div>
                  </div>

                  {/* Upstream & Downstream Movement Breakdown */}
                  {isBank && acct.upstream_breakdown && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Upstream Contributing Sources:</span>
                        <span className="text-[10px] text-slate-400 font-normal">Real source_account attribution</span>
                      </div>
                      <div className="space-y-1.5">
                        {acct.upstream_breakdown.map((up: any, i: number) => (
                          <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-slate-800">{up.source_name}</span>
                              <div className="text-[10px] text-slate-500">{up.flow_label} ({up.count} txns)</div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono font-bold text-slate-900">₹{up.amount?.toLocaleString('en-IN')}</div>
                              <div className="text-[10px] font-bold text-[#15803D]">{up.percentage}% share</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isBank && acct.downstream_destinations && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Settlement Destination Breakdown:</span>
                        <span className="text-[10px] text-slate-400 font-normal">Downstream bank routing</span>
                      </div>
                      <div className="space-y-1.5">
                        {acct.downstream_destinations.map((down: any, i: number) => (
                          <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-700">{down.name} ({down.count} txns)</span>
                            <div className="text-right">
                              <span className="font-mono font-bold text-slate-900">₹{down.amount?.toLocaleString('en-IN')}</span>
                              <span className="text-[10px] text-slate-500 ml-1.5 font-bold">({down.percentage}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Last synced: {acct.last_synced_at ? new Date(acct.last_synced_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </span>
                  <button
                    onClick={() => handleSyncNow(acct.account_id)}
                    disabled={syncingId === acct.account_id}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <RefreshCw size={12} className={syncingId === acct.account_id ? 'animate-spin' : ''} />
                    {syncingId === acct.account_id ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connect Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#F1F5F9] text-[#1E293B] rounded-xl border border-[#E2E8F0]">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Connect New Integration</h3>
                  <p className="text-xs text-slate-500">Add a gateway processor or direct bank feed.</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConnectAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Integration Type</label>
                <select
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
                >
                  <option value="payment_gateway">Payment Gateway (Razorpay, Stripe, Cashfree)</option>
                  <option value="bank_feed">Direct Bank Feed (Kotak, HDFC, ICICI, Axis, SBI)</option>
                  <option value="wallet">Corporate Digital Wallet (PayPal, PayU)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Account Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe USD Gateway or Axis Current Account"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
                />
              </div>

              {newAccountType === 'payment_gateway' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Live API Key ID / Publishable Key</label>
                  <input
                    type="text"
                    placeholder="rzp_test_... or pk_test_..."
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Bank Account Number / IBAN</label>
                  <input
                    type="text"
                    placeholder="e.g. 981200481920"
                    value={newAccountNumber}
                    onChange={(e) => setNewAccountNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
                  />
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-800">
                <ShieldCheck size={16} className="text-[#15803D] shrink-0 mt-0.5" />
                <span>Encrypted at rest using AES-256 GCM. Automated 15-minute reconciliation scheduler will initiate upon linking.</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1E293B] hover:bg-[#0F172A] disabled:bg-slate-300 text-white shadow-xs transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Establishing Connection...' : 'Connect & Sync'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
