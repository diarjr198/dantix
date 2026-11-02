import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/auth/session';
import { dashboardEvent } from '@/server/events';
import { EventForm } from '@/components/dashboard/event-form';

const localDate = (value: string) => new Date(value).toISOString().slice(0, 16);
export default async function EditEvent({ params }: { params: Promise<{ eventId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect('/masuk');
  const event = await dashboardEvent(user, (await params).eventId);
  if (!event) notFound();
  return <main className="mx-auto max-w-3xl px-5 py-10"><EventForm eventId={event.id} initialData={{ title: event.title, shortDescription: event.shortDescription ?? '', description: event.description, bannerImageUrl: event.bannerImageUrl, seatMapMode: event.seatMapMode, seatMapImageUrl: event.seatMapImageUrl ?? '', venueName: event.venueName, venueAddress: event.venueAddress, city: event.city, terms: event.terms, startsAt: localDate(event.startsAt), endsAt: localDate(event.endsAt), tickets: event.tickets?.map((ticket) => ({ ...ticket, salesStartAt: localDate(ticket.salesStartAt), salesEndAt: localDate(ticket.salesEndAt) })) }} /></main>;
}
