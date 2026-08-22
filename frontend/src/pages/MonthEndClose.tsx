import React from 'react';
import { CalendarDays, CheckCircle2, Circle, FileText, Lock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function MonthEndClose() {
  const steps = [
    { id: 1, title: 'Sync Data Sources', desc: 'Fetch latest data from all connected gateways and banks', status: 'complete' },
    { id: 2, title: 'Run Reconciliation', desc: 'Process automated matching rules across all ledgers', status: 'complete' },
    { id: 3, title: 'Resolve Exceptions', desc: 'Review and clear unmatched or anomalous records', status: 'pending' },
    { id: 4, title: 'Post Adjustments', desc: 'Generate journal entries for fees, taxes, and refunds', status: 'upcoming' },
    { id: 5, title: 'Lock Period', desc: 'Freeze data and generate final audit reports', status: 'upcoming' },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Month-End Close</h2>
          <p className="text-slate-500 mt-1 text-sm">Close your books faster with AI-assisted verification.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg text-primary-accent text-sm font-semibold">
          <CalendarDays size={18} />
          August 2026
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Progress */}
        <div className="md:col-span-2 bg-white rounded-xl border border-border shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Close Checklist</h3>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            
            {steps.map((step, idx) => (
              <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                
                {/* Icon */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                  step.status === 'complete' ? 'bg-emerald-500 text-white' : 
                  step.status === 'pending' ? 'bg-amber-400 text-white' : 
                  'bg-slate-100 text-slate-400'
                }`}>
                  {step.status === 'complete' ? <CheckCircle2 size={20} /> : step.status === 'pending' ? <AlertTriangle size={18} /> : <span className="text-sm font-bold">{step.id}</span>}
                </div>
                
                {/* Card */}
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border shadow-sm ${
                  step.status === 'pending' ? 'bg-amber-50 border-amber-200' : 'bg-white border-border'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-bold ${step.status === 'pending' ? 'text-amber-900' : 'text-slate-900'}`}>{step.title}</h4>
                  </div>
                  <p className={`text-sm ${step.status === 'pending' ? 'text-amber-800' : 'text-slate-500'}`}>{step.desc}</p>
                  
                  {step.status === 'pending' && (
                    <Button variant="primary" size="sm" className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-white border-none shadow-none">
                      Action Required: 12 Exceptions
                    </Button>
                  )}
                </div>
                
              </div>
            ))}
            
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm p-6 text-white">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-primary-accent">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Audit Report</h3>
            <p className="text-slate-400 text-sm mb-6">Generate a comprehensive summary of reconciliations, exceptions, and AI actions for external auditors.</p>
            <Button variant="primary" className="w-full justify-between group">
              Generate PDF <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Lock size={16} /> Readiness
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> Data Synced</span>
                <span className="font-semibold text-emerald-600">100%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> Matched Volume</span>
                <span className="font-semibold text-emerald-600">97.4%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><Circle size={16} className="text-amber-400"/> Exceptions Cleared</span>
                <span className="font-semibold text-amber-600">24 / 36</span>
              </div>
            </div>
            <Button variant="outline" className="w-full opacity-50 cursor-not-allowed" disabled>
              Lock August 2026
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
