/**
 * Finora Centralized Design System & Color Tokens (Phase 2 Locked Palette)
 * Standardizes semantic status colors, chart palettes, and typography tokens across the app.
 */

export const COLORS = {
  // Brand / AI
  brand: '#5B45F5',
  brandHover: '#4C35E8',
  brandLight: '#EEEBFF',
  brandBorder: '#DDD7FE',

  // Semantic Status Tokens (Consistent across all badges, cards, and charts)
  verified: '#16A34A', // Success (Verified / Settled / Matched / Healthy)
  verifiedBg: '#ECFDF3',
  verifiedBorder: '#BBF7D0',
  verifiedText: '#16A34A',

  probable: '#D97706', // Warning (Probable / Needs Attention / Warnings / Delays)
  probableBg: '#FFF7ED',
  probableBorder: '#FED7AA',
  probableText: '#D97706',

  exception: '#DC2626', // Danger (Exception / Critical / Unreconciled / Loss)
  exceptionBg: '#FEF2F2',
  exceptionBorder: '#FECACA',
  exceptionText: '#DC2626',

  info: '#2563EB', // Info (Informational / Gateway Feeds / Processing)
  infoBg: '#EFF6FF',
  infoBorder: '#BFDBFE',
  infoText: '#2563EB',

  // Neutral Scale
  slate: {
    bg: '#F7F8FC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    muted: '#94A3B8',
    secondary: '#64748B',
    body: '#334155',
    heading: '#0F172A',
  }
};

export const CHART_PALETTE = {
  verified: COLORS.verified,
  probable: COLORS.probable,
  exception: COLORS.exception,
  info: COLORS.info,
  grossNeutral: COLORS.slate.muted,
  gstOrange: '#D97706',
};

