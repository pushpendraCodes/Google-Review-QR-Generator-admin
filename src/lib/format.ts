import type { Currency } from '../store/api/adminDashboardApi';

/** Amounts are stored in the smallest unit (paise / cents). */
export function formatMoney(amount: number, currency: Currency = 'INR', compact = false): string {
  const value = (amount || 0) / 100;
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: compact || value >= 1000 ? 0 : 2,
    notation: compact && value >= 100000 ? 'compact' : 'standard',
  }).format(value);
}

export function apiErrorMessage(err: unknown, fallback: string): string {
  return (err as { data?: { message?: string } })?.data?.message || fallback;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value || 0);
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const units: [number, string][] = [
    [60 * 60 * 24 * 30, 'mo'],
    [60 * 60 * 24, 'd'],
    [60 * 60, 'h'],
    [60, 'm'],
  ];
  for (const [size, label] of units) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${label} ago`;
  }
  return 'just now';
}

export function formatDate(date: string | Date | null | undefined, withTime = false): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
}

export function daysUntil(date: string | Date): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

export function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}
