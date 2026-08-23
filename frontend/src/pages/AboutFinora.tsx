import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  Database, 
  TrendingUp, 
  Compass, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutFinora() {
  return (
    <div className="space-y-7 pb-20 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">
          <Sparkles size={14} className="text-indigo-600" />
          <span>System Architecture &amp; Vision</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">About Finora</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Autonomous multi-rail financial controller and audit intelligence for Razorpay merchants.
        </p>
      </div>

      {/* Core Mission Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-600" />
          Autonomous B2B Financial Controller
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Finora bridges the operational divide between high-volume payment processor feeds (Razorpay, PayPal), upstream corporate bank accounts (Kotak Mahindra Bank, HDFC Bank), and internal ERP order ledgers. Powered by an ACID SQLite transactional core, a 4-stage deterministic matching engine, and a local Gemma 3 AI orchestrator with mathematical citation verifiers, Finora automates settlement reconciliation, exception root-cause diagnosis, and month-end close workflows.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-xs font-bold text-slate-900">4-Stage Matching Engine</div>
            <p className="text-[11px] text-slate-500 mt-1">Exact UTR $\rightarrow$ Batched Net $\rightarrow$ Fuzzy Temporal $\rightarrow$ Exception Classifier.</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-xs font-bold text-slate-900">Grounded Citation Verifier</div>
            <p className="text-[11px] text-slate-500 mt-1">Every rupee figure is mathematically verified against raw SQLite database records.</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-xs font-bold text-slate-900">Forensic Integrity</div>
            <p className="text-[11px] text-slate-500 mt-1">Benford's Law distribution analysis &amp; unsupervised Isolation Forest anomaly flags.</p>
          </div>
        </div>
      </div>

      {/* 🌟 WHAT'S NEXT / FUTURE ROADMAP NOTE 🌟 */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 text-white rounded-xl">
              <Compass size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">What's Next &amp; Future Roadmap</h3>
              <p className="text-xs text-slate-300">Architectural expansion vectors beyond B2B merchant operations.</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 bg-white/10 text-white border border-white/20 rounded-full uppercase tracking-wider">
            Roadmap Note
          </span>
        </div>

        <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
          <p className="text-xs text-slate-200 leading-relaxed">
            The same account-linking and grounded-AI-explanation architecture built for business reconciliation is designed to extend naturally to a personal-finance view for individual users — spend tracking, EMI monitoring, and savings goals — as a future direction, while keeping the current submission strictly focused on business finance operations.
          </p>
        </div>

        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>Scope Status: B2B Merchant Finance (Locked &amp; Complete)</span>
          <Link to="/dashboard" className="text-indigo-300 hover:text-white font-bold inline-flex items-center gap-1">
            Back to Reconciliation Dashboard <ArrowRight size={14} />
          </Link>
        </div>
      </div>

    </div>
  );
}
