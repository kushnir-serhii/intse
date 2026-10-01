import type { NextRequest } from 'next/server';

import { verifyOwnerSession } from '@/lib/auth/verifySession';
import User from '@/lib/db/models/User';
import { connectDB } from '@/lib/mongodb';

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

    const result = await User.findOneAndUpdate(
      { visitorId },
      { $set: { dailyRequests: 0, dailyTokens: 0, lastResetAt: new Date() } },
      { new: true },
    ).lean();

    if (result === null) {
      return Response.json({ error: 'not_found', message: 'Visitor not found' }, { status: 404 });
    }

    return Response.json({
      ok: true,
      visitorId: result.visitorId,
      dailyRequests: result.dailyRequests,
      dailyTokens: result.dailyTokens,
      lastResetAt: result.lastResetAt.toISOString(),
    });
  } catch (error: unknown) {
    console.error('[POST /api/admin/visitors/[visitorId]/reset]', error);
    return Response.json({ error: 'internal_server_error' }, { status: 500 });
  }
}
