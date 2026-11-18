/**
 * Standard utility helpers for formatting currency, dates, and strings across CampusKart
 */

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatPaise(paise: number): string {
  if (isNaN(paise) || paise === null || paise === undefined) return '₹0.00';
  return `₹${(paise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function truncate(str: string, maxLen: number = 60): string {
  if (!str) return '';
  return str.length > maxLen ? `${str.slice(0, maxLen)}...` : str;
}
