import { formatINR } from '@/lib/utils';

export default function Price({
  base,
  discount,
  size = 'base',
}: {
  base: number;
  discount?: number | null;
  size?: 'sm' | 'base' | 'lg';
}) {
  const priceSize = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base';
  const hasDiscount = discount !== null && discount !== undefined && discount < base;
  const pctOff = hasDiscount ? Math.round(((base - (discount as number)) / base) * 100) : 0;

  return (
    <div className="flex items-baseline gap-2 font-mono">
      <span className={`${priceSize} font-semibold text-ink`}>{formatINR(hasDiscount ? (discount as number) : base)}</span>
      {hasDiscount && (
        <>
          <span className="text-xs text-ink/40 line-through">{formatINR(base)}</span>
          <span className="text-xs font-semibold text-clay">{pctOff}% off</span>
        </>
      )}
    </div>
  );
}
