import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

import { MIN_PASSWORD_LENGTH, safeEqual } from '@/lib/auth/passwordReset';
import User from '@/lib/db/models/User';
import { connectDB } from '@/lib/mongodb';

// A short secret could be brute-forced through this route
const MIN_SECRET_LENGTH = 32;

/**
 * Owner self-recovery: resets the owner password with OWNER_RECOVERY_SECRET from the env.
 * The owner can't email themselves a reset link, so this is the way back in.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const configured = process.env.OWNER_RECOVERY_SECRET;
  if (!configured || configured.length < MIN_SECRET_LENGTH) {
    return Response.json({ error: 'recovery_not_configured' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { secret, username, password } = body as Record<string, unknown>;

  if (typeof secret !== 'string' || !safeEqual(secret, configured)) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  if (
    typeof username !== 'string' ||
    !username.trim() ||
    typeof password !== 'string' ||
    password.length < MIN_PASSWORD_LENGTH
  ) {
    return Response.json(
      { error: 'username and password (min 8 chars) are required' },
      { status: 400 },
    );
  }

  try {
    await connectDB();

    const passwordHash = await bcrypt.hash(password, 10);
    const trimmed = username.trim();

    const owner = await User.findOneAndUpdate(
      { role: 'owner', username: { $in: [trimmed, trimmed.toLowerCase()] } },
      {
        $set: { passwordHash, failedLoginCount: 0 },
        $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1, loginLockedUntil: 1 },
      },
    ).lean();

    if (owner === null) {
      return Response.json({ error: 'not_found' }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error: unknown) {
    console.error('[POST /api/admin/owner-recovery]', error);
    return Response.json({ error: 'internal_server_error' }, { status: 500 });
  }
}
