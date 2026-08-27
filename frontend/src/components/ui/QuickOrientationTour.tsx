import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, X, Play, MessageSquare, ShieldCheck } from 'lucide-react';

interface TourStep {
  id: number;
  title: string;
  badge: string;
  description: string;
  actionHint: string;
  icon: any;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: 'Daily AI Controller Briefing',
    badge: '1 of 3 • Start Here',
    description: 'Your 60-second executive summary synthesizing gross processed volume (₹2,39,978.51), settled bank cash, and active exceptions.',
    actionHint: 'Review key variance drivers & timing float at a glance on the Dashboard.',
    icon: ShieldCheck
  },
  {
    id: 2,
    title: 'Run 3-Way Reconciliation Batch',
    badge: '2 of 3 • Core Action',
    description: 'Click "Run Reconciliation" in the top bar to execute the deterministic 4-stage match engine across your ledger, gateway, and bank feeds in <0.1s.',
    actionHint: 'Matches internal sales, gateway MDR deductions, and bank statement UTR credits.',
    icon: Play
  },
  {
    id: 3,
    title: 'Universal Ask Fino & Copilot',
    badge: '3 of 3 • Contextual Intelligence',
    description: 'Hover and click any figure or finance term anywhere in Finora to ask grounded audit questions with statutory evidence citations.',
    actionHint: 'Ask about MDR rules, TDS compliance, or click "Ask Fino" on the top bar.',
    icon: MessageSquare
  }
];

export const QuickOrientationTour: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Check if user has already dismissed or completed the tour
    const hasSeenTour = localStorage.getItem('finora_quick_tour_dismissed');
    if (!hasSeenTour) {
      // Small 500ms delay on initial mount so page is painted first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for manual trigger custom event
  useEffect(() => {
    const handleOpenTour = () => {
      setCurrentStepIndex(0);
      setIsOpen(true);
    };
    window.addEventListener('finora-open-quick-tour', handleOpenTour);
    return () => window.removeEventListener('finora-open-quick-tour', handleOpenTour);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('finora_quick_tour_dismissed', 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const IconComponent = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
      {/* Dimmed backdrop (click to dismiss) */}
      <div 
        onClick={handleDismiss}
        className="fixed inset-0 bg-slate-900/35 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-200"
      />

      {/* Floating Spotlight Card */}
      <div className="relative z-50 pointer-events-auto w-full max-w-md bg-white border border-[#E4E4E7] rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs font-mono shadow-xs">
              F
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Quick Orientation Guide
              </span>
              <span className="text-xs font-extrabold text-[#15803D] bg-[#F0FDF4] px-2 py-0.2 rounded border border-[#BBF7D0] inline-block mt-0.5">
                {currentStep.badge}
              </span>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Dismiss Tour"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Content */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2 text-[#1E293B]">
            <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <IconComponent size={18} className="text-[#1E293B]" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {currentStep.title}
            </h4>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {currentStep.description}
          </p>

          <div className="text-[11px] text-slate-500 font-medium bg-white p-2 rounded-xl border border-slate-200/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] shrink-0"></span>
            <span>{currentStep.actionHint}</span>
          </div>
        </div>

        {/* Progress & Actions Bar */}
        <div className="flex items-center justify-between pt-1">
          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex 
                    ? 'w-6 bg-[#1E293B]' 
                    : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              Skip
            </button>

            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Got It' : 'Next'}</span>
              {currentStepIndex === TOUR_STEPS.length - 1 ? <Check size={13} /> : <ArrowRight size={13} />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
