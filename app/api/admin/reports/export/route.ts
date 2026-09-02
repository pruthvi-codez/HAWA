import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { getAllOrdersFlatForExport } from '@/lib/models/reports';

function toCsvValue(v: unknown): string {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const rows = getAllOrdersFlatForExport();
  const headers = [
    'order_number',
    'created_at',
    'shipping_name',
    'shipping_phone',
    'shipping_city',
    'shipping_state',
    'status',
    'payment_method',
    'payment_status',
    'subtotal',
    'discount',
    'shipping_charge',
    'total_amount',
  ];

  const csvLines = [headers.join(',')];
  for (const row of rows) {
    csvLines.push(headers.map((h) => toCsvValue((row as any)[h])).join(','));
  }

  return new NextResponse(csvLines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="hawa-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
