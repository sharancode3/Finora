import React from 'react';
import { Layers, AlertCircle, Info } from 'lucide-react';

export interface CauseScore {
  name: string;
  score: number;
  category: string;
  color: 'rose' | 'amber' | 'blue' | 'slate' | string;
  description?: string;
}

export interface MultiCauseScores {
  exception_id: string;
  amount?: number;
  primary_cause: CauseScore;
  secondary_cause?: CauseScore | null;
  scores: CauseScore[];
}

interface Props {
  scoresData?: MultiCauseScores | null;
  isLoading?: boolean;
  className?: string;
}

export const MultiCauseScoreBar: React.FC<Props> = ({ scoresData, isLoading = false, className = '' }) => {
  if (isLoading) {
    return (
      <div className={`p-4 bg-slate-50 rounded-xl border border-slate-200 animate-pulse text-xs text-slate-400 ${className}`}>
        Calculating multi-cause root-score distribution...
      </div>
    );
  }

  if (!scoresData || !scoresData.scores || scoresData.scores.length === 0) {
    return null;
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'rose':
        return { bg: 'bg-[#B91C1C]', text: 'text-[#B91C1C]', light: 'bg-rose-50 border-rose-200' };
      case 'amber':
        return { bg: 'bg-amber-600', text: 'text-amber-800', light: 'bg-amber-50 border-amber-200' };
      case 'blue':
        return { bg: 'bg-blue-600', text: 'text-blue-800', light: 'bg-blue-50 border-blue-200' };
      case 'slate':
      default:
        return { bg: 'bg-slate-400', text: 'text-slate-600', light: 'bg-slate-50 border-slate-200' };
    }
  };

  return (
    <div className={`p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs ${className}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-[#1E293B]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Explainable Multi-Cause Root Scoring
          </h4>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          Weighted Probabilistic Decomposition
        </span>
      </div>

      {/* Multi-Segment Stacked Progress Bar */}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
        {scoresData.scores.map((c) => (
          <div
            key={c.name}
            style={{ width: `${c.score}%` }}
            className={`h-full ${getColorClasses(c.color).bg} transition-all duration-300`}
            title={`${c.name}: ${c.score}%`}
          />
        ))}
      </div>

      {/* Top 2 Primary & Secondary Causes Callout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        
        {/* Primary Cause */}
        <div className={`p-2.5 rounded-lg border flex items-start gap-2 ${getColorClasses(scoresData.primary_cause.color).light}`}>
          <AlertCircle size={14} className={`${getColorClasses(scoresData.primary_cause.color).text} shrink-0 mt-0.5`} />
          <div>
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Primary:</span>
              <span className={getColorClasses(scoresData.primary_cause.color).text}>{scoresData.primary_cause.name}</span>
              <span className="font-mono font-bold">({scoresData.primary_cause.score}%)</span>
            </div>
            {scoresData.primary_cause.description && (
              <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">{scoresData.primary_cause.description}</p>
            )}
          </div>
        </div>

        {/* Secondary Cause (if > 0) */}
        {scoresData.secondary_cause && scoresData.secondary_cause.score > 0 ? (
          <div className={`p-2.5 rounded-lg border flex items-start gap-2 ${getColorClasses(scoresData.secondary_cause.color).light}`}>
            <Info size={14} className={`${getColorClasses(scoresData.secondary_cause.color).text} shrink-0 mt-0.5`} />
            <div>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Secondary:</span>
                <span className={getColorClasses(scoresData.secondary_cause.color).text}>{scoresData.secondary_cause.name}</span>
                <span className="font-mono font-bold">({scoresData.secondary_cause.score}%)</span>
              </div>
              {scoresData.secondary_cause.description && (
                <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">{scoresData.secondary_cause.description}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 text-slate-500 text-[11px]">
            <Info size={14} className="shrink-0 text-slate-400" />
            <span>Single dominant root cause identified without significant secondary split.</span>
          </div>
        )}

      </div>

      {/* Breakdown Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-[11px]">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">All Candidates:</span>
        {scoresData.scores.map(s => (
          <span key={s.name} className="flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
            <span className={`w-1.5 h-1.5 rounded-full ${getColorClasses(s.color).bg}`} />
            <span>{s.name}:</span>
            <strong className="font-mono text-slate-900">{s.score}%</strong>
          </span>
        ))}
      </div>

    </div>
  );
};
