import React from 'react';
import { Sparkles, ArrowRight, ShieldAlert, CheckCircle2, ChevronRight, AlertTriangle, HelpCircle } from 'lucide-react';
import { FinoraMark } from './FinoraMark';
import { AmountDisplay } from './AmountDisplay';
import { useAI } from '../../context/AIContext';

export interface NextBestActionProps {
  title: string;
  targetId?: string;
  category?: string;
  exposureAmount?: number;
  reasons: string[];
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  isLoading?: boolean;
  className?: string;
  badgeText?: string;
}

export const NextBestActionCard: React.FC<NextBestActionProps> = ({
  title,
  targetId,
  category = 'Settlement & Exceptions',
  exposureAmount,
  reasons,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel = 'Inspect Evidence',
  onSecondaryAction,
  isLoading = false,
  className = '',
  badgeText = 'AI Recommended Priority'
}) => {
  const { askAboutElement } = useAI();

  return (
    <div className={`bg-gradient-to-r from-violet-50/70 via-white to-amber-50/40 rounded-2xl border border-violet-200/80 shadow-xs p-5 hover:border-violet-300 transition-all ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Info Column */}
        <div className="space-y-2.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-100 text-[#5B45F5] font-bold text-[10px] uppercase tracking-wider border border-violet-200">
              <Sparkles size={11} />
              <span>{badgeText}</span>
            </span>
            {targetId && (
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {targetId}
              </span>
            )}
            <span className="text-[11px] text-slate-500 font-medium">
              {category}
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{title}</span>
              {exposureAmount !== undefined && (
                <span className="text-sm font-extrabold text-[#B91C1C] font-mono">
                  (₹{exposureAmount.toLocaleString('en-IN')})
                </span>
              )}
            </h3>
          </div>

          {/* Bulleted Reason List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
            {reasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-1.5 font-medium">
                <span className="text-[#5B45F5] font-bold leading-relaxed">•</span>
                <span className="leading-relaxed">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Action Column */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <button
            onClick={onPrimaryAction}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
          >
            <span>{isLoading ? 'Executing...' : primaryActionLabel}</span>
            <ArrowRight size={14} />
          </button>

          {onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="text-xs font-semibold text-[#5B45F5] hover:text-violet-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>{secondaryActionLabel}</span>
              <ChevronRight size={13} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
