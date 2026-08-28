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
      return { bg: '#0C2340', text: '#0C8CE9', border: '#1E3A5F', brand: '#0C8CE9' };
    case 'kotak':
      return { bg: '#ED1C24', text: '#FFFFFF', border: '#FECDD3', brand: '#ED1C24' };
    case 'hdfc':
      return { bg: '#004C8F', text: '#FFFFFF', border: '#BAE6FD', brand: '#004C8F' };
    case 'paypal':
      return { bg: '#003087', text: '#0079C1', border: '#BAE6FD', brand: '#003087' };
    case 'cashfree':
      return { bg: '#1A1D20', text: '#F25C05', border: '#FFEDD5', brand: '#F25C05' };
    case 'stripe':
      return { bg: '#635BFF', text: '#FFFFFF', border: '#DDD6FE', brand: '#635BFF' };
    case 'icici':
      return { bg: '#90141E', text: '#F58220', border: '#FECDD3', brand: '#90141E' };
    case 'sbi':
      return { bg: '#0072BC', text: '#FFFFFF', border: '#BAE6FD', brand: '#0072BC' };
    case 'axis':
      return { bg: '#97124B', text: '#FFFFFF', border: '#FBCFE8', brand: '#97124B' };
    case 'generic_wallet':
      return { bg: '#1E293B', text: '#94A3B8', border: '#E2E8F0', brand: '#475569' };
    case 'generic_gateway':
      return { bg: '#0F172A', text: '#38BDF8', border: '#DBEAFE', brand: '#2563EB' };
    default:
      return { bg: '#0F172A', text: '#FFFFFF', border: '#E2E8F0', brand: '#334155' };
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
      // 1. RAZORPAY — Official Stylized Bold 'R' Lightning Bolt Emblem on Navy
      case 'razorpay':
        return (
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#0C2340" />
            <path
              d="M15 36L26.5 12H34L26.5 24H33.5L19 36H15Z"
              fill="#0C8CE9"
            />
            <path
              d="M26.5 24L33.5 12H26.5L18.5 28L22.5 24H26.5Z"
              fill="#3395FF"
            />
          </svg>
        );

      // 2. KOTAK MAHINDRA BANK — Official Red Infinity Loop Emblem
      case 'kotak':
        return (
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#ED1C24" />
            <path
              d="M17.5 17C14 17 11 19.8 11 24C11 28.2 14 31 17.5 31C21.5 31 23.8 28 25 26.2C26.2 28 28.5 31 32.5 31C36 31 39 28.2 39 24C39 19.8 36 17 32.5 17C28.5 17 26.2 20 25 21.8C23.8 20 21.5 17 17.5 17ZM17.5 20.8C19.8 20.8 21.4 22.8 22.8 24.5C21.4 26.2 19.8 27.2 17.5 27.2C15.8 27.2 14.5 25.8 14.5 24C14.5 22.2 15.8 20.8 17.5 20.8ZM32.5 20.8C34.2 20.8 35.5 22.2 35.5 24C35.5 25.8 34.2 27.2 32.5 27.2C30.2 27.2 28.6 26.2 27.2 24.5C28.6 22.8 30.2 20.8 32.5 20.8Z"
              fill="#FFFFFF"
            />
          </svg>
        );

      // 3. HDFC BANK — Official Blue Frame + White Core + Red Center with Blue Cross Grid
      case 'hdfc':
        return (
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#004C8F" />
            <rect x="10" y="10" width="28" height="28" rx="2" fill="#FFFFFF" />
            <rect x="18" y="18" width="12" height="12" fill="#ED1C24" />
            <rect x="22" y="10" width="4" height="28" fill="#004C8F" />
            <rect x="10" y="22" width="28" height="4" fill="#004C8F" />
          </svg>
        );

      // 4. PAYPAL — Official Dual Overlapping P Monograms
      case 'paypal':
        return (
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#003087" />
            <path
              d="M18 36L21.5 13H29.5C33.5 13 35.5 15 35 19.5C34.4 24 31.5 26.5 27.5 26.5H23.5L21.5 36H18Z"
              fill="#0079C1"
            />
            <path
              d="M22 38L25.5 16H33.5C37.5 16 39.5 18 39 22.5C38.4 27 35.5 29.5 31.5 29.5H27.5L25.5 38H22Z"
              fill="#00457C"
              opacity="0.85"
            />
            <path
              d="M22 38L25 18H32.5C36 18 37.5 19.8 37.1 23.5C36.6 27.2 34 29.5 30.5 29.5H27L25.2 38H22Z"
              fill="#0079C1"
            />
          </svg>
        );

      // 5. CASHFREE — Official Orange C Monogram
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

      // 6. STRIPE — Official Violet S Mark
      case 'stripe':
        return (
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#635BFF" />
            <path
              d="M22.5 20.8C22.5 19.6 23.5 18.8 25 18.8C26.8 18.8 28.8 19.4 30.2 20.2V15.2C28.6 14.5 26.8 14.2 25 14.2C20.2 14.2 17.2 16.8 17.2 21.2C17.2 27.8 26.5 26.6 26.5 30C26.5 31.4 25.1 32.2 23.4 32.2C21.2 32.2 18.8 31.1 17.2 30V35.2C19 36 21.4 36.5 23.5 36.5C28.5 36.5 31.8 34 31.8 29.5C31.8 22.5 22.5 23.8 22.5 20.8Z"
              fill="#FFFFFF"
            />
          </svg>
        );

      // 7. ICICI BANK — Official Maroon & Saffron i Mark
      case 'icici':
        return (
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#90141E" />
            <circle cx="24" cy="16" r="4" fill="#F58220" />
            <path d="M20 23H28V36H20V23Z" fill="#FFFFFF" rx="1" />
          </svg>
        );

      // 8. SBI (State Bank of India) — Official Blue Keyhole Roundel
      case 'sbi':
        return (
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#0072BC" />
            <circle cx="24" cy="24" r="14" fill="#FFFFFF" />
            <circle cx="24" cy="21" r="5.5" fill="#0072BC" />
            <rect x="21.5" y="21" width="5" height="15" fill="#0072BC" />
          </svg>
        );

      // 9. AXIS BANK — Official Maroon Burgundy Chevron 'A' Mark
      case 'axis':
        return (
          <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="10" fill="#97124B" />
            <path d="M24 12L13 36H20.5L24 28L27.5 36H35L24 12Z" fill="#FFFFFF" />
            <path d="M24 20L21 28H27L24 20Z" fill="#97124B" />
          </svg>
        );

      // Fallback: Clean Brand Badge
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
