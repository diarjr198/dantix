/* eslint-disable @typescript-eslint/no-explicit-any */
import { isValidObjectId } from 'mongoose';
import { connectDatabase } from '@/server/db/connection';
import { EventModel } from '@/server/models/event';
import { OrganizerModel } from '@/server/models/organizer';
import { TicketTypeModel } from '@/server/models/ticket-type';
import type { CurrentUser } from '@/server/auth/session';
import { resolveEventImage } from '@/lib/event-image';

type Input = Record<string, unknown>;
const eventFields = [
  'title',
  'shortDescription',
  'description',
  'bannerImageUrl',
  'seatMapMode',
  'seatMapImageUrl',
  'location',
  'venueName',
  'venueAddress',
  'city',
  'terms',
  'category',
  'startsAt',
  'endsAt',
  'guestCheckoutEnabled',
] as const;
function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}
function dto(event: any, organizer?: any, tickets?: any[]) {
  return {
    id: event._id.toString(),
    slug: event.slug,
    title: event.title,
    shortDescription: event.shortDescription,
    description: event.description,
    bannerImageUrl: event.bannerImageUrl,
    seatMapMode: event.seatMapMode ?? 'DEFAULT',
    seatMapImageUrl: event.seatMapImageUrl,
    location: event.location,
    venueName: event.venueName,
    venueAddress: event.venueAddress,
    city: event.city,
    terms: event.terms,
    category: event.category,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt.toISOString(),
    status: event.status,
    moderationStatus: event.moderationStatus,
    organizer: organizer && {
      id: organizer._id.toString(),
      name: organizer.name,
      description: organizer.description,
      email: organizer.email,
      phone: organizer.phone,
      logoImageUrl: organizer.logoImageUrl,
    },
    tickets: tickets?.map((t) => ({
      id: t._id.toString(),
      name: t.name,
      price: t.price,
      quota: t.quota,
      maxPerOrder: t.maxPerOrder,
      salesStartAt: t.salesStartAt.toISOString(),
      salesEndAt: t.salesEndAt.toISOString(),
      benefits: t.benefits ?? [],
      sortOrder: t.sortOrder ?? 0,
      reservedQuantity: t.reservedQuantity ?? 0,
      soldQuantity: t.soldQuantity ?? 0,
    })),
  };
}
export async function organizerFor(user: CurrentUser) {
  await connectDatabase();
  let organizer = await OrganizerModel.findOne({ ownerUserId: user.id });
  if (!organizer)
    organizer = await OrganizerModel.create({
      ownerUserId: user.id,
      name: user.name,
      verificationStatus: 'PENDING',
    });
  return organizer;
}
function fields(input: Input) {
  const next: Record<string, unknown> = {};
  for (const key of eventFields) if (key in input) next[key] = input[key];
  if (typeof next.title === 'string') next.title = next.title.trim();
  if (next.startsAt) next.startsAt = new Date(String(next.startsAt));
  if (next.endsAt) next.endsAt = new Date(String(next.endsAt));
  if (!['DEFAULT', 'UPLOAD', 'NONE'].includes(String(next.seatMapMode ?? 'DEFAULT')))
    throw new Error('VALIDATION');
  if (next.seatMapMode !== 'UPLOAD') next.seatMapImageUrl = undefined;
  return next;
}

