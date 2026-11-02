import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { requireGate, requireGateForEvent } from '@/server/auth/authorization';
import { connectDatabase } from '@/server/db/connection';
import { EventModel } from '@/server/models/event';
import { TicketTypeModel } from '@/server/models/ticket-type';
import { CheckinModel, EventStaffModel, OrderItemModel, OrderModel, TicketModel } from '@/server/models/transaction-models';
import { hashTicketPayload, parseTicketPayload } from '@/server/ticket-credentials';

const checkinSchema = z.object({ eventId: z.string(), payload: z.string().trim().min(1).max(500) });

export async function listGateEvents() {
  const user = await requireGate();
  await connectDatabase();
  const eventIds = user.role === 'ADMIN'
    ? await EventModel.find().distinct('_id')
    : await EventStaffModel.find({ userId: user.id, role: 'CHECKIN', active: true }).distinct('eventId');
  const events = await EventModel.find({ _id: { $in: eventIds } }).select('title startsAt endsAt venueName city').sort({ startsAt: 1 }).lean();
  return events.map((event) => ({ id: event._id.toString(), title: event.title, startsAt: event.startsAt, endsAt: event.endsAt, venueName: event.venueName, city: event.city }));
}

export async function getGateEvent(eventId: string) {
  await requireGateForEvent(eventId);
  const event = await EventModel.findById(eventId).select('title startsAt endsAt venueName city').lean();
  if (!event) throw new Error('NOT_FOUND');
  return { id: event._id.toString(), title: event.title, startsAt: event.startsAt, endsAt: event.endsAt, venueName: event.venueName, city: event.city };
}

export async function checkInTicket(input: unknown) {
  const data = checkinSchema.parse(input);
  if (!isValidObjectId(data.eventId)) throw new Error('INVALID_ID');
  const user = await requireGateForEvent(data.eventId);
  const payload = parseTicketPayload(data.payload);
  const mongoose = await connectDatabase();

  return mongoose.connection.transaction(async (session) => {
    const existing = await TicketModel.findOne({ qrTokenHash: hashTicketPayload(payload) }).session(session);
    if (!existing || existing.eventId.toString() !== data.eventId || existing.qrStatus !== 'READY' || existing.status === 'VOID') throw new Error('INVALID_TICKET');
    if (existing.status === 'USED' || existing.checkedInAt) throw new Error('ALREADY_USED');

    const checkedInAt = new Date();
    const ticket = await TicketModel.findOneAndUpdate(
      { _id: existing._id, eventId: data.eventId, status: 'ACTIVE', qrStatus: 'READY', checkedInAt: { $exists: false } },
      { $set: { status: 'USED', checkedInAt, checkedInBy: user.id } },
      { returnDocument: 'after', session },
    );
    if (!ticket) throw new Error('ALREADY_USED');
    await CheckinModel.create([{ ticketId: ticket._id, eventId: ticket.eventId, staffUserId: user.id, checkedInAt }], { session });

    const item = await OrderItemModel.findById(ticket.orderItemId).session(session).lean();
    const [order, ticketType, event] = await Promise.all([
      item ? OrderModel.findById(item.orderId).select('bookingCode').session(session).lean() : null,
      item ? TicketTypeModel.findById(item.ticketTypeId).select('name').session(session).lean() : null,
      EventModel.findById(ticket.eventId).select('title').session(session).lean(),
    ]);
    return { status: 'VALID' as const, attendeeName: ticket.attendeeName, eventTitle: event?.title ?? '-', ticketType: ticketType?.name ?? '-', bookingCode: order?.bookingCode ?? '-', checkedInAt };
  });
}

export function checkinError(error: unknown) {
  const code = error instanceof Error ? error.message : '';
  const status = code === 'UNAUTHORIZED' ? 401 : code === 'FORBIDDEN' ? 403 : code === 'NOT_FOUND' ? 404 : code === 'ALREADY_USED' ? 409 : ['INVALID_ID', 'INVALID_TICKET', 'VALIDATION'].includes(code) ? 400 : 500;
  return Response.json({ error: status === 500 ? 'Terjadi kesalahan server' : code }, { status });
}
