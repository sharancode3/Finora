import React, { useState } from 'react';
import { Database, Plus, RefreshCw, Server, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function DataSources() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('Today at 10:45 AM');

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync('Just now');
    }, 2000);
  };

  const sources = [
    {
      id: 'rzp_1',
      name: 'Razorpay',
      type: 'Payment Gateway',
      status: 'connected',
      lastSync,
      icon: <Server size={24} className="text-primary-accent" />
    },
    {
      id: 'csv_bank_1',
      name: 'HDFC Bank Statement',
      type: 'Bank Feed (CSV)',
      status: 'connected',
      lastSync,
      icon: <Database size={24} className="text-emerald-500" />
    },
    {
      id: 'csv_ledger_1',
      name: 'Internal ERP Ledger',
      type: 'Ledger (CSV)',
      status: 'connected',
      lastSync,
      icon: <Database size={24} className="text-indigo-500" />
    },
    {
      id: 'stripe_1',
      name: 'Stripe',
      type: 'Payment Gateway',
      status: 'disconnected',
      lastSync: 'Never',
      icon: <Server size={24} className="text-slate-400" />
    },
    {
      id: 'cashfree_1',
      name: 'Cashfree',
      type: 'Payment Gateway',
      status: 'disconnected',
      lastSync: 'Never',
      icon: <Server size={24} className="text-slate-400" />
    }
  ];

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Data Sources</h2>
          <p className="text-slate-500 mt-1 text-sm">Manage connections to your payment gateways, banks, and ERPs.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSync} disabled={syncing}>
            <RefreshCw size={16} className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync All'}
          </Button>
          <Button variant="primary">
            <Plus size={16} className="mr-2" /> Add Data Source
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map(source => (
          <div key={source.id} className="bg-white rounded-xl border border-border shadow-sm p-6 flex flex-col hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                {source.icon}
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-slate-50">
                {source.status === 'connected' ? (
                  <><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> <span className="text-emerald-700">Connected</span></>
                ) : (
                  <><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> <span className="text-slate-500">Disconnected</span></>
                )}
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900">{source.name}</h3>
            <p className="text-sm text-slate-500 mb-6">{source.type}</p>
            
            <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
              <div className="text-[11px] text-slate-400 flex flex-col">
                <span className="font-semibold uppercase tracking-wider mb-0.5">Last Sync</span>
                <span>{source.lastSync}</span>
              </div>
              
              <Button variant="outline" size="sm" className="text-xs">
                {source.status === 'connected' ? 'Configure' : 'Connect'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-4">
        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-amber-900 mb-1">Bank API Integrations</h4>
          <p className="text-sm text-amber-800">Direct connections to HDFC, ICICI, and Axis Bank via Account Aggregator are currently in private beta. Please contact support to request early access.</p>
        </div>
      </div>
    </div>
  );
}
