import React from 'react';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '' }) => {
  let styleClasses = '';

  switch (severity) {
    case 'CRITICAL':
      styleClasses = 'bg-rose-600 text-white shadow-xs';
      break;
    case 'HIGH':
      styleClasses = 'bg-rose-50 text-rose-700 border border-rose-200';
      break;
    case 'MEDIUM':
      styleClasses = 'bg-amber-50 text-amber-700 border border-amber-200';
      break;
    case 'LOW':
    default:
      styleClasses = 'bg-slate-100 text-slate-600 border border-slate-200';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${styleClasses} ${className}`}>
      {severity}
    </span>
  );
};
