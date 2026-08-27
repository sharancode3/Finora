import React, { useState, useEffect } from 'react';
import { FinoraMark } from './FinoraMark';
import { Sparkles, Brain, Database, ShieldCheck, Cpu } from 'lucide-react';

interface Props {
  text?: string;
  subtext?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const REASONING_STEPS = [
  { icon: Brain, label: 'Analyzing financial inquiry intent & scope parameters...' },
  { icon: Database, label: 'Querying ACID SQLite multi-rail settlements ledger...' },
  { icon: ShieldCheck, label: 'Running zero-mental-math verifier (Gross − Deductions = Net)...' },
  { icon: Cpu, label: 'Synthesizing grounded controller findings & statutory citations...' }
];

/**
 * Brand-First AI Inference & Reasoning Indicator (DeepSeek R1 / OpenAI o3 Agentic Pattern)
 * Displays progressive multi-step cognitive execution and live deliberation timer.
 */
export const FinoThinkingIndicator: React.FC<Props> = ({
  size = 'md',
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [seconds, setSeconds] = useState(0.0);

  useEffect(() => {
    // Step progression interval
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < REASONING_STEPS.length - 1 ? prev + 1 : prev));
    }, 450);

    // Live timer
    const timerInterval = setInterval(() => {
      setSeconds(prev => +(prev + 0.1).toFixed(1));
    }, 100);

    return () => {
      clearInterval(stepInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const iconSize = size === 'sm' ? 22 : size === 'lg' ? 40 : 30;
  const ActiveIcon = REASONING_STEPS[currentStep].icon;

  return (
    <div className={`p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3 max-w-md ${className}`}>
      {/* Top Header with Pulse & Timer */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <FinoraMark size={iconSize} isThinking={true} />
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Fino is Reasoning...</span>
              <Sparkles size={12} className="text-indigo-500 animate-pulse" />
            </span>
            <span className="text-[10px] text-slate-400 font-mono block">
              Step {currentStep + 1} of {REASONING_STEPS.length}
            </span>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          {seconds.toFixed(1)}s
        </span>
      </div>

      {/* Active Progressive Step Ticker */}
      <div className="flex items-center gap-2.5 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
        <div className="w-5 h-5 rounded-lg bg-[#1E293B] text-white flex items-center justify-center shrink-0">
          <ActiveIcon size={12} />
        </div>
        <p className="text-[11px] font-medium text-slate-700 leading-snug animate-pulse">
          {REASONING_STEPS[currentStep].label}
        </p>
      </div>
    </div>
  );
};
