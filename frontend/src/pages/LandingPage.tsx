import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CreditCard, Building2, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Crisp White Top Header */}
      <header className="w-full bg-white text-slate-900 px-8 py-3.5 flex items-center justify-between border-b border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-base shadow-xs">
            F
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 leading-none">Finora</span>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">AI Financial Controller</span>
          </div>
        </div>
        
        <Link 
          to="/dashboard"
          className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>Open Dashboard</span>
          <ArrowRight size={14} />
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-5xl px-6 py-16 mx-auto flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs mb-6 border border-indigo-200/80 shadow-xs">
          <ShieldCheck size={16} className="text-indigo-600" />
          <span>Automated 3-Way Financial Reconciliation</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight max-w-3xl leading-tight">
          Where did your money actually go?
        </h1>
        
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
          Finora continuously matches money collected by Razorpay against your internal sales ledger and confirms it settled into your bank account. If an amount is missing or fees don't match, we explain why.
        </p>

        {/* 3-Way Reconciliation Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-14 text-left">
          
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-7 flex flex-col justify-between hover:border-indigo-300 hover:shadow-sm transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 border border-indigo-100">
                <BookOpen size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Step 1
              </span>
              <h3 className="font-bold text-base text-slate-900 mt-2 mb-1.5">1. Your Internal Books</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sales orders, invoices, and cart checkouts representing expected customer revenue.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 size={14} /> Expected Gross Revenue
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-7 flex flex-col justify-between hover:border-blue-300 hover:shadow-sm transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 border border-blue-100">
                <CreditCard size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                Step 2
              </span>
              <h3 className="font-bold text-base text-slate-900 mt-2 mb-1.5">2. Payment Gateway</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Razorpay gateway feeds detailing gross transactions, fee rates (2%), and 18% GST deductions.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-blue-700">
              <CheckCircle2 size={14} /> Fee Deductions Verified
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-7 flex flex-col justify-between hover:border-emerald-300 hover:shadow-sm transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100">
                <Building2 size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Step 3
              </span>
              <h3 className="font-bold text-base text-slate-900 mt-2 mb-1.5">3. Bank Statement</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Actual net cash deposited into your Kotak/HDFC account via UTR settlement batches.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 size={14} /> Settled Net Cash
            </div>
          </div>

        </div>

        {/* High-Contrast Call to Action Card */}
        <div className="bg-white rounded-2xl w-full p-8 md:p-10 text-slate-900 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-indigo-200">
          <div className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-600" />
              <h2 className="text-2xl font-black text-slate-900">Ready to audit your ledger?</h2>
            </div>
            <p className="text-slate-600 text-sm font-medium">Discover fee variances, trapped exceptions, and delayed settlements in real time.</p>
          </div>
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span>Proceed to Dashboard</span>
            <ArrowRight size={18} />
          </Link>
        </div>

      </main>
      
      <footer className="w-full py-6 text-center text-slate-400 text-xs border-t border-slate-200">
        &copy; 2026 Finora Inc. • Built for Razorpay Buildathon • Ind AS Compliant
      </footer>
    </div>
  );
}
