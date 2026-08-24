/**
 * Finora Design Token System: Single Source of Truth for Status & Primary Ink Colors
 * 
 * EXACT LOCKED PHASE 2 MONOCHROME-PLUS-SEMANTIC PALETTE:
 * - Page Background:     #FAFAFA
 * - Surface (Cards):      #FFFFFF
 * - Primary Text:          #111827
 * - Secondary Text:        #6B7280
 * - Muted Text:            #9CA3AF
 * - Border:                #E4E4E7
 * - Primary/Ink Action:    #1E293B (Hover: #0F172A, Soft Tint: #F1F5F9, Border: #E2E8F0)
 * - Success:               #15803D (BG: #F0FDF4, Border: #BBF7D0)
 * - Warning:               #B45309 (BG: #FFFBEB, Border: #FEF3C7)
 * - Danger:                #B91C1C (BG: #FEF2F2, Border: #FECACA)
 * - Info:                  #1D4ED8 (BG: #EFF6FF, Border: #DBEAFE)
 */

export const PALETTE_HEX = {
  bgPage: '#FAFAFA',
  surface: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E4E4E7',
  primaryInk: '#1E293B',
  primaryInkHover: '#0F172A',
  primaryInkSoft: '#F1F5F9',
  primaryInkBorder: '#E2E8F0',
  success: '#15803D',
  successBg: '#F0FDF4',
  warning: '#B45309',
  warningBg: '#FFFBEB',
  danger: '#B91C1C',
  dangerBg: '#FEF2F2',
  info: '#1D4ED8',
  infoBg: '#EFF6FF',
} as const;

export const STATUS_COLORS = {
  // 1. SUCCESS (#15803D / #F0FDF4): Verified / Healthy / Pass / Settled / Reconciled
  verified: {
    hex: '#15803D',
    bgHex: '#F0FDF4',
    bg: 'bg-[#F0FDF4]',
    text: 'text-[#15803D]',
    border: 'border-[#BBF7D0]',
    badge: 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]',
    dot: 'bg-[#15803D]',
    solid: 'bg-[#15803D] text-white'
  },
  
  // 2. WARNING (#B45309 / #FFFBEB): Probable / Pending / Needs Review / Stale / Warning / Medium
  pending: {
    hex: '#B45309',
    bgHex: '#FFFBEB',
    bg: 'bg-[#FFFBEB]',
    text: 'text-[#B45309]',
    border: 'border-[#FEF3C7]',
    badge: 'bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]',
    dot: 'bg-[#B45309]',
    solid: 'bg-[#B45309] text-white'
  },
  
  // 3. DANGER (#B91C1C / #FEF2F2): Exception / Critical / Failed / High Risk / Unresolved / Error / Open
  exception: {
    hex: '#B91C1C',
    bgHex: '#FEF2F2',
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#B91C1C]',
    border: 'border-[#FECACA]',
    badge: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',
    dot: 'bg-[#B91C1C]',
    solid: 'bg-[#B91C1C] text-white'
  },

  // 4. INFO (#1D4ED8 / #EFF6FF): Informational / Feeds / Sync status
  info: {
    hex: '#1D4ED8',
    bgHex: '#EFF6FF',
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#1D4ED8]',
    border: 'border-[#DBEAFE]',
    badge: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE]',
    dot: 'bg-[#1D4ED8]',
    solid: 'bg-[#1D4ED8] text-white'
  },

  // 5. INK / PRIMARY ACTION (#1E293B / #F1F5F9): Primary Actions & Finora Intelligence
  ai: {
    hex: '#1E293B',
    bgHex: '#F1F5F9',
    bg: 'bg-[#F1F5F9]',
    text: 'text-[#1E293B]',
    border: 'border-[#E2E8F0]',
    badge: 'bg-[#F1F5F9] text-[#1E293B] border border-[#E2E8F0]',
    dot: 'bg-[#1E293B]',
    solid: 'bg-[#1E293B] hover:bg-[#0F172A] text-white',
  },

  // 6. NEUTRAL (#6B7280 / #F1F5F9): Muted metadata / Structure
  neutral: {
    hex: '#6B7280',
    bgHex: '#F1F5F9',
    bg: 'bg-[#F1F5F9]',
    text: 'text-[#6B7280]',
    border: 'border-[#E4E4E7]',
    badge: 'bg-[#F1F5F9] text-[#6B7280] border border-[#E4E4E7]',
    dot: 'bg-[#9CA3AF]',
    solid: 'bg-[#1E293B] text-white'
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
  const upper = (state || '').toUpperCase();
  if (upper === 'VERIFIED' || upper === 'RESOLVED' || upper === 'HEALTHY' || upper === 'PASS' || upper === 'SETTLED' || upper === 'MATCHED') {
    return STATUS_COLORS.verified.badge;
  }
  if (upper === 'PROBABLE' || upper === 'REVIEW REQUIRED' || upper === 'PENDING' || upper === 'IN_SUSPENSE' || upper === 'STALE' || upper === 'WARNING' || upper === 'MEDIUM' || upper === 'ACTION REQUIRED') {
    return STATUS_COLORS.pending.badge;
  }
  if (upper === 'EXCEPTION' || upper === 'UNRESOLVED' || upper === 'CRITICAL' || upper === 'HIGH' || upper === 'FAILED' || upper === 'ERROR' || upper === 'OPEN' || upper === 'ESCALATED' || upper === 'DELAYED') {
    return STATUS_COLORS.exception.badge;
  }
  if (upper === 'INFO' || upper === 'INFORMATION' || upper === 'SYNC') {
    return STATUS_COLORS.info.badge;
  }
  if (upper.includes('AI') || upper === 'COPILOT' || upper === 'FINO') {
    return STATUS_COLORS.ai.badge;
  }
  return STATUS_COLORS.neutral.badge;
}
