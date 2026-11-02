import { randomBytes } from 'node:crypto';
import { createTicketCredential, decryptTicketCredential } from '@/server/ticket-credentials';
import { isValidObjectId } from 'mongoose';
import { connectDatabase } from '@/server/db/connection';
import { EventModel } from '@/server/models/event';
import { OrganizerModel } from '@/server/models/organizer';
import { TicketTypeModel } from '@/server/models/ticket-type';
import {
  OrderItemModel,
  OrderModel,
  PaymentModel,
  TicketModel,
} from '@/server/models/transaction-models';
import type { CurrentUser } from '@/server/auth/session';

export type Participant = {
  name: string;
  email: string;
  phone: string;
  domicile: string;
  identityNumber: string;
};
export type OrderInput = {
  eventId: string;
  quantities: Record<string, number>;
  contact: { name: string; email: string; phone: string };
  participants: Participant[];
};

const bookingCode = () =>
  `TT-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`;
const clean = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

function validateInput(input: OrderInput) {
  if (!input || !isValidObjectId(input.eventId)) throw new Error('INVALID_ID');
  if (!input.contact || !Array.isArray(input.participants))
    throw new Error('VALIDATION');
  const contact = {
    name: clean(input.contact.name),
    email: clean(input.contact.email).toLowerCase(),
    phone: clean(input.contact.phone),
  };
  if (Object.values(contact).some((value) => !value))
    throw new Error('VALIDATION');
  const participants = input.participants.map((participant) => ({
    name: clean(participant?.name),
    email: clean(participant?.email).toLowerCase(),
    phone: clean(participant?.phone),
    domicile: clean(participant?.domicile),
    identityNumber: clean(participant?.identityNumber),
  }));
  if (
    participants.some((participant) =>
      Object.values(participant).some((value) => !value),
    )
  )
    throw new Error('VALIDATION');
  const selections = Object.entries(input.quantities ?? {}).filter(
    ([id, quantity]) =>
      isValidObjectId(id) && Number.isInteger(quantity) && quantity > 0,
  );
  if (!selections.length || selections.length !== Object.keys(input.quantities ?? {}).length)
    throw new Error('VALIDATION');
  return { contact, participants, selections };
}

export async function createPendingOrder(user: CurrentUser, input: OrderInput) {
  const { contact, participants, selections } = validateInput(input);
  const mongoose = await connectDatabase();
  return mongoose.connection.transaction(async (session) => {
    const now = new Date();
    const event = await EventModel.findOne({
      _id: input.eventId,
      status: 'PUBLISHED',
      moderationStatus: 'APPROVED',
      endsAt: { $gt: now },
    }).session(session);
    if (!event) throw new Error('NOT_FOUND');

    const ticketTypes = await TicketTypeModel.find({
      _id: { $in: selections.map(([id]) => id) },
      eventId: event._id,
      salesStartAt: { $lte: now },
      salesEndAt: { $gte: now },
    }).session(session);
    if (ticketTypes.length !== selections.length) throw new Error('VALIDATION');
    const byId = new Map(ticketTypes.map((ticket) => [ticket.id, ticket]));
    const items = selections.map(([id, quantity]) => {
      const ticket = byId.get(id);
      if (!ticket || quantity > ticket.maxPerOrder) throw new Error('QUOTA');
      return { ticket, quantity };
    });
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    if (participants.length !== totalCount) throw new Error('VALIDATION');

    for (const item of items) {
      const result = await TicketTypeModel.updateOne(
        {
          _id: item.ticket._id,
          $expr: {
            $lte: [
              { $add: ['$reservedQuantity', '$soldQuantity', item.quantity] },
              '$quota',
            ],
          },
        },
        { $inc: { reservedQuantity: item.quantity } },
        { session },
      );
      if (result.modifiedCount !== 1) throw new Error('QUOTA');
    }

    let participantIndex = 0;
    const participantSnapshots = items.flatMap((item) =>
      Array.from({ length: item.quantity }, () => ({
        ...participants[participantIndex++],
        ticketTypeId: item.ticket._id,
      })),
    );
    const subtotal = items.reduce(
      (sum, item) => sum + item.ticket.price * item.quantity,
      0,
    );
    const [order] = await OrderModel.create(
      [
        {
          userId: user.id,
          eventId: event._id,
          bookingCode: bookingCode(),
          contactName: contact.name,
          contactEmail: contact.email,
          contactPhone: contact.phone,
          subtotal,
          discount: 0,
          tax: 0,
          serviceFee: 0,
          paymentFee: 0,
          total: subtotal,
          status: 'PENDING',
          expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
          participants: participantSnapshots,
        },
      ],
      { session },
    );
    await OrderItemModel.create(
      items.map((item) => ({
        orderId: order._id,
        eventId: event._id,
        ticketTypeId: item.ticket._id,
        quantity: item.quantity,
        unitPrice: item.ticket.price,
        lineTotal: item.ticket.price * item.quantity,
      })),
      { session },
    );
    return {
      id: order.id,
      bookingCode: order.bookingCode,
      status: order.status,
      total: order.total,
      expiresAt: order.expiresAt.toISOString(),
    };
  });
}

