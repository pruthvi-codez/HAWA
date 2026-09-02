'use client';

import { useState } from 'react';

const ROWS = [
  { size: 'S', chest: '96', length: '68', shoulder: '43' },
  { size: 'M', chest: '102', length: '70', shoulder: '45' },
  { size: 'L', chest: '108', length: '72', shoulder: '47' },
  { size: 'XL', chest: '114', length: '74', shoulder: '49' },
  { size: 'XXL', chest: '120', length: '76', shoulder: '51' },
];

export default function SizeChartModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs font-semibold uppercase tracking-wide text-indigo hover:underline">
        Size chart
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md border border-sandline bg-bone p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-black uppercase">Size Chart (cm)</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-ink/60">✕</button>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sandline text-xs uppercase text-ink/50">
                  <th className="py-2">Size</th>
                  <th className="py-2">Chest</th>
                  <th className="py-2">Length</th>
                  <th className="py-2">Shoulder</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.size} className="border-b border-sandline/60 font-mono">
                    <td className="py-2 font-semibold">{r.size}</td>
                    <td className="py-2">{r.chest}</td>
                    <td className="py-2">{r.length}</td>
                    <td className="py-2">{r.shoulder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-xs text-ink/50">Measurements are body measurements in centimetres. For bottoms, sizes reflect waist in inches.</p>
          </div>
        </div>
      )}
    </>
  );
}
