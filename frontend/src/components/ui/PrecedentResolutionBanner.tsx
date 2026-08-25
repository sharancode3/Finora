import React from 'react';
import { History, Sparkles, Check, ArrowRight } from 'lucide-react';

export interface PrecedentItem {
  id: string;
  category: string;
  vendor: string;
  reason: string;
  note?: string;
  user: string;
  resolved_at: string;
}

export interface PrecedentsResponse {
  exception_id: string;
  vendor?: string;
  category?: string;
  has_precedent: boolean;
  precedents: PrecedentItem[];
  top_suggestion?: PrecedentItem | null;
}

interface Props {
  precedentData?: PrecedentsResponse | null;
  onApplyPrecedent: (reason: string, note?: string) => void;
  className?: string;
}

export const PrecedentResolutionBanner: React.FC<Props> = ({
  precedentData,
  onApplyPrecedent,
  className = ''
}) => {
  if (!precedentData || !precedentData.has_precedent || !precedentData.top_suggestion) {
    return null;
  }

  const top = precedentData.top_suggestion;

  return (
    <div className={`p-3.5 bg-gradient-to-r from-emerald-50/90 to-teal-50/70 border border-emerald-200 rounded-xl text-xs space-y-2.5 shadow-2xs ${className}`}>
      
      {/* Top Tag & Precedent Reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-2 text-emerald-900 font-bold">
          <div className="w-5 h-5 rounded-md bg-[#1E293B] text-white flex items-center justify-center font-bold text-[9px] font-mono shrink-0">
            F
          </div>
          <span className="flex items-center gap-1">
            <Sparkles size={13} className="text-emerald-600" />
            Human-Feedback Precedent Learned (Vic.ai Pattern)
          </span>
        </div>
        <span className="text-[10px] text-emerald-700 font-mono bg-white/80 px-2 py-0.5 rounded border border-emerald-200 self-start sm:self-auto">
          Resolved on {top.resolved_at?.split(' ')[0] || 'prior run'} by {top.user?.split(',')[0]}
        </span>
      </div>

      {/* Suggestion Text */}
      <p className="text-emerald-950 text-xs leading-relaxed">
        You resolved a similar <strong>{precedentData.category?.replace(/_/g, ' ') || 'exception'}</strong> for <strong>{top.vendor}</strong> as:
        <span className="block mt-1 p-2 bg-white/90 border border-emerald-200/80 rounded-lg font-medium text-slate-800 italic">
          "{top.reason}"
        </span>
      </p>

      {/* Action CTA */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-emerald-700">
          Apply identical resolution logic with 1-click
        </span>
        <button
          onClick={() => onApplyPrecedent(top.reason, top.note)}
          className="px-3 py-1.5 bg-[#15803D] hover:bg-[#166534] text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Check size={13} />
          <span>Apply Precedent Reason</span>
        </button>
      </div>

    </div>
  );
};
