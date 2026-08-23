import React from 'react';
import { STATUS_COLORS } from '../../theme/statusTokens';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface SeverityBadgeProps {
  severity: SeverityLevel | string;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '' }) => {
  let styleClasses = '';
  const upper = severity.toUpperCase();

  switch (upper) {
    case 'CRITICAL':
      styleClasses = STATUS_COLORS.exception.solid;
      break;
    case 'HIGH':
      styleClasses = STATUS_COLORS.exception.badge;
      break;
    case 'MEDIUM':
      styleClasses = STATUS_COLORS.pending.badge;
      break;
    case 'LOW':
    default:
      styleClasses = STATUS_COLORS.neutral.badge;
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${styleClasses} ${className}`}>
      {severity}
    </span>
  );
};
