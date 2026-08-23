/**
 * Finora Centralized Design System & Color Tokens
 * Standardizes semantic status colors, chart palettes, and typography tokens across the app.
 */

export const COLORS = {
  // Brand
  brand: '#4f46e5', // indigo-600
  brandHover: '#4338ca', // indigo-700
  brandLight: '#eef2ff', // indigo-50

  // Semantic Status Tokens (Consistent across all badges, cards, and charts)
  verified: '#10b981', // emerald-500 (Verified / Settled / Matched / Healthy)
  verifiedBg: '#ecfdf5', // emerald-50
  verifiedBorder: '#a7f3d0', // emerald-200
  verifiedText: '#047857', // emerald-700

  probable: '#f59e0b', // amber-500 (Probable / Needs Attention / Warnings / Delays)
  probableBg: '#fffbeb', // amber-50
  probableBorder: '#fde68a', // amber-200
  probableText: '#b45309', // amber-700

  exception: '#f43f5e', // rose-500 (Exception / Critical / Unreconciled / Loss)
  exceptionBg: '#fff1f2', // rose-50
  exceptionBorder: '#fecdd3', // rose-200
  exceptionText: '#be123c', // rose-700

  info: '#3b82f6', // blue-500 (Informational / Gateway Feeds / Processing)
  infoBg: '#eff6ff', // blue-50
  infoBorder: '#bfdbfe', // blue-200
  infoText: '#1d4ed8', // blue-700

  // Neutral Slate Scale (6-step hierarchy)
  slate: {
    bg: '#f8fafc', // slate-50
    surface: '#ffffff', // white
    border: '#e2e8f0', // slate-200
    muted: '#94a3b8', // slate-400 (captions, neutral chart bars)
    secondary: '#64748b', // slate-500 (subtitles, secondary labels)
    body: '#334155', // slate-700 (body content)
    heading: '#0f172a', // slate-900 (primary headings, dark top bar)
  }
};

export const CHART_PALETTE = {
  verified: COLORS.verified,
  probable: COLORS.probable,
  exception: COLORS.exception,
  info: COLORS.info,
  grossNeutral: COLORS.slate.muted,
  gstOrange: '#fb923c', // orange-400
};
