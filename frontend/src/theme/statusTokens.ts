/**
 * Finora Design Token System: Single Source of Truth for Status & Trust-State Colors
 * 
 * STRICT FINTECH COLOR MAPPING:
 * 1. GREEN (emerald): Verified, Healthy, Pass, Good, Resolved, Settled, Balanced.
 * 2. AMBER (amber): Probable, Pending, Needs Attention, Review Required, In Suspense, Stale, Warning, Medium/Low Severity.
 * 3. RED (rose): Exception, Critical, Failed, High Risk, Unresolved, Open Exception, Error.
 * 4. INDIGO (indigo): Reserved EXCLUSIVELY for AI-generated content, AI Copilot, AI Verified badge, Sparkles, and AI reasoning trails.
 * 5. SLATE (slate): Neutral metadata, structural borders, labels, timestamps.
 * 
 * PROHIBITED: Blue or decorative colors for statuses/badges.
 */

export const STATUS_COLORS = {
  // 1. GREEN: Verified / Healthy / Pass / Settled / Reconciled
  verified: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
    solid: 'bg-emerald-600 text-white'
  },
  
  // 2. AMBER: Probable / Pending / Review Required / Stale / Warning / Medium
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    badge: 'bg-amber-50 text-amber-800 border border-amber-200',
    dot: 'bg-amber-500',
    solid: 'bg-amber-600 text-white'
  },
  
  // 3. RED: Exception / Critical / Failed / Unresolved / Error / Open
  exception: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    badge: 'bg-rose-50 text-rose-700 border border-rose-200',
    dot: 'bg-rose-500',
    solid: 'bg-rose-600 text-white'
  },

  // 4. INDIGO: Reserved EXCLUSIVELY for AI Intelligence / AI-Generated Content / Copilot
  ai: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    dot: 'bg-indigo-600',
    solid: 'bg-indigo-600 text-white',
    sparkle: 'text-indigo-600'
  },

  // 5. SLATE: Neutral / Informational / Labels
  neutral: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700 border border-slate-200',
    dot: 'bg-slate-400',
    solid: 'bg-slate-700 text-white'
  }
} as const;

export type TrustStateEnum = 
  | 'VERIFIED' 
  | 'PROBABLE' 
  | 'REVIEW REQUIRED' 
  | 'UNRESOLVED' 
  | 'EXCEPTION' 
  | 'ESCALATED' 
  | 'RESOLVED' 
  | 'AI_GENERATED';

export function getTrustStateStyles(state: string): string {
  const upper = state.toUpperCase();
  if (upper === 'VERIFIED' || upper === 'RESOLVED' || upper === 'HEALTHY' || upper === 'PASS' || upper === 'SETTLED' || upper === 'MATCHED') {
    return STATUS_COLORS.verified.badge;
  }
  if (upper === 'PROBABLE' || upper === 'REVIEW REQUIRED' || upper === 'PENDING' || upper === 'IN_SUSPENSE' || upper === 'STALE' || upper === 'WARNING' || upper === 'MEDIUM' || upper === 'LOW') {
    return STATUS_COLORS.pending.badge;
  }
  if (upper === 'EXCEPTION' || upper === 'UNRESOLVED' || upper === 'CRITICAL' || upper === 'HIGH' || upper === 'FAILED' || upper === 'ERROR' || upper === 'OPEN' || upper === 'ESCALATED') {
    return STATUS_COLORS.exception.badge;
  }
  if (upper.includes('AI') || upper === 'COPILOT') {
    return STATUS_COLORS.ai.badge;
  }
  return STATUS_COLORS.neutral.badge;
}
