'use client';

import { useState } from 'react';

export default function NewsletterForm({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) return;
    setDone(true);
  }

  const isLight = variant === 'light';

  if (done) {
    return <p className={`mt-4 text-sm ${isLight ? 'text-ink' : 'text-bone'}`}>Thanks — you're on the list.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className={
          isLight
            ? 'w-full border border-sandline bg-bone px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none'
            : 'w-full border border-bone/30 bg-transparent px-3 py-2.5 text-sm text-bone placeholder:text-bone/40 focus:border-bone focus:outline-none'
        }
      />
      <button
        type="submit"
        className={
          isLight
            ? 'shrink-0 border border-l-0 border-sandline bg-ink px-4 text-sm font-semibold text-bone hover:bg-indigo'
            : 'shrink-0 border border-l-0 border-bone/30 bg-bone px-4 text-sm font-semibold text-ink hover:bg-bone/90'
        }
      >
        Join
      </button>
    </form>
  );
}
