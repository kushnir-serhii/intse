import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

import { hashResetToken, MIN_PASSWORD_LENGTH } from '@/lib/auth/passwordReset';
import User from '@/lib/db/models/User';
import { connectDB } from '@/lib/mongodb';

/** Public: sets a new password using a reset link token issued by the owner. */
export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { token, password } = body as Record<string, unknown>;

  if (typeof token !== 'string' || !token) {
    return Response.json({ error: 'invalid_token' }, { status: 400 });
  }

  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return Response.json({ error: 'password_too_short' }, { status: 400 });
  }

  try {
    await connectDB();

    const passwordHash = await bcrypt.hash(password, 10);

    // Atomic match-and-clear: the token can only ever be used once
    const user = await User.findOneAndUpdate(
      {
        passwordResetTokenHash: hashResetToken(token),
        passwordResetExpiresAt: { $gt: new Date() },
      },
      {
        $set: { passwordHash, failedLoginCount: 0 },
        $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1, loginLockedUntil: 1 },
      },
      { returnDocument: 'after' },
    ).lean();

    if (user === null) {
      return Response.json({ error: 'invalid_token' }, { status: 400 });
    }

    // Returned so the page can hand both to the browser's password manager
    return Response.json({ ok: true, username: user.username });
  } catch (error: unknown) {
    console.error('[POST /api/admin/reset-password]', error);
    return Response.json({ error: 'internal_server_error' }, { status: 500 });
  }
}
