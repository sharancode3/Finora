import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { 
  CreditCard, 
  Link as LinkIcon, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Plus, 
  ChevronRight, 
  Lock, 
  KeyRound, 
  Building2, 
  Wallet, 
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowRight,
  Layers,
  X,
  Sparkles,
  Server
} from 'lucide-react';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { Button } from '../components/ui/Button';

export default function LinkedAccounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [crossRecon, setCrossRecon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  
  // Connect Account Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('payment_gateway');
  const [newApiKey, setNewApiKey] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAccountsData = async () => {
    try {
      const [acctRes, reconRes] = await Promise.all([
        api.get('/accounts/'),
        api.get('/accounts/cross-reconciliation?start_date=2026-08-01&end_date=2026-08-31').catch(() => ({ data: null }))
      ]);
      setAccounts(acctRes.data || []);
      setCrossRecon(reconRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountsData();
  }, []);

  const handleSyncNow = async (accountId: string) => {
    setSyncingId(accountId);
    try {
      await api.post(`/accounts/${accountId}/sync-now`);
      await fetchAccountsData();
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

  const staleAccounts = accounts.filter(a => a.sync_status === 'stale' || a.sync_status === 'degraded');

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-medium">Loading linked integrations and sync status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Linked Accounts & Bank Feeds</h1>
          <p className="text-slate-500 mt-1 text-sm">Continuous sync health monitoring, multi-account routing, and cross-account reconciliation.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} /> Connect Integration
        </button>
      </div>

      {/* Sync Health Warnings Banner */}
      {staleAccounts.length > 0 && (
        <div className="space-y-3">
          {staleAccounts.map(stale => (
            <div key={stale.account_id} className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{stale.name}</span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Sync Degraded</span>
                  </div>
                  <p className="text-slate-600 mt-1">
                    {stale.sync_message || `Last synced on ${stale.last_synced_at ? new Date(stale.last_synced_at).toLocaleString() : 'over 24 hours ago'}. Gateway credit verification may be delayed.`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleSyncNow(stale.account_id)}
                disabled={syncingId === stale.account_id}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw size={12} className={syncingId === stale.account_id ? 'animate-spin' : ''} />
                {syncingId === stale.account_id ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Cross-Account Reconciliation Flow View */}
      {crossRecon && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cross-Account Money Movement</h3>
                <p className="text-xs text-slate-500">Live inter-account settlement flows between payment gateways and corporate bank accounts.</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {crossRecon.summary?.connected_accounts_count || accounts.length} Linked Entities Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {crossRecon.inter_account_flows?.map((flow: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2">
                    <span>{flow.from_account}</span>
                    <ArrowRight size={12} className="text-slate-400" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 mb-1">{flow.to_account}</h4>
                  <span className="text-[10px] text-slate-500">{flow.cycle}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-baseline justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    flow.status === 'settled' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {flow.status === 'settled' ? 'Settled' : 'In Suspense'}
                  </span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    <AmountDisplay amount={flow.settled_amount} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Per-Account Contribution Bar */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Per-Account Contribution Share</span>
              <span className="text-slate-400 font-normal">Combined Volume: ₹{crossRecon.summary?.total_collected?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100 gap-0.5">
              {crossRecon.contributions?.map((c: any, i: number) => (
                <div 
                  key={c.account_id}
                  style={{ width: `${Math.max(15, c.share_percentage)}%` }}
                  className={`${i === 0 ? 'bg-indigo-600' : i === 1 ? 'bg-blue-500' : 'bg-purple-500'} h-full transition-all`}
                  title={`${c.account_name}: ${c.share_percentage}%`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-[11px] text-slate-600">
              {crossRecon.contributions?.map((c: any, i: number) => (
                <div key={c.account_id} className="flex items-center gap-1.5 font-medium">
                  <span className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-indigo-600' : i === 1 ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
                  <span>{c.account_name}: <strong className="font-mono">{c.share_percentage}%</strong> (₹{c.gross_volume?.toLocaleString('en-IN')})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Connected Integrations Grid */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Connected Integrations & Feeds</h3>
          <p className="text-xs text-slate-500">Live API and direct bank aggregator connectors.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {accounts.map(acct => {
            const isGateway = acct.type === 'payment_gateway';
            const isHealthy = acct.sync_status === 'healthy';

            return (
              <div key={acct.account_id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      isGateway ? 'bg-blue-600 text-white' : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      {isGateway ? <CreditCard size={20} /> : <Building2 size={20} />}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                        isHealthy ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'
                      }`}>
                        {isHealthy ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                        {isHealthy ? 'Healthy & Synced' : 'Sync Delayed'}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{acct.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {isGateway ? 'Payment gateway settlement feed & webhook listener' : 'Corporate bank account & Account Aggregator statement feed'}
                  </p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Identifier:</span>
                      <span className="font-mono text-slate-900">{acct.key_id || acct.account_number || acct.account_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Last Sync:</span>
                      <span className="text-slate-700 font-mono text-[11px]">
                        {acct.last_synced_at ? new Date(acct.last_synced_at).toLocaleString() : 'Just now'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Continuous 15m polling</span>
                  <button
                    onClick={() => handleSyncNow(acct.account_id)}
                    disabled={syncingId === acct.account_id}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
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
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="payment_gateway">Payment Gateway (Razorpay, Stripe, Cashfree)</option>
                  <option value="bank_feed">Direct Bank Feed (HDFC, ICICI, Axis, SBI)</option>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {newAccountType === 'payment_gateway' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Live API Key ID / Publishable Key</label>
                  <input
                    type="text"
                    placeholder="rzp_live_... or pk_live_..."
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Bank Account Number / IBAN</label>
                  <input
                    type="text"
                    placeholder="e.g. 50200084920192"
                    value={newAccountNumber}
                    onChange={(e) => setNewAccountNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
                <ShieldCheck size={16} className="text-indigo-600 shrink-0 mt-0.5" />
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
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white shadow-xs transition-colors"
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
