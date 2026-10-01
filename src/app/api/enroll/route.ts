import { NextResponse } from 'next/server';

import User from '@/lib/db/models/User';
import { connectDB } from '@/lib/mongodb';

export async function POST(): Promise<NextResponse> {
  try {
    await connectDB();

    const capEnv = process.env.DAILY_VISITOR_CAP;
    const parsed = parseInt(capEnv ?? '', 10);
    const cap = Number.isFinite(parsed) ? parsed : 100;

    const now = new Date();
    const startOfToday = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    const count = await User.countDocuments({ role: 'user', enrolledAt: { $gte: startOfToday } });

    if (count >= cap) {
      return NextResponse.json({ enrolled: false, count, cap }, { status: 200 });
    }

    const visitorId = crypto.randomUUID();

    await User.create({
      visitorId,
      enrolledAt: now,
      dailyRequests: 0,
      dailyTokens: 0,
      lastResetAt: now,
    });

    const newCount = await User.countDocuments({
      role: 'user',
      enrolledAt: { $gte: startOfToday },
    });

    return NextResponse.json({ enrolled: true, visitorId, count: newCount, cap }, { status: 200 });
  } catch (error: unknown) {
    console.error('[POST /api/enroll]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
