'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : ['https://picsum.photos/seed/placeholder/900/1125'];

  return (
    <div className="grid grid-cols-[64px_1fr] gap-3 sm:grid-cols-[80px_1fr]">
      <div className="flex flex-col gap-3">
        {list.map((img, i) => (
          <button
            key={img + i}
            onClick={() => setActive(i)}
            className={`relative aspect-[4/5] overflow-hidden border ${active === i ? 'border-ink' : 'border-sandline'}`}
            aria-label={`View image ${i + 1}`}
          >
            <Image src={img} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        <Image src={list[active]} alt={name} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" priority />
      </div>
    </div>
  );
}
