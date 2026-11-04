import type { HydratedDocument } from 'mongoose';

import type { IUser } from '@/lib/db/models/User';
import User from '@/lib/db/models/User';

// Stored on the user doc (not in memory) so the limit holds across serverless instances
export const MAX_FAILED_LOGINS = 5;
export const LOGIN_LOCK_MS = 15 * 60 * 1000;

/** Minutes left on the lock, or 0 when the account can try again. */
export function lockMinutesLeft(user: IUser): number {
  const until = user.loginLockedUntil?.getTime() ?? 0;
  const left = until - Date.now();
  return left > 0 ? Math.ceil(left / 60_000) : 0;
}

export async function registerFailedLogin(user: HydratedDocument<IUser>): Promise<void> {
  const count = (user.failedLoginCount ?? 0) + 1;
  if (count >= MAX_FAILED_LOGINS) {
    await User.updateOne(
      { _id: user._id },
      { $set: { failedLoginCount: 0, loginLockedUntil: new Date(Date.now() + LOGIN_LOCK_MS) } },
    );
  } else {
    await User.updateOne({ _id: user._id }, { $set: { failedLoginCount: count } });
  }
}

export async function clearFailedLogins(user: HydratedDocument<IUser>): Promise<void> {
  if (!user.failedLoginCount && !user.loginLockedUntil) return;
  await User.updateOne(
    { _id: user._id },
    { $set: { failedLoginCount: 0 }, $unset: { loginLockedUntil: 1 } },
  );
}
