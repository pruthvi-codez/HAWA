'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShell from '@/components/AuthShell';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not log in.');
        setSubmitting(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError('Network error — please try again.');
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Log In" subtitle="Welcome back.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
        </div>
        {error && <p className="text-xs font-semibold text-clay">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Logging in…' : 'Log In'}
        </button>
      </form>
      <div className="mt-5 flex items-center justify-between text-xs">
        <Link href="/forgot-password" className="font-semibold text-indigo hover:underline">
          Forgot password?
        </Link>
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-semibold text-indigo hover:underline">
          Create an account
        </Link>
      </div>
      <p className="mt-6 border-t border-sandline pt-4 text-xs text-ink/50">
        Demo accounts — Admin: admin@hawa.example / Admin@12345 · Customer: customer@example.com / Customer@12345
      </p>
    </AuthShell>
  );
}
