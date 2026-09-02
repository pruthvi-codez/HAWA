'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
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
      if (data.user.role !== 'admin') {
        await fetch('/api/auth/logout', { method: 'POST' });
        setError('This account does not have admin access.');
        setSubmitting(false);
        return;
      }
      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError('Network error — please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm border border-bone/20 bg-ink p-8 text-bone">
        <p className="eyebrow text-bone/50">HAWA</p>
        <h1 className="mt-1 font-display text-2xl font-black uppercase">Admin Login</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-bone/70">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-bone/30 bg-transparent px-4 py-2.5 text-sm text-bone focus:border-bone focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-bone/70">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-bone/30 bg-transparent px-4 py-2.5 text-sm text-bone focus:border-bone focus:outline-none"
            />
          </div>
          {error && <p className="text-xs font-semibold text-clay">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-outline-light w-full">
            {submitting ? 'Logging in…' : 'Log In'}
          </button>
        </form>
        <p className="mt-6 border-t border-bone/20 pt-4 text-xs text-bone/40">Demo admin: admin@hawa.example / Admin@12345</p>
      </div>
    </div>
  );
}
