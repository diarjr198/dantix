'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function EventDeleteButton({ id, title, disabled }: { id: string; title: string; disabled: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function remove() { setBusy(true); setError(''); const response = await fetch(`/api/events/${id}`, { method: 'DELETE' }); if (!response.ok) { const body = await response.json().catch(() => ({})); setError(body.error === 'EVENT_HAS_ORDERS' ? 'Event tidak bisa dihapus karena sudah memiliki pesanan.' : 'Gagal menghapus event.'); setBusy(false); return; } setOpen(false); router.refresh(); }
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger render={<Button variant="neutral" size="sm" disabled={disabled} className="border-red-700 bg-red-200 text-red-800" />}>Hapus</DialogTrigger><DialogContent><DialogHeader><DialogTitle>Hapus event?</DialogTitle><DialogDescription>Draft <strong>{title}</strong> akan dihapus permanen.</DialogDescription></DialogHeader>{error && <p className="nb-alert bg-red-100 text-sm text-red-800">{error}</p>}<DialogFooter><DialogClose render={<Button variant="neutral" disabled={busy} />}>Batal</DialogClose><Button onClick={remove} disabled={busy} className="bg-red-500">{busy ? 'Menghapus…' : 'Hapus event'}</Button></DialogFooter></DialogContent></Dialog>;
}
