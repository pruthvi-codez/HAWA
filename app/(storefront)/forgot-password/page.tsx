'use client';

import Link from 'next/link';
import { useState } from 'react';
import AuthShell from '@/components/AuthShell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message);
      setDevResetUrl(data.devResetUrl || null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Forgot Password" subtitle="We'll help you get back in.">
      {message ? (
        <div className="space-y-4">
          <p className="text-sm text-ink/70">{message}</p>
          {devResetUrl && (
            <div className="border border-dashed border-sandline p-3 text-xs text-ink/60">
              <p className="mb-1 font-semibold text-ink">Dev mode — no email provider configured</p>
              <p>
                Since this project doesn&rsquo;t have a transactional email service wired up, here&rsquo;s your reset link directly:{' '}
                <Link href={devResetUrl} className="font-semibold text-indigo hover:underline">
                  Reset your password
                </Link>
              </p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
      )}
      <p className="mt-5 text-center text-xs">
        <Link href="/login" className="font-semibold text-indigo hover:underline">
          Back to login
        </Link>
      </p>
    </AuthShell>
  );
}