type TicketInput = {
  id?: string;
  name: string;
  price: number;
  quota: number;
  maxPerOrder: number;
  salesStartAt: string;
  salesEndAt: string;
  benefits?: string[];
  sortOrder?: number;
};
function ticketInputs(input: Input): TicketInput[] {
  if (!('tickets' in input)) return [];
  if (!Array.isArray(input.tickets)) throw new Error('VALIDATION');
  const tickets = input.tickets as TicketInput[];
  const names = new Set<string>();
  for (const [index, ticket] of tickets.entries()) {
    const name = String(ticket.name ?? '').trim();
    const key = name.toLocaleLowerCase('id-ID');
    if (!name || names.has(key) || !Number.isInteger(Number(ticket.price)) || Number(ticket.price) < 0 || !Number.isInteger(Number(ticket.quota)) || Number(ticket.quota) < 0 || !Number.isInteger(Number(ticket.maxPerOrder)) || Number(ticket.maxPerOrder) < 1 || new Date(ticket.salesEndAt) <= new Date(ticket.salesStartAt)) throw new Error('VALIDATION');
    names.add(key);
    ticket.name = name;
    ticket.price = Number(ticket.price);
    ticket.quota = Number(ticket.quota);
    ticket.maxPerOrder = Number(ticket.maxPerOrder);
    ticket.sortOrder = Number.isInteger(ticket.sortOrder) ? ticket.sortOrder : index;
    ticket.benefits = (ticket.benefits ?? []).map((benefit) => String(benefit).trim()).filter(Boolean);
  }
  return tickets;
}
async function saveTickets(eventId: string, input: Input, session: any) {
  if (!('tickets' in input)) return;
  const tickets = ticketInputs(input);
  const existing = await TicketTypeModel.find({ eventId }).session(session);
  const retained = new Set<string>();
  for (const ticket of tickets) {
    if (ticket.id) {
      const current = existing.find((item) => item.id === ticket.id);
      if (!current) throw new Error('VALIDATION');
      if (ticket.quota < current.reservedQuantity + current.soldQuantity) throw new Error('QUOTA');
      Object.assign(current, ticket);
      retained.add(current.id);
      await current.save({ session });
    } else {
      await TicketTypeModel.create([{ ...ticket, eventId, reservedQuantity: 0, soldQuantity: 0 }], { session });
    }
  }
  for (const current of existing.filter((item) => !retained.has(item.id))) {
    if (current.reservedQuantity || current.soldQuantity) throw new Error('TIER_IN_USE');
    await current.deleteOne({ session });
  }
}
async function uniqueSlug(title: string, ignore?: string) {
  const base = slugify(title) || 'event';
  for (let n = 0; n < 100; n++) {
    const slug = n ? `${base}-${n + 1}` : base;
    const hit = await EventModel.exists({ _id: { $ne: ignore }, slug });
    if (!hit) return slug;
  }
  throw new Error('SLUG_CONFLICT');
}
export async function createEvent(user: CurrentUser, input: Input) {
  const organizer = await organizerFor(user);
  const data = fields(input);
  if (!data.title || !data.description || !data.venueName || !data.venueAddress || !data.city || !data.terms || !data.startsAt || !data.endsAt) throw new Error('VALIDATION');
  const title = String(data.title);
  const mongoose = await connectDatabase();
  return mongoose.connection.transaction(async (session) => {
    const [event] = await EventModel.create([{
      ...data,
      seatMapMode: data.seatMapMode ?? 'DEFAULT',
      location: `${data.venueName}, ${data.city}`,
      bannerImageUrl: resolveEventImage(title, typeof data.bannerImageUrl === 'string' ? data.bannerImageUrl : undefined),
      slug: await uniqueSlug(title),
      organizerId: organizer._id,
      status: 'DRAFT',
      moderationStatus: 'NOT_SUBMITTED',
    }], { session });
    await saveTickets(event.id, input, session);
    const tickets = await TicketTypeModel.find({ eventId: event._id }).sort({ sortOrder: 1 }).session(session);
    return dto(event, organizer, tickets);
  });
}
export async function updateEvent(user: CurrentUser, id: string, input: Input) {
  if (!isValidObjectId(id)) throw new Error('INVALID_ID');
  await connectDatabase();
  const event = await EventModel.findById(id);
  if (!event) throw new Error('NOT_FOUND');
  const organizer = await OrganizerModel.findById(event.organizerId);
  if (!organizer) throw new Error('NOT_FOUND');
  if (!user.isAdmin && organizer.ownerUserId.toString() !== user.id)
    throw new Error('FORBIDDEN');
  const mongoose = await connectDatabase();
  return mongoose.connection.transaction(async (session) => {
    Object.assign(event, fields(input));
    if ('bannerImageUrl' in input)
      event.bannerImageUrl = resolveEventImage(event.title, typeof input.bannerImageUrl === 'string' ? input.bannerImageUrl : undefined);
    if (input.title) event.slug = await uniqueSlug(event.title, id);
    event.location = `${event.venueName}, ${event.city}`;
    await event.save({ session });
    await saveTickets(event.id, input, session);
    const tickets = await TicketTypeModel.find({ eventId: event._id }).sort({ sortOrder: 1 }).session(session);
    return dto(event, organizer, tickets);
  });
}
export async function dashboardEvents(user: CurrentUser, page = 1, pageSize = 10) {
  await connectDatabase();
  const query = user.isAdmin ? {} : { organizerId: (await organizerFor(user))._id };
  const total = await EventModel.countDocuments(query);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), pages);
  const events = await EventModel.find(query)
    .sort({ updatedAt: -1, _id: -1 })
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .lean();
  const eventIds = events.map((event) => event._id);
  const [organizers, tickets] = await Promise.all([
    OrganizerModel.find({ _id: { $in: events.map((event) => event.organizerId) } }).lean(),
    TicketTypeModel.find({ eventId: { $in: eventIds } }).sort({ price: 1 }).lean(),
  ]);
  const organizerById = new Map(organizers.map((organizer) => [organizer._id.toString(), organizer]));
  const ticketsByEvent = new Map<string, typeof tickets>();
  for (const ticket of tickets) {
    const list = ticketsByEvent.get(ticket.eventId.toString()) ?? [];
    list.push(ticket);
    ticketsByEvent.set(ticket.eventId.toString(), list);
  }
  return {
    events: events.map((event) => dto(event, organizerById.get(event.organizerId.toString()), ticketsByEvent.get(event._id.toString()))),
    total,
    pages,
    page: currentPage,
  };
}

