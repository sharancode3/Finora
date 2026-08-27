/**
 * Shared grammar & pluralization utility functions for Finora.
 */

export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : (plural || (singular + 's'));
  return count + ' ' + word;
}

export function pluralizeWord(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || (singular + 's'));
}

export function formatCurrency(amount: number, locale = 'en-IN'): string {
  return '₹' + amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatExceptionReason(reason: string): string {
  if (!reason) return 'Unknown Discrepancy';
  const r = reason.toLowerCase();
  if (r === 'fee_variance' || r === 'fee_variance_explained') return 'Fee Rate Mismatch — Contracted MDR variance';
  if (r === 'no_bank_credit_found') return 'Missing Bank Credit (Timing / Float)';
  if (r === 'possible_duplicate') return 'Possible Duplicate Entry';
  if (r === 'amount_mismatch_only' || r === 'amount_mismatch') return 'Amount Mismatch — Net credit differs from schedule';
  if (r === 'ledger_only') return 'Unsettled Order — Internal checkout without settlement';
  if (r === 'bank_only') return 'Unmatched Direct Credit — Direct bank remittance';
  if (r === 'timing_delay') return 'Timing Difference (T+2 Settlement)';
  return reason.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
