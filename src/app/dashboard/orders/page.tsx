import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ConfirmOrderButton } from '@/components/dashboard/confirm-order-button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCurrentUser } from '@/server/auth/session';
import { listManagerOrders } from '@/server/orders';

const money = (value: number) => `Rp${value.toLocaleString('id-ID')}`;
const date = (value: Date | null | undefined) => value ? new Date(value).toLocaleString('id-ID') : '-';

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect('/masuk');
  const requestedPage = Number((await searchParams).page) || 1;
  const result = await listManagerOrders(user, requestedPage, 10);
  return <main><div className="mb-8"><p className="text-sm text-slate-600">{result.total} transaksi · Verifikasi transaksi</p><h1 className="text-3xl font-black">Pesanan</h1></div><div className="overflow-x-auto shadow-shadow"><Table className={user.isAdmin ? 'min-w-[1180px]' : 'min-w-[760px]'}><TableHeader><TableRow className="bg-main"><TableHead>Booking / Pembeli</TableHead><TableHead>Event</TableHead>{user.isAdmin && <TableHead>Penyelenggara</TableHead>}<TableHead>Total</TableHead><TableHead>Status</TableHead>{user.isAdmin && <TableHead>Pembayaran</TableHead>}<TableHead>Aksi</TableHead></TableRow></TableHeader><TableBody>{result.orders.map((order) => <TableRow key={order.id}><TableCell><strong>{order.bookingCode}</strong><p className="text-xs text-slate-600">{order.contactName} · {order.contactEmail}</p></TableCell><TableCell>{order.eventTitle}</TableCell>{user.isAdmin && <TableCell>{order.organizer?.name ?? '-'}</TableCell>}<TableCell className="font-heading">{money(order.total)}</TableCell><TableCell><Badge className={order.status === 'PAID' ? 'bg-[#00a884]' : 'bg-[#ffd23f]'}>{order.status}</Badge></TableCell>{user.isAdmin && <TableCell><strong>{order.payment?.status ?? '-'}</strong><p className="text-xs text-slate-600">{order.payment?.method ?? '-'} · {order.payment?.reference ?? '-'}</p><p className="text-xs text-slate-500">{date(order.payment?.paidAt)}</p></TableCell>}<TableCell>{order.status === 'PENDING' && <ConfirmOrderButton id={order.id} />}</TableCell></TableRow>)}</TableBody></Table>{result.orders.length === 0 && <p className="border-2 border-t-0 border-black bg-white p-10 text-center">Belum ada pesanan.</p>}</div>{result.pages > 1 && <nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination"><Link aria-disabled={result.page === 1} href={`/dashboard/orders?page=${Math.max(1, result.page - 1)}`} className={`rounded border px-3 py-2 text-sm ${result.page === 1 ? 'pointer-events-none opacity-40' : ''}`}>Sebelumnya</Link>{Array.from({ length: result.pages }, (_, index) => index + 1).map((page) => <Link key={page} href={`/dashboard/orders?page=${page}`} className={`rounded px-3 py-2 text-sm font-bold ${page === result.page ? 'bg-[#00a884] text-white' : 'border bg-white'}`}>{page}</Link>)}<Link aria-disabled={result.page === result.pages} href={`/dashboard/orders?page=${Math.min(result.pages, result.page + 1)}`} className={`rounded border px-3 py-2 text-sm ${result.page === result.pages ? 'pointer-events-none opacity-40' : ''}`}>Berikutnya</Link></nav>}</main>;
}
