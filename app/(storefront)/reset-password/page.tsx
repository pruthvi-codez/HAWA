'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShell from '@/components/AuthShell';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not reset password.');
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError('Network error — please try again.');
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthShell title="Reset Password">
        <p className="text-sm text-clay">This reset link is missing a token. Please request a new one.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-sm font-semibold text-indigo hover:underline">
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password Reset">
        <p className="text-sm text-ink/70">Your password has been updated.</p>
        <button onClick={() => router.push('/login')} className="btn-primary mt-4 w-full">
          Log In
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset Password" subtitle="Choose a new password.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">New password</label>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Confirm password</label>
          <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input" />
        </div>
        {error && <p className="text-xs font-semibold text-clay">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Saving…' : 'Reset Password'}
        </button>
      </form>
    </AuthShell>
  );
}
