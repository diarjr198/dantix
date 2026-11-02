import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/home/navbar';
import { getCurrentUser } from '@/server/auth/session';
import { listUserOrders } from '@/server/orders';

export default async function OrdersHistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/masuk');
  const orders = await listUserOrders(user.id);
  return <><Navbar user={user} /><main className="mx-auto max-w-5xl px-5 py-10"><p className="text-sm text-slate-500">Riwayat transaksi</p><h1 className="text-3xl font-black">Pesanan Saya</h1><div className="mt-7 grid gap-4">{orders.map((order) => <Link key={order._id.toString()} href={`/pesanan/${order._id}`} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-5 shadow-sm transition hover:border-[#00a884]"><div><strong>{order.bookingCode}</strong><p className="mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString('id-ID')}</p></div><div className="text-right"><strong>Rp{order.total.toLocaleString('id-ID')}</strong><p className="mt-1 text-xs font-bold text-[#00a884]">{order.status}</p></div></Link>)}</div>{orders.length === 0 && <div className="mt-7 rounded-xl border bg-white p-10 text-center"><p className="text-slate-500">Belum ada pesanan.</p><Link href="/#event" className="mt-4 inline-block rounded bg-[#e51d59] px-5 py-3 text-sm font-bold text-white">Cari Event</Link></div>}</main></>;
}
