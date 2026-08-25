import React from 'react';
import { FinoraMark } from './FinoraMark';

interface Props {
  text?: string;
  subtext?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Brand-First AI Inference Loading Indicator
 * Replaces generic spinners with the pulsing Finora Ledger Tick mark.
 */
export const FinoThinkingIndicator: React.FC<Props> = ({
  text = 'Fino is verifying deterministic ledger records...',
  subtext = 'Validating 3-way match consistency & zero mental math',
  size = 'md',
  className = ''
}) => {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 48 : 36;

  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center space-y-3 ${className}`}>
      <div className="relative">
        <FinoraMark size={iconSize} isThinking={true} />
        <div className="absolute -inset-1 rounded-2xl bg-slate-400/20 blur-xs animate-ping pointer-events-none" />
      </div>
      <div className="space-y-0.5">
        <p className={`font-bold text-slate-800 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {text}
        </p>
        {subtext && (
          <p className="text-[11px] text-slate-500 font-mono">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};
