import React from 'react';

export type InstitutionType = 
  | 'razorpay'
  | 'kotak'
  | 'hdfc'
  | 'paypal'
  | 'cashfree'
  | 'stripe'
  | 'icici'
  | 'sbi'
  | 'axis'
  | 'generic_bank'
  | 'generic_gateway'
  | 'generic_wallet';

export interface InstitutionLogoProps {
  name?: string;
  type?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  showName?: boolean;
}

/**
 * Normalizes input name/type string to recognized institution type key.
 */
export function getInstitutionKey(nameOrType: string = ''): InstitutionType {
  const str = nameOrType.toLowerCase();
  if (str.includes('razorpay') || str.includes('rzp')) return 'razorpay';
  if (str.includes('kotak') || str.includes('kkbk')) return 'kotak';
  if (str.includes('hdfc')) return 'hdfc';
  if (str.includes('paypal') || str.includes('pay_pal')) return 'paypal';
  if (str.includes('cashfree')) return 'cashfree';
  if (str.includes('stripe')) return 'stripe';
  if (str.includes('icici')) return 'icici';
  if (str.includes('sbi') || str.includes('state bank')) return 'sbi';
  if (str.includes('axis')) return 'axis';
  if (str.includes('wallet')) return 'generic_wallet';
  if (str.includes('gateway') || str.includes('payment_gateway')) return 'generic_gateway';
  return 'generic_bank';
}

