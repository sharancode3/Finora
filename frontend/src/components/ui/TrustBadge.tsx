import React from 'react';
import { CheckCircle2, AlertCircle, Eye, HelpCircle } from 'lucide-react';

export type TrustState = 'VERIFIED' | 'PROBABLE' | 'REVIEW REQUIRED' | 'UNRESOLVED' | 'EXCEPTION' | 'ESCALATED' | 'RESOLVED';

interface TrustBadgeProps {
  state: TrustState;
  className?: string;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ state, className = '' }) => {
  let styleClasses = '';
  let Icon = AlertCircle;

  switch (state) {
    case 'VERIFIED':
    case 'RESOLVED':
      styleClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      Icon = CheckCircle2;
      break;
    case 'PROBABLE':
      styleClasses = 'bg-amber-50 text-amber-700 border border-amber-200';
      Icon = HelpCircle;
      break;
    case 'REVIEW REQUIRED':
    case 'ESCALATED':
      styleClasses = 'bg-purple-50 text-purple-700 border border-purple-200';
      Icon = Eye;
      break;
    case 'UNRESOLVED':
    case 'EXCEPTION':
    default:
      styleClasses = 'bg-rose-50 text-rose-700 border border-rose-200';
      Icon = AlertCircle;
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styleClasses} ${className}`}>
      <Icon size={12} strokeWidth={2.5} />
      {state}
    </span>
  );
};
