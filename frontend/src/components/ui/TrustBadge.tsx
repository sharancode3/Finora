import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, Clock, AlertTriangle } from 'lucide-react';
import { STATUS_COLORS } from '../../theme/statusTokens';
import { FinoIcon } from './FinoIcon';

export type TrustState = 
  | 'VERIFIED' 
  | 'PROBABLE' 
  | 'REVIEW REQUIRED' 
  | 'UNRESOLVED' 
  | 'EXCEPTION' 
  | 'ESCALATED' 
  | 'RESOLVED'
  | 'AI_VERIFIED'
  | 'AI_GENERATED';

interface TrustBadgeProps {
  state: TrustState | string;
  className?: string;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ state, className = '' }) => {
  let styleClasses = '';
  let Icon: any = AlertCircle;
  let isFino = false;

  const upper = state.toUpperCase();

  switch (upper) {
    case 'VERIFIED':
    case 'RESOLVED':
    case 'SETTLED':
    case 'HEALTHY':
    case 'PASS':
      styleClasses = STATUS_COLORS.verified.badge;
      Icon = CheckCircle2;
      break;

    case 'PROBABLE':
    case 'REVIEW REQUIRED':
    case 'PENDING':
    case 'IN_SUSPENSE':
    case 'STALE':
      styleClasses = STATUS_COLORS.pending.badge;
      Icon = upper === 'STALE' ? AlertTriangle : (upper === 'PENDING' ? Clock : HelpCircle);
      break;

    case 'AI_VERIFIED':
    case 'AI_GENERATED':
    case 'COPILOT':
      styleClasses = STATUS_COLORS.ai.badge;
      isFino = true;
      break;

    case 'UNRESOLVED':
    case 'EXCEPTION':
    case 'ESCALATED':
    case 'CRITICAL':
    case 'HIGH':
    default:
      styleClasses = STATUS_COLORS.exception.badge;
      Icon = AlertCircle;
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styleClasses} ${className}`}>
      {isFino ? <FinoIcon size="xs" /> : <Icon size={12} strokeWidth={2.5} />}
      {state}
    </span>
  );
};
