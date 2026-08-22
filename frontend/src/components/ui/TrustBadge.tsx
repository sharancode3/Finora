import React from 'react';
import { CheckCircle2, AlertCircle, Eye, HelpCircle } from 'lucide-react';

export type TrustState = 'VERIFIED' | 'PROBABLE' | 'REVIEW REQUIRED' | 'UNRESOLVED' | 'EXCEPTION';

interface TrustBadgeProps {
  state: TrustState;
  className?: string;
}

export const TrustBadge = ({ state, className = '' }: TrustBadgeProps) => {
  let bgColor, textColor, Icon;

  switch (state) {
    case 'VERIFIED':
      bgColor = 'bg-success/15';
      textColor = 'text-success';
      Icon = CheckCircle2;
      break;
    case 'PROBABLE':
      bgColor = 'bg-warning/15';
      textColor = 'text-warning';
      Icon = HelpCircle;
      break;
    case 'REVIEW REQUIRED':
      bgColor = 'bg-alert/15';
      textColor = 'text-alert';
      Icon = Eye;
      break;
    case 'UNRESOLVED':
    case 'EXCEPTION':
    default:
      bgColor = 'bg-danger/15';
      textColor = 'text-danger';
      Icon = AlertCircle;
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider ${bgColor} ${textColor} ${className}`}>
      <Icon size={12} strokeWidth={3} />
      {state}
    </span>
  );
};
