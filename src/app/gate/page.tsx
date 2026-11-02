import Link from 'next/link';
import { redirect } from 'next/navigation';
import { listGateEvents } from '@/server/checkins';
import { GateLogoutButton } from '@/components/gate/gate-logout-button';

export default async function GatePage() {
  let events;
  try { events = await listGateEvents(); } catch { redirect('/gate/masuk'); }
  return <main className="mx-auto min-h-screen max-w-3xl px-5 py-10"><div className="flex items-center justify-between gap-4"><h1 className="text-3xl font-black">Gate Scanner</h1><GateLogoutButton /></div><p className="mt-2 text-slate-600">Pilih event yang ditugaskan.</p><div className="mt-8 grid gap-4">{events.map((event) => <Link key={event.id} href={`/gate/${event.id}`} className="nb-card block p-5"><strong>{event.title}</strong><p className="mt-1 text-sm text-slate-600">{new Date(event.startsAt).toLocaleString('id-ID')} · {event.venueName}, {event.city}</p></Link>)}{events.length === 0 && <p className="nb-card p-5">Belum ada assignment event aktif.</p>}</div></main>;
}
