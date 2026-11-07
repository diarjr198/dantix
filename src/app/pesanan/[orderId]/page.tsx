import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Navbar } from '@/components/home/navbar';
import { Footer } from '@/components/home/footer';
import { OrderExpiryCountdown } from '@/components/orders/order-expiry-countdown';
import { TicketQr } from '@/components/orders/ticket-qr';
import { getCurrentUser } from '@/server/auth/session';
import { getUserOrder } from '@/server/orders';
import { getPublicSiteSettings } from '@/server/site-content';

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect('/masuk');
  let order: Awaited<ReturnType<typeof getUserOrder>>;
  try { order = await getUserOrder(user.id, (await params).orderId); } catch { notFound(); }
  const settings = await getPublicSiteSettings();
  return <><Navbar user={user} /><main className="mx-auto max-w-5xl px-5 py-10"><Link href="/pesanan" className="text-sm font-bold text-[#e51d59]">‹ Semua pesanan</Link><div className="mt-5 grid gap-6 lg:grid-cols-[1fr_320px]"><section className="space-y-5"><div className="overflow-hidden rounded-xl border bg-white"><img src={order.event.bannerImageUrl} alt="" className="h-48 w-full object-cover" /><div className="p-5"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{order.status}</span><h1 className="mt-3 text-2xl font-black">{order.event.title}</h1><p className="mt-2 text-sm text-slate-500">{new Date(order.event.startsAt).toLocaleString('id-ID')} · {order.event.venueName}, {order.event.city}</p></div></div><div className="rounded-xl border bg-white p-5"><h2 className="font-bold">Detail Tiket</h2>{order.items.map((item) => <div key={item.id} className="mt-4 flex justify-between border-t pt-4 text-sm"><span>{item.name} × {item.quantity}</span><strong>Rp{item.lineTotal.toLocaleString('id-ID')}</strong></div>)}</div><div className="rounded-xl border bg-white p-5"><h2 className="font-bold">Peserta</h2>{order.participants.map((participant: (typeof order.participants)[number], index: number) => <div key={`${participant.email}-${index}`} className="mt-4 border-t pt-4 text-sm"><strong>{participant.name}</strong><p className="text-slate-500">{participant.ticketType} · {participant.email} · {participant.domicile}</p><p className="text-xs text-slate-400">Identitas {participant.identityNumber}</p></div>)}</div>{order.tickets.length > 0 && <div className="rounded-xl border bg-white p-5"><h2 className="font-bold">Tiket Diterbitkan</h2>{order.tickets.map((ticket) => <TicketQr key={ticket.id} payload={ticket.qrPayload} attendeeName={ticket.attendeeName} status={ticket.status} checkedInAt={ticket.checkedInAt} />)}</div>}</section><aside className="self-start rounded-xl border bg-white p-5 shadow-sm lg:sticky lg:top-5"><p className="text-xs text-slate-500">Kode Booking</p><strong className="mt-1 block text-xl">{order.bookingCode}</strong><div className="my-5 border-t" /><p className="text-sm">{order.contactName}</p><p className="text-xs text-slate-500">{order.contactEmail} · {order.contactPhone}</p><div className="my-5 border-t" /><div className="flex justify-between"><span>Total</span><strong>Rp{order.total.toLocaleString('id-ID')}</strong></div>{order.status === 'PENDING' && <><p className="mt-4 text-xs text-amber-700">Menunggu verifikasi pembayaran organizer sebelum tiket diterbitkan.</p><OrderExpiryCountdown expiresAt={order.expiresAt.toISOString()} /></>}</aside></div></main><Footer settings={settings} /></>;
}