export async function dashboardEvent(user: CurrentUser, id: string) {
  if (!isValidObjectId(id)) throw new Error('NOT_FOUND');
  await connectDatabase();
  const query = user.isAdmin
    ? { _id: id }
    : { _id: id, organizerId: (await organizerFor(user))._id };
  const event = await EventModel.findOne(query).lean();
  if (!event) return null;
  const [organizer, tickets] = await Promise.all([
    OrganizerModel.findById(event.organizerId).lean(),
    TicketTypeModel.find({ eventId: event._id }).sort({ sortOrder: 1, price: 1 }).lean(),
  ]);
  return dto(event, organizer, tickets);
}

export async function allDashboardEvents(user: CurrentUser) {
  await connectDatabase();
  const query = user.isAdmin ? {} : { organizerId: (await organizerFor(user))._id };
  const events = await EventModel.find(query).sort({ updatedAt: -1, _id: -1 }).lean();
  return events.map((e) => dto(e));
}
export async function publicEvents() {
  await connectDatabase();
  const events = await EventModel.find({
    status: 'PUBLISHED',
    moderationStatus: 'APPROVED',
  })
    .sort({ startsAt: 1 })
    .limit(12)
    .lean();
  const ticketPrices = await Promise.all(
    events.map(
      async (event) =>
        (
          await TicketTypeModel.findOne({ eventId: event._id })
            .sort({ price: 1 })
            .select('price')
            .lean()
        )?.price ?? 0,
    ),
  );
  return events.map((event, index) => ({
    ...dto(event),
    price: ticketPrices[index],
  }));
}

export async function publicEvent(slug: string) {
  await connectDatabase();
  const event = await EventModel.findOne({
    slug,
    status: 'PUBLISHED',
    moderationStatus: 'APPROVED',
  }).lean();
  if (!event) return null;
  const [organizer, tickets] = await Promise.all([
    OrganizerModel.findById(event.organizerId).lean(),
    TicketTypeModel.find({ eventId: event._id }).sort({ sortOrder: 1, price: 1 }).lean(),
  ]);
  return dto(event, organizer, tickets);
}
