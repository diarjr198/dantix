import { compare, hash } from 'bcryptjs';
import { z } from 'zod';
import { requireUser } from '@/server/auth/authorization';
import { connectDatabase } from '@/server/db/connection';
import { UserModel } from '@/server/models/user';

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi').max(100),
  email: z.union([z.email('Email tidak valid'), z.literal('')]).transform((value) => value.trim().toLowerCase()),
  currentPassword: z.string().max(100).optional().default(''),
  newPassword: z.string().max(100).optional().default(''),
  confirmPassword: z.string().max(100).optional().default(''),
}).superRefine((data, context) => {
  if (data.newPassword && data.newPassword.length < 8) context.addIssue({ code: 'custom', path: ['newPassword'], message: 'Password baru minimal 8 karakter' });
  if (data.newPassword !== data.confirmPassword) context.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Konfirmasi password tidak sama' });
  if (data.confirmPassword && !data.newPassword) context.addIssue({ code: 'custom', path: ['newPassword'], message: 'Password baru wajib diisi' });
});

export async function updateProfile(input: unknown) {
  const actor = await requireUser();
  const data = profileUpdateSchema.parse(input);
  await connectDatabase();
  const user = await UserModel.findById(actor.id).select('+passwordHash');
  if (!user || user.active === false) throw new Error('UNAUTHORIZED');
  const emailChanged = data.email !== (user.email ?? '').toLowerCase();
  if (emailChanged || data.newPassword) {
    if (!data.currentPassword || !(await compare(data.currentPassword, user.passwordHash))) throw new Error('INVALID_PASSWORD');
  }
  if (emailChanged && data.email && await UserModel.exists({ email: data.email, _id: { $ne: user._id } })) throw new Error('EMAIL_TAKEN');
  user.name = data.name;
  user.email = data.email || undefined;
  if (data.newPassword) user.passwordHash = await hash(data.newPassword, 12);
  try {
    await user.save();
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) throw new Error('EMAIL_TAKEN');
    throw error;
  }
  return { id: user.id, name: user.name, email: user.email ?? '' };
}
