import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';
import { pluralize } from '../../utils/formatters';
import { FinoraMark } from './FinoraMark';

export interface EvidenceStep {
  step_number?: number;
  action?: string;
  tool?: string;
  input?: any;
  observation?: string | any;
  summary?: string;
  result_summary?: string;
}

export interface AIInsightCardProps {
  title?: string;
  subtitle?: string;
  narration: string;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  confidenceScore?: number;
  evidenceTrail?: EvidenceStep[];
  recommendedAction?: string;
  metrics?: Array<{
    label: string;
    value: string | number | React.ReactNode;
    color?: string;
  }>;
  asOfTimestamp?: string;
  children?: React.ReactNode;
  variant?: 'card' | 'banner' | 'embedded';
  className?: string;
}

/**
 * Standardized AI Output Component (Phase 2 Monochrome-Plus-Semantic Spec)
 * Monogram "F" badge, monochrome ink action highlights, and semantic status tokens.
 */
export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title = "Fino Controller Insight",
  subtitle,
  narration,
  confidence = "HIGH",
  confidenceScore = 0.98,
  evidenceTrail = [],
  recommendedAction,
  metrics = [],
  asOfTimestamp,
  children,
  className = ''
}) => {
  const [showEvidence, setShowEvidence] = useState(false);

  // Format confidence label: High (98%), Medium (82%), Low (45%)
  const formatConfidence = () => {
    const scorePct = Math.round((confidenceScore <= 1 ? confidenceScore * 100 : confidenceScore));
    const tier = (confidence || 'HIGH').toUpperCase();
    if (tier === 'HIGH') return `Confidence: High (${scorePct}%)`;
    if (tier === 'MEDIUM') return `Confidence: Medium (${scorePct}%)`;
    return `Confidence: Low (${scorePct}%)`;
  };

  const getConfidenceBadgeStyle = () => {
    const tier = (confidence || 'HIGH').toUpperCase();
    if (tier === 'HIGH') return 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]';
    if (tier === 'MEDIUM') return 'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]';
    return 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]';
  };

  return (
    <div className={`bg-white text-slate-900 rounded-2xl border border-[#E4E4E7] shadow-xs overflow-hidden transition-colors duration-150 ease-out ${className}`}>
      
      {/* Header */}
      <div className="p-5 border-b border-[#E4E4E7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <FinoraMark size={32} />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#15803D] ring-2 ring-white dark:ring-[#151B24]" title="Fino Grounded Engine Ready" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {title}
              </h3>
              {/* Single Status Badge in Header */}
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getConfidenceBadgeStyle()}`}>
                {formatConfidence()}
              </span>
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {subtitle}
              </p>
            )}
            {asOfTimestamp && (
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                As of {asOfTimestamp}
              </p>
            )}
          </div>
        </div>

        {evidenceTrail && evidenceTrail.length > 0 && (
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="text-xs font-bold text-[#1E293B] hover:text-[#0F172A] bg-[#F1F5F9] hover:bg-[#E2E8F0] px-3 py-1.5 rounded-xl border border-[#E2E8F0] transition-colors duration-150 ease-out flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Database size={13} />
            <span>{showEvidence ? 'Hide Evidence Trail' : `Show Evidence Trail (${pluralize(evidenceTrail.length, 'step', 'steps')})`}</span>
            {showEvidence ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}
      </div>

      {/* Body: Insight Narration */}
      <div className="p-5 space-y-4">
        <p className="text-sm leading-relaxed text-slate-800 font-medium whitespace-pre-line">
          {narration}
        </p>

        {/* Optional Metric Badges / Key Highlights */}
        {metrics && metrics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {metrics.map((m, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-[#E4E4E7]">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">{m.label}</span>
                <span className={`text-sm font-bold font-mono ${m.color || 'text-slate-900'}`}>
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Optional Recommended Action */}
        {recommendedAction && (
          <div className="p-3 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0] flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-[#15803D] shrink-0" />
              Recommended Controller Action:
            </span>
            <span className="font-bold text-[#15803D]">{recommendedAction}</span>
          </div>
        )}

        {children}

        {/* Expandable Evidence Trail Numbered List */}
        {showEvidence && evidenceTrail.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#E4E4E7] space-y-3 animate-in fade-in duration-200 ease-out">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#15803D]" /> Numbered Ledger Evidence Trail
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {evidenceTrail.length} Deterministic Tool Executions
              </span>
            </div>

            <div className="space-y-2">
              {evidenceTrail.map((step, sIdx) => {
                const stepNum = step.step_number || (sIdx + 1);
                const toolName = step.tool || step.action || 'ledger_query';
                const obs = typeof step.observation === 'string' 
                  ? step.observation 
                  : (step.result_summary || JSON.stringify(step.observation || {}));
                
                return (
                  <div key={sIdx} className="p-3 bg-slate-50 rounded-xl border border-[#E4E4E7] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#F1F5F9] text-[#1E293B] border border-[#E2E8F0] text-[10px] flex items-center justify-center font-bold">
                          {stepNum}
                        </span>
                        Tool: <span className="text-[#1E293B]">{toolName}</span>
                      </span>
                      {step.input && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          Input: {typeof step.input === 'string' ? step.input : Object.keys(step.input).join(', ')}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 pl-5 text-[11px] leading-relaxed">
                      {obs}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Grounding Footer */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-t border-[#E4E4E7] flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
          Deterministic Double-Entry Execution
        </span>
        <span className="font-mono text-[10px] text-slate-400">Grounded in local SQLite ledger</span>
      </div>
    </div>
  );
};