async function expireOrder(orderId: string) {
  const mongoose = await connectDatabase();
  return mongoose.connection.transaction(async (session) => {
    const order = await OrderModel.findOneAndUpdate(
      { _id: orderId, status: 'PENDING', expiresAt: { $lte: new Date() } },
      { $set: { status: 'EXPIRED' } },
      { returnDocument: 'after', session },
    );
    if (!order) return false;
    const items = await OrderItemModel.find({ orderId: order._id }).session(session);
    for (const item of items) {
      await TicketTypeModel.updateOne(
        { _id: item.ticketTypeId, reservedQuantity: { $gte: item.quantity } },
        { $inc: { reservedQuantity: -item.quantity } },
        { session },
      );
    }
    return true;
  });
}

export async function listUserOrders(userId: string) {
  await connectDatabase();
  const expired = await OrderModel.find({
    userId,
    status: 'PENDING',
    expiresAt: { $lte: new Date() },
  }).select('_id');
  await Promise.all(expired.map((order) => expireOrder(order.id)));
  return OrderModel.find({ userId })
    .select('-participants.identityNumber')
    .sort({ createdAt: -1 })
    .lean();
}

async function canManageOrder(user: CurrentUser, eventId: string) {
  if (user.isAdmin) return true;
  const event = await EventModel.findById(eventId).select('organizerId');
  if (!event) return false;
  return Boolean(
    await OrganizerModel.exists({
      _id: event.organizerId,
      ownerUserId: user.id,
    }),
  );
}

export async function confirmOrderPayment(user: CurrentUser, orderId: string) {
  if (!isValidObjectId(orderId)) throw new Error('INVALID_ID');
  const mongoose = await connectDatabase();
  const existing = await OrderModel.findById(orderId);
  if (!existing) throw new Error('NOT_FOUND');
  if (!(await canManageOrder(user, existing.eventId.toString())))
    throw new Error('FORBIDDEN');
  if (existing.status === 'PAID') return { id: existing.id, status: 'PAID' };
  if (existing.status !== 'PENDING') throw new Error('INVALID_STATUS');
  if (existing.expiresAt <= new Date()) {
    await expireOrder(orderId);
    throw new Error('EXPIRED');
  }

  return mongoose.connection.transaction(async (session) => {
    const paidAt = new Date();
    const order = await OrderModel.findOneAndUpdate(
      { _id: orderId, status: 'PENDING', expiresAt: { $gt: paidAt } },
      { $set: { status: 'PAID', paidAt } },
      { returnDocument: 'after', session },
    ).select('+participants.identityNumber');
    if (!order) {
      const current = await OrderModel.findById(orderId).session(session);
      if (current?.status === 'PAID') return { id: current.id, status: 'PAID' };
      throw new Error('INVALID_STATUS');
    }
    const items = await OrderItemModel.find({ orderId: order._id }).session(session);
    const itemByTicketType = new Map(
      items.map((item) => [item.ticketTypeId.toString(), item]),
    );
    for (const item of items) {
      const result = await TicketTypeModel.updateOne(
        { _id: item.ticketTypeId, reservedQuantity: { $gte: item.quantity } },
        { $inc: { reservedQuantity: -item.quantity, soldQuantity: item.quantity } },
        { session },
      );
      if (result.modifiedCount !== 1) throw new Error('INVENTORY');
    }
    await PaymentModel.create(
      [
        {
          orderId: order._id,
          provider: 'MANUAL',
          providerReference: order.bookingCode,
          method: 'MANUAL_CONFIRMATION',
          amount: order.total,
          status: 'SUCCEEDED',
          paidAt,
        },
      ],
      { session },
    );
    const sequences = new Map<string, number>();
    await TicketModel.create(
      order.participants.map((participant: Participant & { ticketTypeId: typeof items[number]['ticketTypeId'] }) => {
        const ticketTypeId = participant.ticketTypeId.toString();
        const item = itemByTicketType.get(ticketTypeId);
        if (!item) throw new Error('INVENTORY');
        const sequence = (sequences.get(ticketTypeId) ?? 0) + 1;
        sequences.set(ticketTypeId, sequence);
        const credential = createTicketCredential();
        return {
          orderItemId: item._id,
          eventId: order.eventId,
          ticketSequence: sequence,
          attendeeName: participant.name,
          attendeeEmail: participant.email,
          attendeePhone: participant.phone,
          attendeeDomicile: participant.domicile,
          attendeeIdentityNumber: participant.identityNumber,
          qrTokenHash: credential.hash,
          qrTokenCiphertext: credential.ciphertext,
          qrTokenIv: credential.iv,
          qrTokenAuthTag: credential.authTag,
          qrIssuedAt: paidAt,
          qrStatus: 'READY',
          status: 'ACTIVE',
          issuedAt: paidAt,
        };
      }),
      { session },
    );
    return { id: order.id, status: 'PAID' };
  });
}

