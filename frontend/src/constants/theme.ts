/**
 * Finora Centralized Design System & Color Tokens (Phase 2 Monochrome-Plus-Semantic Palette)
 * Primary actions and active nav states use ink (#1E293B). Semantic tokens carry all status meaning.
 */

export const COLORS = {
  // Primary Ink Action (Replaces purple everywhere)
  ink: '#1E293B',
  inkHover: '#0F172A',
  inkLight: '#F1F5F9',
  inkBorder: '#E2E8F0',
  inkText: '#1E293B',

  // Alias for backward compatibility
  brand: '#1E293B',
  brandHover: '#0F172A',
  brandLight: '#F1F5F9',
  brandBorder: '#E2E8F0',

  // Semantic Status Tokens
  verified: '#15803D', // Success
  verifiedBg: '#F0FDF4',
  verifiedBorder: '#BBF7D0',
  verifiedText: '#15803D',

  probable: '#B45309', // Warning
  probableBg: '#FFFBEB',
  probableBorder: '#FEF3C7',
  probableText: '#B45309',

  exception: '#B91C1C', // Danger
  exceptionBg: '#FEF2F2',
  exceptionBorder: '#FECACA',
  exceptionText: '#B91C1C',

  info: '#1D4ED8', // Info
  infoBg: '#EFF6FF',
  infoBorder: '#DBEAFE',
  infoText: '#1D4ED8',

  // Neutral Scale
  neutral: {
    bg: '#FAFAFA',
    surface: '#FFFFFF',
    border: '#E4E4E7',
    muted: '#9CA3AF',
    secondary: '#6B7280',
    primary: '#111827',
  }
};

export const LIGHT_THEME = {
  bg: '#FAFAFA',
  surface: '#FFFFFF',
  border: '#E4E4E7',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  inkAction: '#1E293B',
  inkHover: '#0F172A',
  success: '#15803D',
  successBg: '#F0FDF4',
  warning: '#B45309',
  warningBg: '#FFFBEB',
  danger: '#B91C1C',
  dangerBg: '#FEF2F2',
  info: '#1D4ED8',
  infoBg: '#EFF6FF'
};

export const DARK_THEME = {
  bg: '#0B0F17',
  surface: '#151B24',
  border: '#262D38',
  textPrimary: '#F3F4F6',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  inkAction: '#E2E8F0',
  inkHover: '#F8FAFC',
  success: '#4ADE80',
  successBg: 'rgba(74,222,128,0.12)',
  warning: '#FBBF24',
  warningBg: 'rgba(251,191,36,0.12)',
  danger: '#F87171',
  dangerBg: 'rgba(248,113,113,0.12)',
  info: '#60A5FA',
  infoBg: 'rgba(96,165,250,0.12)'
};

export const CHART_PALETTE = {
  primaryInk: '#1E293B',
  verified: COLORS.verified,
  probable: COLORS.probable,
  exception: COLORS.exception,
  info: COLORS.info,
  grossNeutral: '#9CA3AF',
  gstOrange: COLORS.probable,
};

