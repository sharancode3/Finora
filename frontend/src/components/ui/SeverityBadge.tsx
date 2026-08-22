import React from 'react';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
}

export const SeverityBadge = ({ severity, className = '' }: SeverityBadgeProps) => {
  let bgColor, textColor;

  switch (severity) {
    case 'CRITICAL':
      bgColor = 'bg-danger';
      textColor = 'text-white';
      break;
    case 'HIGH':
      bgColor = 'bg-danger/15';
      textColor = 'text-danger';
      break;
    case 'MEDIUM':
      bgColor = 'bg-warning/15';
      textColor = 'text-warning';
      break;
    case 'LOW':
    default:
      bgColor = 'bg-secondary/15';
      textColor = 'text-secondary';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${bgColor} ${textColor} ${className}`}>
      {severity}
    </span>
  );
};
