'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/home/navbar';
import type { CurrentUser } from '@/server/auth/session';
const money = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
type EventData = NonNullable<Awaited<ReturnType<typeof import('@/server/events').publicEvent>>>;
type Participant = { name: string; email: string; phone: string; domicile: string; identityNumber: string };
const emptyParticipant = (): Participant => ({ name: '', email: '', phone: '', domicile: '', identityNumber: '' });
export function OrderDetails({ event, user, quantities }: { event: EventData; user: CurrentUser | null; quantities: Record<string, number> }) {
  const router = useRouter();
  const tickets = (event.tickets ?? []).filter((t) => quantities[t.id]);
  const count = tickets.reduce((s, t) => s + quantities[t.id], 0);
  const total = tickets.reduce((s, t) => s + quantities[t.id] * t.price, 0);
  const [contact, setContact] = useState({ name: user?.name ?? '', phone: user?.phone ?? '', email: user?.email ?? '' });
  const [participants, setParticipants] = useState<Participant[]>(() => Array.from({ length: count }, emptyParticipant));
  const [sameAsContact, setSameAsContact] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  function updateParticipant(index: number, key: keyof Participant, value: string) {
    setParticipants((current) => current.map((participant, i) => i === index ? { ...participant, [key]: value } : participant));
  }
  function toggleSameAsContact(checked: boolean) {
    setSameAsContact(checked);
    if (checked) setParticipants((current) => current.map((participant) => ({ ...participant, name: contact.name, email: contact.email, phone: contact.phone })));
  }
  async function submit() {
    if (!user) { router.push('/masuk'); return; }
    setLoading(true); setError('');
    const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId: event.id, quantities, contact, participants }) });
    const payload = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) { setError(payload.error === 'QUOTA' ? 'Tiket tidak mencukupi.' : 'Data pesanan belum valid.'); return; }
    sessionStorage.removeItem(`tiptip-order:${event.slug}`);
    router.push(`/pesanan/${payload.order.id}`);
  }
  return <><Navbar user={user} /><div className="border-t bg-blue-600 py-2 text-center text-xs text-white">▣ Tiket sudah disimpan, selesaikan pesanan dalam 15 menit</div><main className="mx-auto max-w-[1180px] px-5 py-6"><div className="grid gap-8 lg:grid-cols-[1fr_250px]"><section><button onClick={() => router.push(`/event/${event.slug}?show_options=true`)} className="text-xs font-semibold text-[#d71955]">‹ Kembali</button><h1 className="mt-3 text-sm font-bold">{event.title}</h1><p className="mt-3 text-xs text-slate-500">Untuk melakukan pemesanan, silakan lengkapi formulir berikut:</p><div className="mt-7 border-b pb-6"><h2 className="font-bold">✉　Informasi Kontak</h2><div className="mt-4 grid gap-4">{(['name', 'phone', 'email'] as const).map((key) => <label key={key} className="text-xs font-bold">{key === 'name' ? 'Nama' : key === 'phone' ? 'Nomor HP' : 'Email'} *<input required value={contact[key]} onChange={(e) => setContact((current) => ({ ...current, [key]: e.target.value }))} className="mt-2 block w-full rounded bg-slate-100 px-4 py-3 font-normal" /></label>)}</div></div><div className="mt-6"><div className="flex items-center justify-between"><h2 className="font-bold">🎟　Detail Peserta</h2><label className="text-xs">Sama dengan informasi kontak. <input type="checkbox" checked={sameAsContact} onChange={(e) => toggleSameAsContact(e.target.checked)} /></label></div>{participants.map((participant, index) => <div key={index} className="mt-5 grid gap-4 border-t pt-5"><strong className="text-sm">Peserta {index + 1}</strong>{([['name', 'Nama'], ['email', 'Email'], ['phone', 'Nomor HP'], ['domicile', 'Area Domisili'], ['identityNumber', 'Nomor Kartu Identitas (KTP/Paspor)']] as const).map(([key, label]) => <label key={key} className="text-xs font-bold">{label} *<input required value={participant[key]} onChange={(e) => updateParticipant(index, key, e.target.value)} className="mt-2 block w-full rounded bg-slate-100 px-4 py-3 font-normal" /></label>)}</div>)}</div></section><aside className="self-start lg:sticky lg:top-4"><div className="rounded-lg bg-white p-4 shadow"><h2 className="text-sm font-bold">Detail Pemesanan</h2><p className="mt-4 text-xs text-[#d71955]">▣ {tickets.map((t) => t.name).join(', ')}</p><div className="mt-3 flex justify-between text-xs"><span>{count} Tiket</span><strong>{money(total)}</strong></div><hr className="my-4" /><div className="flex justify-between text-xs"><span>Total {count} Tiket</span><strong>{money(total)}</strong></div>{error && <p className="mt-3 text-xs text-red-600">{error}</p>}<button onClick={submit} disabled={loading || !contact.name || !contact.phone || !contact.email || participants.some((participant) => Object.values(participant).some((value) => !value))} className="mt-4 w-full rounded bg-[#d71955] py-3 text-xs font-bold text-white disabled:bg-slate-200 disabled:text-slate-400">{loading ? 'Memproses…' : 'Lanjutkan'}</button></div><label className="mt-4 flex justify-between rounded border p-3 text-xs">Kirimkan tiket ke email peserta. <input type="checkbox" /></label></aside></div></main></>;
}
