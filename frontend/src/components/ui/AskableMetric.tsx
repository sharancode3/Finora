import React from 'react';
import { useAI } from '../../context/AIContext';

export interface AskableMetricProps {
  children?: React.ReactNode;
  question?: string;
  customQuestion?: string;
  label?: string;
  value?: string | number;
  context?: string;
  className?: string;
  showIcon?: boolean;
  showUnderline?: boolean;
  inline?: boolean;
  title?: string;
  onClickExtra?: () => void;
}

/**
 * Reusable Universal "Ask AI About This" Click-to-Ask Component (Phase 4 Spec)
 * Renders a quiet, subtle hover affordance (subtle dotted/dashed underline and micro "F" monogram)
 * On click, opens global Ask Controller Copilot panel and pre-fills & auto-submits a grounded inquiry.
 */
export const AskableMetric: React.FC<AskableMetricProps> = ({
  children,
  question,
  customQuestion,
  label,
  value,
  context,
  className = '',
  showIcon = true,
  showUnderline = true,
  inline = true,
  title,
  onClickExtra
}) => {
  const { askAI } = useAI();

  // Construct intelligent question from props if not explicitly provided
  const resolvedQuestion = question || customQuestion || (() => {
    if (label && value !== undefined) {
      if (context) {
        return `Why is the ${label} ${typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : value} for ${context}? Please walk me through the underlying ledger components.`;
      }
      return `Why is the ${label} ${typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : value}? Please explain the calculation and variance.`;
    }
    if (label) {
      return `Can you explain the current status and breakdown of ${label}?`;
    }
    return `Can you analyze this financial figure and explain its underlying drivers?`;
  })();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClickExtra) onClickExtra();
    askAI(resolvedQuestion);
  };

  const hoverTitle = title || `Ask Controller: "${resolvedQuestion}"`;

  const Tag = inline ? 'span' : 'div';

  return (
    <Tag
      onClick={handleClick}
      title={hoverTitle}
      className={`group/askable relative inline-flex items-center gap-1 cursor-pointer transition-all duration-150 ease-out select-none ${
        showUnderline ? 'hover:underline hover:decoration-slate-400 hover:decoration-dotted hover:underline-offset-3' : ''
      } ${className}`}
    >
      <span>{children}</span>
      {showIcon && (
        <span 
          aria-hidden="true"
          className="opacity-0 group-hover/askable:opacity-100 transition-opacity duration-150 ease-out inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-[#1E293B] text-white dark:bg-[#E2E8F0] dark:text-[#0B0F17] text-[8px] font-mono font-bold shadow-2xs shrink-0 select-none pointer-events-none"
        >
          F
        </span>
      )}
    </Tag>
  );
};
