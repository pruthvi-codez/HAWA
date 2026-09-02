export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso.replace(' ', 'T') + 'Z').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso.replace(' ', 'T') + 'Z').toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'] as const;

export function statusBadgeClasses(status: string): string {
  switch (status) {
    case 'Delivered':
      return 'bg-okgreen/10 text-okgreen border-okgreen/30';
    case 'Shipped':
      return 'bg-indigo/10 text-indigo border-indigo/30';
    case 'Confirmed':
      return 'bg-sand text-ink border-sandline';
    case 'Cancelled':
    case 'Returned':
      return 'bg-clay/10 text-clay border-clay/30';
    default:
      return 'bg-bone text-ink/70 border-sandline';
  }
}
