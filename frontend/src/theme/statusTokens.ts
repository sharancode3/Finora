/**
 * Finora Design Token System: Single Source of Truth for Status & Brand Colors
 * 
 * EXACT LOCKED DESIGN SYSTEM PALETTE:
 * - Page Background:     #F7F8FC
 * - Surface (Cards):      #FFFFFF
 * - Primary Text:          #0F172A
 * - Secondary Text:        #64748B
 * - Muted Text:            #94A3B8
 * - Border:                #E5E7EB
 * - Primary (Brand/AI):    #5B45F5 (Hover: #4C35E8, Soft BG: #EEEBFF)
 * - Success:               #16A34A (BG: #ECFDF3, Border: #BBF7D0)
 * - Warning:               #D97706 (BG: #FFF7ED, Border: #FED7AA)
 * - Danger:                #DC2626 (BG: #FEF2F2, Border: #FECACA)
 * - Info:                  #2563EB (BG: #EFF6FF, Border: #BFDBFE)
 */

export const PALETTE_HEX = {
  bgPage: '#F7F8FC',
  surface: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E5E7EB',
  primaryBrand: '#5B45F5',
  primaryBrandHover: '#4C35E8',
  primaryBrandSoft: '#EEEBFF',
  success: '#16A34A',
  successBg: '#ECFDF3',
  warning: '#D97706',
  warningBg: '#FFF7ED',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  info: '#2563EB',
  infoBg: '#EFF6FF',
} as const;

export const STATUS_COLORS = {
  // 1. SUCCESS (Green #16A34A / #ECFDF3): Verified / Healthy / Pass / Settled / Reconciled
  verified: {
    hex: '#16A34A',
    bgHex: '#ECFDF3',
    bg: 'bg-[#ECFDF3]',
    text: 'text-[#16A34A]',
    border: 'border-[#BBF7D0]',
    badge: 'bg-[#ECFDF3] text-[#16A34A] border border-[#BBF7D0]',
    dot: 'bg-[#16A34A]',
    solid: 'bg-[#16A34A] text-white'
  },
  
  // 2. WARNING (Amber #D97706 / #FFF7ED): Probable / Pending / Needs Review / Stale / Warning / Medium
  pending: {
    hex: '#D97706',
    bgHex: '#FFF7ED',
    bg: 'bg-[#FFF7ED]',
    text: 'text-[#D97706]',
    border: 'border-[#FED7AA]',
    badge: 'bg-[#FFF7ED] text-[#D97706] border border-[#FED7AA]',
    dot: 'bg-[#D97706]',
    solid: 'bg-[#D97706] text-white'
  },
  
  // 3. DANGER (Red #DC2626 / #FEF2F2): Exception / Critical / Failed / High Risk / Unresolved / Error / Open
  exception: {
    hex: '#DC2626',
    bgHex: '#FEF2F2',
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#DC2626]',
    border: 'border-[#FECACA]',
    badge: 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]',
    dot: 'bg-[#DC2626]',
    solid: 'bg-[#DC2626] text-white'
  },

  // 4. INFO (Blue #2563EB / #EFF6FF): Informational / Feeds / Sync status
  info: {
    hex: '#2563EB',
    bgHex: '#EFF6FF',
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#2563EB]',
    border: 'border-[#BFDBFE]',
    badge: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]',
    dot: 'bg-[#2563EB]',
    solid: 'bg-[#2563EB] text-white'
  },

  // 5. BRAND / AI (Violet #5B45F5 / #EEEBFF): Reserved EXCLUSIVELY for Fino AI intelligence & Copilot
  ai: {
    hex: '#5B45F5',
    bgHex: '#EEEBFF',
    bg: 'bg-[#EEEBFF]',
    text: 'text-[#5B45F5]',
    border: 'border-[#DDD7FE]',
    badge: 'bg-[#EEEBFF] text-[#5B45F5] border border-[#DDD7FE]',
    dot: 'bg-[#5B45F5]',
    solid: 'bg-[#5B45F5] hover:bg-[#4C35E8] text-white',
    sparkle: 'text-[#5B45F5]'
  },

  // 6. NEUTRAL (Slate #64748B / #F1F5F9): Muted metadata / Structure / Low Risk
  neutral: {
    hex: '#64748B',
    bgHex: '#F1F5F9',
    bg: 'bg-[#F1F5F9]',
    text: 'text-[#64748B]',
    border: 'border-[#E5E7EB]',
    badge: 'bg-[#F1F5F9] text-[#64748B] border border-[#E5E7EB]',
    dot: 'bg-[#94A3B8]',
    solid: 'bg-[#64748B] text-white'
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
