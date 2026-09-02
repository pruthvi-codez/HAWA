'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ContactForm() {
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="border border-sandline p-6 text-sm">
        <p className="font-semibold text-okgreen">Thanks, {name.split(' ')[0] || 'there'} — your message has been received.</p>
        <p className="mt-2 text-ink/60">We usually reply within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Subject</label>
        <input required value={subject} onChange={(e) => setSubject(e.target.value)} className="input" />
      </div>
      <div>
        <label className="label">Message</label>
        <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="input" />
      </div>
      <button type="submit" className="btn-primary">Send Message</button>
    </form>
  );
}
