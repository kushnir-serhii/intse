import type { NextRequest } from 'next/server';

import { createResetToken } from '@/lib/auth/passwordReset';
import { verifyOwnerSession } from '@/lib/auth/verifySession';
import User from '@/lib/db/models/User';
import { connectDB } from '@/lib/mongodb';

/**
 * Owner-only: issues a single-use, 1-hour password reset link for an account.
 * The owner emails it to the account's address by hand.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ visitorId: string }> },
): Promise<Response> {
  const session = await verifyOwnerSession(request);

  if (!session) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const { visitorId } = await context.params;
    const { token, tokenHash, expiresAt } = createResetToken();

    // Anonymous visitors have no password, so there's nothing to reset
    const result = await User.findOneAndUpdate(
      { visitorId, passwordHash: { $exists: true } },
      { $set: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: expiresAt } },
      { returnDocument: 'after' },
    ).lean();

    if (result === null) {
      return Response.json({ error: 'not_found', message: 'Account not found' }, { status: 404 });
    }

    const url = new URL('/reset-password', request.nextUrl.origin);
    url.searchParams.set('token', token);

    return Response.json({
      ok: true,
      email: result.username,
      url: url.toString(),
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error: unknown) {
    console.error('[POST /api/admin/visitors/[visitorId]/reset-link]', error);
    return Response.json({ error: 'internal_server_error' }, { status: 500 });
  }
}