export function getInstitutionColor(key: InstitutionType): { bg: string; text: string; border: string; brand: string } {
  switch (key) {
    case 'razorpay':
      return { bg: '#EFF6FF', text: '#0B72E7', border: '#BFDBFE', brand: '#0B72E7' };
    case 'kotak':
      return { bg: '#FFF1F2', text: '#ED1C24', border: '#FECDD3', brand: '#ED1C24' };
    case 'hdfc':
      return { bg: '#F0F7FF', text: '#004B87', border: '#BAE6FD', brand: '#004B87' };
    case 'paypal':
      return { bg: '#F0F9FF', text: '#003087', border: '#BAE6FD', brand: '#003087' };
    case 'cashfree':
      return { bg: '#FFF7ED', text: '#EA580C', border: '#FFEDD5', brand: '#F25C05' };
    case 'stripe':
      return { bg: '#F5F3FF', text: '#635BFF', border: '#DDD6FE', brand: '#635BFF' };
    case 'icici':
      return { bg: '#FFF1F2', text: '#A32323', border: '#FECDD3', brand: '#A32323' };
    case 'sbi':
      return { bg: '#F0F9FF', text: '#0072BC', border: '#BAE6FD', brand: '#0072BC' };
    case 'axis':
      return { bg: '#FDF2F8', text: '#97144D', border: '#FBCFE8', brand: '#97144D' };
    case 'generic_wallet':
      return { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0', brand: '#475569' };
    case 'generic_gateway':
      return { bg: '#EFF6FF', text: '#2563EB', border: '#DBEAFE', brand: '#2563EB' };
    default:
      return { bg: '#F8FAFC', text: '#334155', border: '#E2E8F0', brand: '#334155' };
  }
}

export const InstitutionLogo: React.FC<InstitutionLogoProps> = ({
  name = '',
  type = '',
  size = 'md',
  className = '',
  showName = false,
}) => {
  const institutionKey = getInstitutionKey(name || type);
  const colors = getInstitutionColor(institutionKey);

  // Size mapping
  let dimPx = 36;
  if (typeof size === 'number') {
    dimPx = size;
  } else {
    switch (size) {
      case 'xs': dimPx = 18; break;
      case 'sm': dimPx = 24; break;
      case 'md': dimPx = 36; break;
      case 'lg': dimPx = 44; break;
      case 'xl': dimPx = 52; break;
    }
  }

  const renderSvg = () => {
    switch (institutionKey) {
      // 1. RAZORPAY — Official Stylized Bold 'R' Lightning Bolt Emblem
      case 'razorpay':
        return (
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#0C2340" />
            <path
              d="M14 36L25.5 12H34L26 24H33.5L19 36H14Z"
              fill="#0B72E7"
            />
            <path
              d="M26 24L33.5 12H25.5L18 27.5L22 24H26Z"
              fill="#0284C7"
            />
          </svg>
        );

      // 2. KOTAK MAHINDRA BANK — Official Red Infinity Loop
      case 'kotak':
        return (
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#ED1C24" />
            <path
              d="M18 16C14.686 16 12 18.686 12 22C12 25.314 14.686 28 18 28C21.314 28 23 25.5 24 24C25 22.5 26.686 20 30 20C33.314 20 36 22.686 36 26C36 29.314 33.314 32 30 32C26.686 32 25 29.5 24 28C23 26.5 21.314 24 18 24"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      // 3. HDFC BANK — Official Blue Frame + Red Central Box with White Cross Grid
      case 'hdfc':
        return (
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#004B87" />
            <rect x="12" y="12" width="24" height="24" rx="2" fill="#FFFFFF" />
            <rect x="17" y="17" width="14" height="14" fill="#ED1C24" />
            <rect x="22" y="14" width="4" height="20" fill="#004B87" />
            <rect x="14" y="22" width="20" height="4" fill="#004B87" />
          </svg>
        );

      // 4. PAYPAL — Official Dual Overlapping P Monograms
      case 'paypal':
        return (
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#003087" />
            <path
              d="M17 35L20.5 13H28.5C32.5 13 34.5 15 34 19C33.4 23.5 30.5 26 26.5 26H22.5L20.5 35H17Z"
              fill="#0079C1"
            />
            <path
              d="M21 38L24.5 16H32.5C36.5 16 38.5 18 38 22C37.4 26.5 34.5 29 30.5 29H26.5L24.5 38H21Z"
              fill="#00457C"
            />
            <path
              d="M21 38L24 19H31.5C35 19 36.5 20.8 36.1 24.3C35.6 28 33 30.2 29.5 30.2H26L24.2 38H21Z"
              fill="#0079C1"
            />
          </svg>
        );

      // 5. CASHFREE
      case 'cashfree':
        return (
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#1A1D20" />
            <path
              d="M14 24C14 17.5 18.5 13 25 13C29.5 13 33 15.5 34 19.5H28C27.5 17.8 26.3 17 25 17C21 17 18.5 20 18.5 24C18.5 28 21 31 25 31C26.3 31 27.5 30.2 28 28.5H34C33 32.5 29.5 35 25 35C18.5 35 14 30.5 14 24Z"
              fill="#F25C05"
            />
          </svg>
        );

      // 6. STRIPE
      case 'stripe':
        return (
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#635BFF" />
            <path
              d="M22.5 21C22.5 19.8 23.5 19 25 19C26.8 19 28.8 19.6 30 20.4V15.5C28.5 14.8 26.8 14.5 25 14.5C20.5 14.5 17.5 17 17.5 21.2C17.5 27.8 26.5 26.8 26.5 30C26.5 31.4 25.2 32.2 23.5 32.2C21.5 32.2 19 31.2 17.5 30.2V35.4C19.2 36.2 21.5 36.6 23.5 36.6C28.2 36.6 31.5 34.2 31.5 29.8C31.5 22.8 22.5 24 22.5 21Z"
              fill="#FFFFFF"
            />
          </svg>
        );

      // 7. ICICI BANK
      case 'icici':
        return (
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#A32323" />
            <circle cx="24" cy="17" r="4" fill="#F37021" />
            <path d="M21 24H27V35H21V24Z" fill="#FFFFFF" />
          </svg>
        );

      // 8. SBI (State Bank of India)
      case 'sbi':
        return (
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#0072BC" />
            <circle cx="24" cy="24" r="14" fill="#FFFFFF" />
            <circle cx="24" cy="24" r="7" fill="#0072BC" />
            <rect x="22" y="24" width="4" height="12" fill="#FFFFFF" />
          </svg>
        );

      // 9. AXIS BANK
      case 'axis':
        return (
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#97144D" />
            <path d="M24 13L13 35H20L24 26L28 35H35L24 13Z" fill="#FFFFFF" />
          </svg>
        );

      // Fallback: Accurate Brand-Colored Initials Badge
      default: {
        const displayLetters = (name || type || 'BK')
          .split(/[\s—_\-]+/)
          .map(w => w[0])
          .filter(Boolean)
          .slice(0, 2)
          .join('')
          .toUpperCase();

        return (
          <div 
            className="w-full h-full rounded-xl flex items-center justify-center font-bold font-mono text-white text-[11px] select-none"
            style={{ backgroundColor: colors.brand }}
          >
            {displayLetters}
          </div>
        );
      }
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div 
        style={{ width: `${dimPx}px`, height: `${dimPx}px`, minWidth: `${dimPx}px`, minHeight: `${dimPx}px` }}
        className="rounded-xl overflow-hidden shadow-2xs shrink-0 flex items-center justify-center"
      >
        {renderSvg()}
      </div>
      {showName && (
        <span className="font-semibold text-slate-800 text-xs">
          {name || type}
        </span>
      )}
    </div>
  );
};
