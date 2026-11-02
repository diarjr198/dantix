import { hash } from 'bcryptjs';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { USER_ROLES } from '@/constants';
import { requireAdmin } from '@/server/auth/authorization';
import { connectDatabase } from '@/server/db/connection';
import { EventStaffModel } from '@/server/models/transaction-models';
import { UserModel } from '@/server/models/user';

const contact = z.string().trim().max(100).optional().transform((value) => value || undefined);
const userFields = z.object({ name: z.string().trim().min(1).max(100), email: z.email().optional().or(z.literal('')).transform((value) => value || undefined), phone: contact, password: z.string().min(8).max(100), role: z.enum(USER_ROLES).default('CUSTOMER'), active: z.boolean().default(true) });
export const userCreateSchema = userFields.refine((input) => input.email || input.phone, 'Email atau nomor HP wajib diisi');
export const userUpdateSchema = userFields.partial().refine((input) => Object.keys(input).length > 0, 'Tidak ada perubahan');

function serialize(user: Record<string, unknown>) { return { id: user._id?.toString(), name: user.name, email: user.email ?? '', phone: user.phone ?? '', role: user.isAdmin ? 'ADMIN' : user.role ?? 'CUSTOMER', active: user.active !== false, createdAt: user.createdAt }; }

export async function listAdminUsers() { await requireAdmin(); await connectDatabase(); return (await UserModel.find().select('name email phone isAdmin role active createdAt').sort({ createdAt: -1 }).lean()).map((user) => serialize(user as unknown as Record<string, unknown>)); }
export async function createAdminUser(input: unknown) { await requireAdmin(); const data = userCreateSchema.parse(input); await connectDatabase(); const user = await UserModel.create({ ...data, passwordHash: await hash(data.password, 10), isAdmin: data.role === 'ADMIN' }); return serialize(user.toObject() as Record<string, unknown>); }
export async function updateAdminUser(actorId: string, id: string, input: unknown) { await requireAdmin(); if (!isValidObjectId(id)) throw new Error('INVALID_ID'); const data = userUpdateSchema.parse(input); if (id === actorId && (data.active === false || (data.role && data.role !== 'ADMIN'))) throw new Error('SELF_PROTECTED'); await connectDatabase(); const user = await UserModel.findById(id); if (!user) throw new Error('NOT_FOUND'); if ((user.isAdmin || user.role === 'ADMIN') && (data.active === false || data.role && data.role !== 'ADMIN')) { const admins = await UserModel.countDocuments({ $or: [{ isAdmin: true }, { role: 'ADMIN' }], active: { $ne: false } }); if (admins <= 1) throw new Error('LAST_ADMIN'); }
  if (data.password) user.passwordHash = await hash(data.password, 10);
  if (data.name) user.name = data.name;
  if ('email' in data) user.email = data.email;
  if ('phone' in data) user.phone = data.phone;
  if ('active' in data) user.active = data.active;
  if (data.role) { user.role = data.role; user.isAdmin = data.role === 'ADMIN'; }
  await user.save(); return serialize(user.toObject() as Record<string, unknown>); }
export async function setGateAssignment(userId: string, eventId: string, active: boolean) { await requireAdmin(); if (!isValidObjectId(userId) || !isValidObjectId(eventId)) throw new Error('INVALID_ID'); await connectDatabase(); const user = await UserModel.findById(userId).select('role isAdmin active'); if (!user || user.active === false || user.isAdmin || user.role !== 'GATE') throw new Error('VALIDATION'); await EventStaffModel.findOneAndUpdate({ userId, eventId }, { $set: { role: 'CHECKIN', active } }, { upsert: true, new: true, setDefaultsOnInsert: true }); }
export async function listGateAssignments(userId: string) { await requireAdmin(); if (!isValidObjectId(userId)) throw new Error('INVALID_ID'); await connectDatabase(); return (await EventStaffModel.find({ userId, role: 'CHECKIN' }).lean()).map((item) => ({ id: item._id.toString(), eventId: item.eventId.toString(), active: item.active })); }
export async function listAllGateAssignments() { await requireAdmin(); await connectDatabase(); return (await EventStaffModel.find({ role: 'CHECKIN', active: true }).lean()).map((item) => ({ userId: item.userId.toString(), eventId: item.eventId.toString() })); }
