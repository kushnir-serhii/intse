import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { NextRequest } from 'next/server';

import { clearFailedLogins, lockMinutesLeft, registerFailedLogin } from '@/lib/auth/loginLock';
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

  if (typeof username !== 'string' || typeof password !== 'string') {
    return Response.json({ error: 'username and password are required' }, { status: 400 });
  }

  await connectDB();

  // New accounts are stored lowercase; older ones may keep their original casing
  const trimmed = username.trim();
  const user = await User.findOne({ username: { $in: [trimmed, trimmed.toLowerCase()] } });
  if (!user?.passwordHash) {
    return Response.json({ error: 'invalid_credentials' }, { status: 401 });
  }

  const minutesLeft = lockMinutesLeft(user);
  if (minutesLeft > 0) {
    return Response.json({ error: 'too_many_attempts', minutesLeft }, { status: 429 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    await registerFailedLogin(user);
    return Response.json({ error: 'invalid_credentials' }, { status: 401 });
  }

  await clearFailedLogins(user);

  const token = await new SignJWT({ sub: user.visitorId, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  const response = Response.json({ ok: true, role: user.role });

  // Set HTTP-only session cookie
  const headers = new Headers(response.headers);
  headers.set(
    'Set-Cookie',
    `intse-session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
  );

  return new Response(response.body, { status: 200, headers });
}
