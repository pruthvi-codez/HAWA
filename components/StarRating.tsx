'use client';

export default function StarRating({
  value,
  count,
  size = 14,
  interactive = false,
  onChange,
}: {
  value: number;
  count?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {stars.map((n) => {
          const filled = n <= Math.round(value);
          return (
            <button
              key={n}
              type="button"
              disabled={!interactive}
              onClick={() => onChange?.(n)}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              className={interactive ? 'cursor-pointer' : 'cursor-default'}
            >
              <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#1C1B1A' : 'none'} stroke="#1C1B1A" strokeWidth="1.3">
                <path d="M12 3.5l2.6 5.4 5.9.7-4.3 4.1 1.1 5.9L12 16.8l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.7L12 3.5Z" strokeLinejoin="round" />
              </svg>
            </button>
          );
        })}
      </div>
      {count !== undefined && <span className="text-xs text-ink/50">({count})</span>}
    </div>
  );
}
