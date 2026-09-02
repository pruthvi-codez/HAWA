import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { getUserByEmail, setResetToken } from '@/lib/models/users';

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  const user = getUserByEmail(parsed.data.email);

  // Always respond the same way whether or not the account exists, so this
  // endpoint can't be used to discover which emails are registered.
  const genericResponse = {
    message: 'If an account exists for that email, a password reset link has been generated.',
  };

  if (!user) {
    return NextResponse.json(genericResponse);
  }

  const token = randomBytes(24).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
  setResetToken(user.id, token, expires);

  // NOTE: No transactional email provider is wired up in this project (see
  // README — "What's simplified"). In production, email `resetUrl` to the
  // user via a provider like Resend/SendGrid instead of returning it here.
  const resetUrl = `/reset-password?token=${token}`;

  return NextResponse.json({ ...genericResponse, devResetUrl: resetUrl });
}
