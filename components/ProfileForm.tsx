'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileForm({ initial }: { initial: { name: string; email: string; phone: string } }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSaved(false);
    setSavingProfile(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || 'Could not update profile.');
        return;
      }
      setProfileSaved(true);
      router.refresh();
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSaved(false);
    setSavingPassword(true);
    try {
      const res = await fetch('/api/account/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || 'Could not update password.');
        return;
      }
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
    } finally {
      setSavingPassword(false);
    }
  }

  async function deactivate() {
    await fetch('/api/account/deactivate', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <form onSubmit={saveProfile} className="max-w-md space-y-4 border border-sandline p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Profile Details</h2>
        <div>
          <label className="label">Full name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
        </div>
        {profileError && <p className="text-xs font-semibold text-clay">{profileError}</p>}
        {profileSaved && <p className="text-xs font-semibold text-okgreen">Profile updated.</p>}
        <button type="submit" disabled={savingProfile} className="btn-primary">
          {savingProfile ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <form onSubmit={savePassword} className="max-w-md space-y-4 border border-sandline p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Change Password</h2>
        <div>
          <label className="label">Current password</label>
          <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">New password</label>
          <input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" />
        </div>
        {passwordError && <p className="text-xs font-semibold text-clay">{passwordError}</p>}
        {passwordSaved && <p className="text-xs font-semibold text-okgreen">Password updated.</p>}
        <button type="submit" disabled={savingPassword} className="btn-primary">
          {savingPassword ? 'Saving…' : 'Update Password'}
        </button>
      </form>

      <div className="max-w-md border border-clay/40 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-clay">Deactivate Account</h2>
        <p className="mt-2 text-sm text-ink/60">This will log you out and deactivate your account. Contact support to reactivate.</p>
        {!confirmDeactivate ? (
          <button onClick={() => setConfirmDeactivate(true)} className="btn-secondary mt-4 !border-clay !text-clay hover:!bg-clay hover:!text-bone">
            Deactivate Account
          </button>
        ) : (
          <div className="mt-4 flex gap-3">
            <button onClick={deactivate} className="btn text-bone bg-clay hover:bg-clay/90">
              Yes, deactivate
            </button>
            <button onClick={() => setConfirmDeactivate(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
