import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UploadCloud, Database, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiValidated, setApiValidated] = useState(false);

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const simulateApiValidation = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setApiValidated(true);
    }, 1000);
  };

  const handleRunReconciliation = () => {
    setLoading(true);
    // Simulate generation / reconciliation step
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-accent z-0 transition-all duration-300" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>
          
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className={`relative z-10 flex flex-col items-center justify-center w-8 h-8 rounded-full border-2 bg-white transition-colors duration-300 ${step >= num ? 'border-primary-accent text-primary-accent' : 'border-slate-300 text-slate-400'}`}>
              <span className="text-sm font-semibold">{num}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden min-h-[400px] flex flex-col relative">
        <div className="p-8 flex-1">
          {step === 1 && (
            <div className="text-center flex flex-col items-center justify-center h-full space-y-6">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-2">
                <ShieldCheck className="text-primary-accent" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Reconcile your payment, settlement, and bank records automatically</h2>
              <p className="text-slate-500 max-w-lg">Finora compares Razorpay settlements, bank credits, and your internal ledger to find every rupee and identify discrepancies instantly.</p>
            </div>
          )}

          {step === 2 && (
            <div className="h-full flex flex-col justify-center max-w-md mx-auto space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900">Connect Razorpay</h2>
                <p className="text-sm text-slate-500 mt-2">Enter your API credentials to fetch settlements.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Test API Key ID</label>
                  <input type="text" placeholder="rzp_test_..." className="w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 px-3 text-sm focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Test API Key Secret</label>
                  <input type="password" placeholder="••••••••••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 px-3 text-sm focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none" />
                </div>
                
                <div className="pt-2">
                  <Button variant="secondary" className="w-full flex justify-center py-2.5" onClick={simulateApiValidation} disabled={loading || apiValidated}>
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (apiValidated ? <><CheckCircle2 className="text-emerald-500 mr-2" size={18} /> Connected</> : 'Validate & Connect')}
                  </Button>
                </div>
                
                <p className="text-xs text-center text-slate-400 mt-4">
                  Note: Live mode requires production credentials. We use Test mode for this demo.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="h-full flex flex-col justify-center max-w-lg mx-auto space-y-6 text-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Upload Bank Statement</h2>
                <p className="text-sm text-slate-500 mt-2">Upload your bank statement CSV to match against settlements.</p>
              </div>
              
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-100 hover:border-primary-accent transition-colors cursor-pointer">
                <UploadCloud size={48} className="mb-4 text-slate-400" />
                <p className="font-medium text-slate-700">Click to upload or drag and drop</p>
                <p className="text-xs mt-1">CSV files only (max 10MB)</p>
              </div>
              
              <p className="text-xs text-amber-600 bg-amber-50 py-2 rounded-md border border-amber-100">
                Bank Account Aggregator coming soon
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="h-full flex flex-col justify-center max-w-lg mx-auto space-y-6 text-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Upload Internal Ledger</h2>
                <p className="text-sm text-slate-500 mt-2">Upload your internal order/ledger data to verify source of truth.</p>
              </div>
              
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-100 hover:border-primary-accent transition-colors cursor-pointer">
                <Database size={48} className="mb-4 text-slate-400" />
                <p className="font-medium text-slate-700">Click to upload or drag and drop</p>
                <p className="text-xs mt-1">CSV files only (max 10MB)</p>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="h-full flex flex-col justify-center space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900">Confirm & Run</h2>
                <p className="text-sm text-slate-500 mt-2">Ready to reconcile your data.</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                  <div className="text-xs text-slate-500 font-medium mb-1">Razorpay Settlements</div>
                  <div className="text-xl font-bold text-slate-900">Pending Sync</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                  <div className="text-xs text-slate-500 font-medium mb-1">Bank Statement</div>
                  <div className="text-xl font-bold text-slate-900">0 rows</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                  <div className="text-xs text-slate-500 font-medium mb-1">Internal Ledger</div>
                  <div className="text-xl font-bold text-slate-900">0 rows</div>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button variant="primary" className="w-full py-4 text-base" onClick={handleRunReconciliation} disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Normalizing & Matching Data...</span>
                  ) : (
                    "Run Reconciliation"
                  )}
                </Button>
                
                <Button variant="outline" className="w-full" onClick={handleRunReconciliation} disabled={loading}>
                  Generate Synthetic Demo Data (300 records)
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-border p-4 flex justify-between items-center">
          <Button variant="outline" onClick={handlePrev} disabled={step === 1 || loading}>
            Back
          </Button>
          
          {step < 5 ? (
            <Button variant="primary" onClick={handleNext} disabled={step === 2 && !apiValidated}>
              {step === 1 ? 'Get Started' : 'Next Step'} <ArrowRight size={16} className="ml-2" />
            </Button>
          ) : (
            <div /> // Spacer
          )}
        </div>
      </div>
    </div>
  );
}