async function managedEventIds(user: CurrentUser) {
  const eventFilter = user.isAdmin
    ? {}
    : {
        organizerId: {
          $in: await OrganizerModel.find({ ownerUserId: user.id }).distinct('_id'),
        },
      };
  return EventModel.find(eventFilter).distinct('_id');
}

export async function listManagerOrders(user: CurrentUser, page = 1, pageSize = 10) {
  await connectDatabase();
  const eventIds = await managedEventIds(user);
  const query = { eventId: { $in: eventIds } };
  const total = await OrderModel.countDocuments(query);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), pages);
  const orders = await OrderModel.find(query)
    .select('-participants.identityNumber')
    .sort({ createdAt: -1, _id: -1 })
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .lean();
  const events = await EventModel.find({ _id: { $in: eventIds } })
    .select('title organizerId')
    .lean();
  const [organizers, payments] = await Promise.all([
    OrganizerModel.find({ _id: { $in: events.map((event) => event.organizerId) } })
      .select('name')
      .lean(),
    PaymentModel.find({ orderId: { $in: orders.map((order) => order._id) } })
      .sort({ createdAt: -1 })
      .lean(),
  ]);
  const eventById = new Map(events.map((event) => [event._id.toString(), event]));
  const organizerById = new Map(organizers.map((organizer) => [organizer._id.toString(), organizer]));
  const paymentByOrder = new Map<string, typeof payments[number]>();
  for (const payment of payments) {
    const orderId = payment.orderId.toString();
    if (!paymentByOrder.has(orderId)) paymentByOrder.set(orderId, payment);
  }
  const serializedOrders = orders.map((order) => {
    const event = eventById.get(order.eventId.toString());
    const organizer = event ? organizerById.get(event.organizerId.toString()) : undefined;
    const payment = paymentByOrder.get(order._id.toString());
    return {
    id: order._id.toString(),
    bookingCode: order.bookingCode,
    contactName: order.contactName,
    contactEmail: order.contactEmail,
      eventTitle: event?.title ?? '-',
      organizer: organizer
        ? { id: organizer._id.toString(), name: organizer.name }
        : null,
      total: order.total,
      status: order.status,
      expiresAt: order.expiresAt,
      createdAt: order.createdAt,
      payment: payment
        ? {
            status: payment.status,
            method: payment.method,
            reference: payment.providerReference,
            paidAt: payment.paidAt ?? null,
          }
        : null,
    };
  });
  return { orders: serializedOrders, total, pages, page: currentPage };
}

