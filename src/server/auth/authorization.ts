import { isValidObjectId } from 'mongoose';
import { getCurrentUser, getGateUser, type CurrentUser } from './session';
import { connectDatabase } from '@/server/db/connection';
import { OrganizerModel } from '@/server/models/organizer';
import { EventModel } from '@/server/models/event';
import { EventStaffModel } from '@/server/models/transaction-models';
import type { UserRole } from '@/constants';

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}

export async function requireRole(...roles: UserRole[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new Error('FORBIDDEN');
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  return requireRole('ADMIN');
}

export async function requireGate(): Promise<CurrentUser> {
  const user = await getGateUser();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}

export async function requireGateForEvent(eventId: string): Promise<CurrentUser> {
  if (!isValidObjectId(eventId)) throw new Error('INVALID_ID');
  const user = await requireGate();
  if (user.role === 'ADMIN') return user;
  await connectDatabase();
  const assignment = await EventStaffModel.exists({
    eventId,
    userId: user.id,
    role: 'CHECKIN',
    active: true,
  });
  if (!assignment) throw new Error('FORBIDDEN');
  return user;
}

export async function requireEventManager(eventId: string) {
  if (!isValidObjectId(eventId)) throw new Error('INVALID_ID');
  const user = await requireUser();
  if (user.isAdmin) return { user, event: await EventModel.findById(eventId) };
  await connectDatabase();
  const event = await EventModel.findById(eventId);
  if (!event) throw new Error('NOT_FOUND');
  const organizer = await OrganizerModel.findOne({
    _id: event.organizerId,
    ownerUserId: user.id,
  });
  if (!organizer) throw new Error('FORBIDDEN');
  return { user, event };
}

export function apiError(error: unknown) {
  const code = error instanceof Error ? error.message : '';
  const status =
    code === 'UNAUTHORIZED'
      ? 401
      : code === 'FORBIDDEN'
        ? 403
        : code === 'NOT_FOUND'
          ? 404
          : code === 'INVALID_ID' || code === 'VALIDATION'
            ? 400
            : code === 'EVENT_HAS_ORDERS' || code === 'QUOTA' || code === 'TIER_IN_USE'
              ? 409
              : 500;
  return Response.json(
    { error: status === 500 ? 'Terjadi kesalahan server' : code },
    { status },
  );
}
