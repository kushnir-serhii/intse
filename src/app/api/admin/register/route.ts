import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { NextRequest } from 'next/server';

import User from '@/lib/db/models/User';
import { connectDB } from '@/lib/mongodb';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret-change-me');

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { username, password } = body as Record<string, unknown>;

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

  try {
    await connectDB();

    const existing = await User.findOne({
      $or: [{ username: username.trim() }, { visitorId: username.trim() }],
    });
    if (existing) {
      return Response.json({ error: 'username_taken' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      visitorId: username.trim(),
      username: username.trim(),
      passwordHash,
      role: 'user',
    });

    const token = await new SignJWT({ sub: user.visitorId, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const response = Response.json({ ok: true, role: user.role });

    const headers = new Headers(response.headers);
    headers.set(
      'Set-Cookie',
      `intse-session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
    );

    return new Response(response.body, { status: 201, headers });
  } catch (err) {
    console.error('[register] error:', err);
    return Response.json({ error: 'internal_error' }, { status: 500 });
  }
}