export async function managerOrderSummary(user: CurrentUser) {
  await connectDatabase();
  const eventIds = await managedEventIds(user);
  const [total, paid] = await Promise.all([
    OrderModel.countDocuments({ eventId: { $in: eventIds } }),
    OrderModel.aggregate([
      { $match: { eventId: { $in: eventIds }, status: 'PAID' } },
      { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
    ]),
  ]);
  return { total, paid: paid[0]?.count ?? 0, revenue: paid[0]?.revenue ?? 0 };
}

export async function listManagerTickets(user: CurrentUser, page = 1, pageSize = 10) {
  await connectDatabase();
  const eventIds = await managedEventIds(user);
  const query = { eventId: { $in: eventIds } };
  const total = await TicketModel.countDocuments(query);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), pages);
  const tickets = await TicketModel.find(query)
    .select('-attendeeIdentityNumber -qrTokenHash')
    .sort({ issuedAt: -1, _id: -1 })
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .lean();
  const itemIds = tickets.map((ticket) => ticket.orderItemId);
  const items = await OrderItemModel.find({ _id: { $in: itemIds } }).lean();
  const itemById = new Map(items.map((item) => [item._id.toString(), item]));
  const [orders, events, ticketTypes] = await Promise.all([
    OrderModel.find({ _id: { $in: items.map((item) => item.orderId) } }).select('bookingCode contactName').lean(),
    EventModel.find({ _id: { $in: eventIds } }).select('title organizerId').lean(),
    TicketTypeModel.find({ _id: { $in: items.map((item) => item.ticketTypeId) } }).select('name').lean(),
  ]);
  const [organizers, payments] = await Promise.all([
    OrganizerModel.find({ _id: { $in: events.map((event) => event.organizerId) } })
      .select('name')
      .lean(),
    PaymentModel.find({ orderId: { $in: orders.map((order) => order._id) } })
      .sort({ createdAt: -1 })
      .lean(),
  ]);
  const orderById = new Map(orders.map((order) => [order._id.toString(), order]));
  const eventById = new Map(events.map((event) => [event._id.toString(), event]));
  const organizerById = new Map(organizers.map((organizer) => [organizer._id.toString(), organizer]));
  const paymentByOrder = new Map<string, typeof payments[number]>();
  for (const payment of payments) {
    const orderId = payment.orderId.toString();
    if (!paymentByOrder.has(orderId)) paymentByOrder.set(orderId, payment);
  }
  const typeById = new Map(ticketTypes.map((type) => [type._id.toString(), type]));
  const serializedTickets = tickets.map((ticket) => {
    const item = itemById.get(ticket.orderItemId.toString());
    const order = item ? orderById.get(item.orderId.toString()) : undefined;
    return {
      id: ticket._id.toString(),
      attendeeName: ticket.attendeeName,
      attendeeEmail: ticket.attendeeEmail,
      buyerName: order?.contactName ?? '-',
      bookingCode: order?.bookingCode ?? '-',
      eventTitle: eventById.get(ticket.eventId.toString())?.title ?? '-',
      organizer: eventById.get(ticket.eventId.toString())
        ? organizerById.get(eventById.get(ticket.eventId.toString())!.organizerId.toString())
          ? { id: organizerById.get(eventById.get(ticket.eventId.toString())!.organizerId.toString())!._id.toString(), name: organizerById.get(eventById.get(ticket.eventId.toString())!.organizerId.toString())!.name }
          : null
        : null,
      ticketType: item ? typeById.get(item.ticketTypeId.toString())?.name ?? '-' : '-',
      status: ticket.status,
      paymentStatus: order ? paymentByOrder.get(order._id.toString())?.status ?? null : null,
      qrStatus: ticket.qrStatus,
      issuedAt: ticket.issuedAt,
    };
  });
  return { tickets: serializedTickets, total, pages, page: currentPage };
}

