import { notFound } from 'next/navigation';
import { EventOrderPage } from '@/components/events/event-order-page';
import { TicketOptions } from '@/components/events/ticket-options';
import { publicEvent } from '@/server/events';
import { getCurrentUser } from '@/server/auth/session';
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ show_options?: string }>;
};
export async function generateMetadata({ params }: Props) {
  const event = await publicEvent((await params).slug);
  return event
    ? { title: event.title, description: event.shortDescription }
    : { title: 'Event tidak ditemukan' };
}
export default async function EventPage({ params, searchParams }: Props) {
  const slug = (await params).slug;
  const [event, user, query] = await Promise.all([
    publicEvent(slug),
    getCurrentUser(),
    searchParams,
  ]);
  if (!event) notFound();
  if (query.show_options === 'true')
    return <TicketOptions event={event} user={user} />;
  return <EventOrderPage event={event} user={user} />;
}
