import type { Document } from 'mongoose';

import type { IUser } from '@/lib/db/models/User';
import User from '@/lib/db/models/User';

type UserDoc = (Document & IUser) | IUser;

export async function resetIfNeeded(doc: UserDoc): Promise<IUser> {
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  if (doc.lastResetAt < todayStart) {
    const updated = await User.findOneAndUpdate(
      { visitorId: doc.visitorId, lastResetAt: { $lt: todayStart } },
      { $set: { dailyRequests: 0, dailyTokens: 0, lastResetAt: todayStart } },
      { new: true },
    );

    if (updated) {
      return updated;
    }
  }

  return doc;
}