async function ticketPayload(ticketId: string) {
  let ticket = await TicketModel.findById(ticketId)
    .select('+qrTokenCiphertext +qrTokenIv +qrTokenAuthTag');
  if (!ticket) throw new Error('NOT_FOUND');
  if (ticket.status === 'VOID' || ticket.qrStatus === 'REVOKED') return null;
  if (!ticket.qrTokenCiphertext || !ticket.qrTokenIv || !ticket.qrTokenAuthTag) {
    const credential = createTicketCredential();
    ticket = await TicketModel.findOneAndUpdate(
      { _id: ticketId, status: { $ne: 'VOID' }, qrStatus: { $ne: 'REVOKED' } },
      { $set: {
        qrTokenHash: credential.hash,
        qrTokenCiphertext: credential.ciphertext,
        qrTokenIv: credential.iv,
        qrTokenAuthTag: credential.authTag,
        qrIssuedAt: new Date(),
        qrStatus: 'READY',
      } },
      { returnDocument: 'after' },
    ).select('+qrTokenCiphertext +qrTokenIv +qrTokenAuthTag');
  }
  if (!ticket?.qrTokenCiphertext || !ticket.qrTokenIv || !ticket.qrTokenAuthTag) return null;
  return decryptTicketCredential(ticket.qrTokenCiphertext, ticket.qrTokenIv, ticket.qrTokenAuthTag);
}

export async function getUserOrder(userId: string, orderId: string) {
  if (!isValidObjectId(orderId)) throw new Error('NOT_FOUND');
  await connectDatabase();
  let order = await OrderModel.findOne({ _id: orderId, userId })
    .select('+participants.identityNumber')
    .lean();
  if (!order) throw new Error('NOT_FOUND');
  if (order.status === 'PENDING' && order.expiresAt <= new Date()) {
    await expireOrder(orderId);
    order = await OrderModel.findOne({ _id: orderId, userId })
      .select('+participants.identityNumber')
      .lean();
    if (!order) throw new Error('NOT_FOUND');
  }
  const [event, items] = await Promise.all([
    EventModel.findById(order.eventId).select('title slug bannerImageUrl startsAt venueName city').lean(),
    OrderItemModel.find({ orderId: order._id }).lean(),
  ]);
  if (!event) throw new Error('NOT_FOUND');
  const [ticketTypes, tickets] = await Promise.all([
    TicketTypeModel.find({ _id: { $in: items.map((item) => item.ticketTypeId) } }).select('name').lean(),
    TicketModel.find({ orderItemId: { $in: items.map((item) => item._id) } })
      .select('-attendeeIdentityNumber -qrTokenHash')
      .lean(),
  ]);
  const typeNames = new Map(ticketTypes.map((type) => [type._id.toString(), type.name]));
  const payloads = order.status === 'PAID'
    ? new Map(await Promise.all(tickets.map(async (ticket) => [ticket._id.toString(), await ticketPayload(ticket._id.toString())] as const)))
    : new Map<string, string | null>();
  return {
    id: order._id.toString(),
    bookingCode: order.bookingCode,
    contactName: order.contactName,
    contactEmail: order.contactEmail,
    contactPhone: order.contactPhone,
    status: order.status,
    subtotal: order.subtotal,
    total: order.total,
    expiresAt: order.expiresAt,
    paidAt: order.paidAt,
    createdAt: order.createdAt,
    event: {
      title: event.title,
      slug: event.slug,
      bannerImageUrl: event.bannerImageUrl,
      startsAt: event.startsAt,
      venueName: event.venueName,
      city: event.city,
    },
    items: items.map((item) => ({
      id: item._id.toString(),
      name: typeNames.get(item.ticketTypeId.toString()) ?? '-',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
    participants: order.participants.map((participant: Participant & { ticketTypeId: { toString(): string } }) => ({
      name: participant.name,
      email: participant.email,
      phone: participant.phone,
      domicile: participant.domicile,
      identityNumber: participant.identityNumber
        ? `••••${participant.identityNumber.slice(-4)}`
        : '-',
      ticketType: typeNames.get(participant.ticketTypeId.toString()) ?? '-',
    })),
    tickets: tickets.map((ticket) => ({
      id: ticket._id.toString(),
      attendeeName: ticket.attendeeName,
      status: ticket.status,
      qrStatus: ticket.qrStatus,
      issuedAt: ticket.issuedAt,
      checkedInAt: ticket.checkedInAt ?? null,
      qrPayload: payloads.get(ticket._id.toString()) ?? null,
    })),
  };
}

export function orderError(error: unknown) {
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
            : ['QUOTA', 'EXPIRED', 'INVALID_STATUS', 'INVENTORY'].includes(code)
              ? 409
              : 500;
  return Response.json(
    { error: status === 500 ? 'Terjadi kesalahan server' : code },
    { status },
  );
}
