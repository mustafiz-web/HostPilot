/**
 * Host Pilot — Centralized Localization & Formatting Utilities
 * Supports locale-aware dates, numbers, currency, and language detection.
 */

export function isEnglish(language?: string): boolean {
  if (!language && typeof window !== 'undefined') {
    language = localStorage.getItem('i18nextLng') || 'bn';
  }
  return !!language?.startsWith('en');
}

export function formatCurrency(amount: number, language?: string): string {
  const en = isEnglish(language);
  if (en) {
    return `৳ ${amount.toLocaleString('en-US')}`;
  }
  return `৳ ${amount.toLocaleString('bn-BD')}`;
}

export function formatDate(
  date: string | Date | number | null | undefined,
  language?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return '—';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  const en = isEnglish(language);
  const locale = en ? 'en-US' : 'bn-BD';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return d.toLocaleDateString(locale, defaultOptions);
}

export function formatNumber(num: number, language?: string): string {
  const en = isEnglish(language);
  return en ? num.toLocaleString('en-US') : num.toLocaleString('bn-BD');
}
