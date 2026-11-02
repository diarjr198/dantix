import { model, models, Schema } from 'mongoose';
import { USER_ROLES } from '@/constants';
import type { User } from '@/types/models';
import type { UserRole } from '@/constants';

export function effectiveUserRole(user: { isAdmin: boolean; role?: UserRole }) {
  if (user.isAdmin) return 'ADMIN' as const;
  return user.role ?? 'CUSTOMER';
}
import { requiredString } from '@/lib/validators';

const userSchema = new Schema<User>(
  {
    name: requiredString,
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: { type: String, trim: true },
    passwordHash: { ...requiredString, select: false },
    isAdmin: { type: Boolean, default: false },
    role: { type: String, enum: USER_ROLES, default: 'CUSTOMER' },
    active: { type: Boolean, default: true },
  },
  { collection: 'users', timestamps: true },
);

userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string' } } },
);
userSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: 'string' } } },
);

export const UserModel = models.User || model<User>('User', userSchema);
