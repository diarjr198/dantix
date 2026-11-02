import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { TicketScanner } from '@/components/gate/ticket-scanner';
import { getGateEvent } from '@/server/checkins';

export default async function GateEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  let event;
  try { event = await getGateEvent((await params).eventId); } catch (error) { if (error instanceof Error && error.message === 'UNAUTHORIZED') redirect('/gate/masuk'); notFound(); }
  return <main className="mx-auto min-h-screen max-w-xl px-5 py-10"><Link href="/gate" className="text-sm font-bold text-[#e51d59]">‹ Ganti event</Link><h1 className="mt-5 text-3xl font-black">{event.title}</h1><p className="mt-2 text-sm text-slate-600">{event.venueName}, {event.city}</p><TicketScanner eventId={event.id} /></main>;
}
