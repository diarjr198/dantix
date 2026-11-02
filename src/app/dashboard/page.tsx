import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/auth/session';
import { listManagerOrders, managerOrderSummary } from '@/server/orders';
import { dashboardEvents } from '@/server/events';

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect('/masuk');
  const [eventResult, summary, recentOrders] = await Promise.all([
    dashboardEvents(user, 1, 1),
    managerOrderSummary(user),
    listManagerOrders(user, 1, 5),
  ]);
  const cards = [['Total Event', eventResult.total, '#00a884'], ['Pesanan', summary.total, '#e51d59'], ['Berhasil Dibayar', summary.paid, '#2563eb'], ['Pendapatan', `Rp${summary.revenue.toLocaleString('id-ID')}`, '#f59e0b']];
  return <main><div className="mb-8"><p className="text-sm text-slate-500">Ringkasan operasional</p><h1 className="text-3xl font-black">Dashboard Overview</h1></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, color]) => <div key={label} className="rounded-xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><strong style={{ color: String(color) }} className="mt-3 block text-2xl">{value}</strong></div>)}</div><div className="mt-8 rounded-xl border bg-white p-5 shadow-sm"><div className="flex justify-between"><h2 className="font-bold">Pesanan Terbaru</h2><Link href="/dashboard/orders" className="text-sm font-bold text-[#e51d59]">Lihat semua</Link></div><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b text-xs text-slate-500"><tr><th className="p-3">Booking</th><th className="p-3">Total</th><th className="p-3">Status</th></tr></thead><tbody>{recentOrders.orders.map((order) => <tr key={order.id} className="border-b last:border-0"><td className="p-3 font-semibold">{order.bookingCode}</td><td className="p-3">Rp{order.total.toLocaleString('id-ID')}</td><td className="p-3">{order.status}</td></tr>)}</tbody></table></div></div></main>;
}
