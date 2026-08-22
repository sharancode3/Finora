import React from 'react';
import { Card } from './Card';
import { TrustState } from './TrustBadge';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | React.ReactNode;
  delta?: number;
  deltaLabel?: string;
  trustState?: TrustState;
  className?: string;
}

export const StatCard = ({ label, value, delta, deltaLabel, trustState, className = '' }: StatCardProps) => {
  let borderAccent = '';
  
  if (trustState) {
    switch (trustState) {
      case 'VERIFIED': borderAccent = 'border-b-4 border-b-success'; break;
      case 'PROBABLE': borderAccent = 'border-b-4 border-b-warning'; break;
      case 'REVIEW REQUIRED': borderAccent = 'border-b-4 border-b-alert'; break;
      case 'UNRESOLVED':
      case 'EXCEPTION': borderAccent = 'border-b-4 border-b-danger'; break;
    }
  }

  return (
    <Card className={`p-6 flex flex-col justify-between ${borderAccent} ${className}`}>
      <div className="label text-secondary mb-2">{label}</div>
      <div className="font-mono text-3xl font-bold text-primary mb-4">{value}</div>
      
      {delta !== undefined && (
        <div className="flex items-center gap-1.5 mt-auto">
          <span className={`flex items-center text-sm font-semibold ${delta >= 0 ? 'text-success' : 'text-danger'}`}>
            {delta >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {Math.abs(delta)}%
          </span>
          {deltaLabel && <span className="text-sm text-secondary">{deltaLabel}</span>}
        </div>
      )}
    </Card>
  );
};
