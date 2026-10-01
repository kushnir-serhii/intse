import mongoose, { Model, Schema } from 'mongoose';

export type DbUserRole = 'owner' | 'user';

/**
 * One collection for everyone. Anonymous visitors are `user` docs without
 * credentials; accounts (owner, registered users) also carry username + passwordHash
 * and use their username as visitorId.
 */
export interface IUser {
  visitorId: string;
  role: DbUserRole;
  username?: string;
  passwordHash?: string;
  enrolledAt: Date;
  dailyRequests: number;
  dailyTokens: number;
  lastResetAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    visitorId: { type: String, required: true, unique: true, trim: true },
    role: { type: String, enum: ['owner', 'user'], required: true, default: 'user' },
    username: { type: String, trim: true, unique: true, sparse: true },
    passwordHash: { type: String },
    enrolledAt: { type: Date, required: true, default: Date.now },
    dailyRequests: { type: Number, min: 0, default: 0 },
    dailyTokens: { type: Number, min: 0, default: 0 },
    lastResetAt: { type: Date, required: true, default: Date.now },
  },
  {
    collection: 'users',
  },
);

UserSchema.index({ enrolledAt: 1 });

// Delete cached model so schema changes are picked up on hot-reload in dev
delete (mongoose.models as Record<string, unknown>).User;

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;
