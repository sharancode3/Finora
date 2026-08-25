import React from 'react';

interface FinoraMarkProps {
  size?: number; // pixel width & height (e.g. 16, 24, 32, 40, 64)
  variant?: 'badge' | 'glyph';
  isThinking?: boolean;
  className?: string;
  badgeBgColor?: string;
  glyphColor?: string;
}

/**
 * Canonical Finora "F" Mark — "The Ledger Tick"
 * Fully monochrome: var(--ink, #1E293B) and var(--surface, #FAFAFA)
 * Below 24px: drops the hook for clean rendering without smudging
 * Thinking state: animated subtle pulse on the checkmark hook
 */
export const FinoraMark: React.FC<FinoraMarkProps> = ({
  size = 32,
  variant = 'badge',
  isThinking = false,
  className = '',
  badgeBgColor,
  glyphColor
}) => {
  const showHook = size >= 24;
  const cornerRadius = (size * 14) / 64; // Scaled 14px radius from 64px viewBox

  const effectiveBgColor = badgeBgColor || 'var(--ink, #1E293B)';
  const effectiveGlyphColor = glyphColor || '#FAFAFA';

  if (variant === 'glyph') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
      >
        {/* vertical stem */}
        <rect x="20" y="14" width="7" height="36" rx="1.5" fill={effectiveGlyphColor} />
        {/* top arm */}
        {showHook ? (
          <path
            d="M20 14 H44 V21 H27 V14 Z M44 14 V25 H37 V21 H44 Z"
            fill={effectiveGlyphColor}
            className={isThinking ? 'animate-pulse' : ''}
          />
        ) : (
          <rect x="20" y="14" width="24" height="7" rx="1.5" fill={effectiveGlyphColor} />
        )}
        {/* middle arm */}
        <rect x="20" y="28" width="18" height="7" rx="1.5" fill={effectiveGlyphColor} />
      </svg>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: `${cornerRadius}px`,
        backgroundColor: effectiveBgColor
      }}
      className={`inline-flex items-center justify-center shrink-0 shadow-xs relative overflow-hidden ${
        isThinking ? 'ring-2 ring-slate-400 ring-offset-1 animate-pulse' : ''
      } ${className}`}
    >
      <svg
        width={size * 0.75}
        height={size * 0.75}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* vertical stem */}
        <rect x="20" y="14" width="7" height="36" rx="1.5" fill={effectiveGlyphColor} />
        {/* long top arm with Ledger Tick hook */}
        {showHook ? (
          <path
            d="M20 14 H44 V21 H27 V14 Z M44 14 V25 H37 V21 H44 Z"
            fill={effectiveGlyphColor}
            className={isThinking ? 'animate-bounce' : ''}
          />
        ) : (
          <rect x="20" y="14" width="24" height="7" rx="1.5" fill={effectiveGlyphColor} />
        )}
        {/* shorter middle arm */}
        <rect x="20" y="28" width="18" height="7" rx="1.5" fill={effectiveGlyphColor} />
      </svg>
    </div>
  );
};

/**
 * Standard Finora Brand Lockup (Badge Icon + Wordmark + Subtitle)
 */
export const FinoraBrandLockup: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  isThinking?: boolean;
  className?: string;
}> = ({ size = 'md', isThinking = false, className = '' }) => {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <FinoraMark size={iconSize} isThinking={isThinking} />
      <div className="flex flex-col">
        <span className={`font-bold tracking-tight leading-none text-slate-900 ${
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'
        }`}>
          Finora
        </span>
        <span className={`font-bold text-slate-500 uppercase tracking-widest mt-0.5 font-mono ${
          size === 'sm' ? 'text-[8px]' : 'text-[10px]'
        }`}>
          FINANCIAL CONTROLLER
        </span>
      </div>
    </div>
  );
};
