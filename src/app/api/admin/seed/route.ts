import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

import User from '@/lib/db/models/User';
import { connectDB } from '@/lib/mongodb';

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { secret, username, password } = body as Record<string, unknown>;

  if (!process.env.OWNER_SEED_SECRET) {
    return Response.json({ error: 'seed_not_configured' }, { status: 503 });
  }

  if (secret !== process.env.OWNER_SEED_SECRET) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  if (
    typeof username !== 'string' ||
    !username.trim() ||
    typeof password !== 'string' ||
    password.length < 8
  ) {
    return Response.json(
      { error: 'username and password (min 8 chars) are required' },
      { status: 400 },
    );
  }

  await connectDB();

  const existing = await User.countDocuments({ role: 'owner' });
  if (existing > 0) {
    return Response.json({ error: 'already_seeded' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    visitorId: username.trim(),
    username: username.trim(),
    passwordHash,
    role: 'owner',
  });

  return Response.json({ ok: true, username: username.trim(), role: 'owner' });
}
