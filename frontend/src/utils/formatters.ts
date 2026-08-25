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
