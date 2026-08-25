import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useAI } from '../../context/AIContext';

export interface DeltaMetric {
  label: string;
  value: string | number;
  subLabel?: string;
}

export interface DeltaOutlier {
  name: string;
  amount?: number | string;
  detail: string;
  impact?: string;
  rule?: string;
}

export interface GroundedDeltaExplainerProps {
  title?: string;
  metricA: DeltaMetric;
  metricB: DeltaMetric;
  explanation?: string | React.ReactNode;
  outliers?: DeltaOutlier[];
  badgeLabel?: string;
  badgeVariant?: 'danger' | 'warning' | 'info' | 'neutral';
  customQuestion?: string;
  className?: string;
  onAskFino?: () => void;
}

export const GroundedDeltaExplainer: React.FC<GroundedDeltaExplainerProps> = ({
  title = 'Metric Divergence Analysis',
  metricA,
  metricB,
  explanation,
  outliers = [],
  badgeLabel = 'Skew Driver Identified',
  badgeVariant = 'danger',
  customQuestion,
  className = '',
  onAskFino
}) => {
  const { askAboutElement } = useAI();

  const getBadgeStyle = () => {
    switch (badgeVariant) {
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'info':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'neutral':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'danger':
      default:
        return 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]';
    }
  };

  const defaultQuestion = customQuestion || 
    `Explain the divergence between ${metricA.label} (${metricA.value}) and ${metricB.label} (${metricB.value}). Which specific high-value line items account for the gap?`;

  const handleAsk = () => {
    if (onAskFino) {
      onAskFino();
    } else {
      askAboutElement(defaultQuestion);
    }
  };

  return (
    <div className={`p-4 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs text-slate-700 shadow-2xs space-y-3 ${className}`}>
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md bg-[#1E293B] text-white flex items-center justify-center font-bold text-[9px] font-mono shrink-0">
            F
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-900 text-xs">
              {title}
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-800">
                {metricA.label}: {metricA.value}
              </span>
              <span className="text-slate-400 font-sans font-medium">vs</span>
              <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-800">
                {metricB.label}: {metricB.value}
              </span>
            </div>
            {badgeLabel && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle()}`}>
                {badgeLabel}
              </span>
            )}
          </div>
        </div>

        {/* Click to Ask AI Button */}
        <button
          onClick={handleAsk}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors self-start sm:self-auto cursor-pointer shadow-2xs"
          title="Ask Fino to perform a deep-dive variance explanation"
        >
          <div className="w-3.5 h-3.5 rounded bg-[#1E293B] text-white flex items-center justify-center font-bold text-[8px] font-mono shrink-0">F</div>
          <span>Ask Fino to Explain</span>
          <ChevronRight size={11} />
        </button>
      </div>

      {/* Explanation Narrative */}
      <div className="text-slate-600 leading-relaxed font-normal pl-7">
        {explanation || (
          <span>
            The count-based metric ({metricA.value}) reflects high-frequency small-dollar routine transactions, while the monetary value metric ({metricB.value}) is driven by a small number of high-value outliers and pending exception lines.
          </span>
        )}
      </div>

      {/* Optional Outlier Breakdown Cards */}
      {outliers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7 pt-1">
          {outliers.map((item, idx) => (
            <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200/90 text-[11px] space-y-0.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <strong className="text-slate-900 font-semibold">{item.name}</strong>
                {item.amount && (
                  <span className="font-mono font-bold text-[#B91C1C]">
                    {typeof item.amount === 'number' ? `₹${item.amount.toLocaleString('en-IN')}` : item.amount}
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-[10px] leading-snug">{item.detail}</p>
              {item.rule && (
                <span className="inline-block text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                  {item.rule}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
