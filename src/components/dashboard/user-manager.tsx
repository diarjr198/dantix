'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type User = { id: string; name: string; email: string; phone: string; role: 'ADMIN' | 'ORGANIZER' | 'CUSTOMER' | 'GATE'; active: boolean };
type EventOption = { id: string; title: string };
type Assignment = { userId: string; eventId: string };
type UserForm = { name: string; email: string; phone: string; password: string; role: User['role']; active: boolean };

const empty: UserForm = { name: '', email: '', phone: '', password: '', role: 'CUSTOMER', active: true };
const pageSize = 10;

export function UserManager({ initialUsers, events, initialAssignments }: { initialUsers: User[]; events: EventOption[]; initialAssignments: Assignment[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [form, setForm] = useState<UserForm>(empty);
  const [editing, setEditing] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [page, setPage] = useState(1);
  const set = (key: keyof UserForm, value: string | boolean) => setForm((current) => ({ ...current, [key]: value } as UserForm));
  const pages = Math.max(1, Math.ceil(users.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visibleUsers = useMemo(() => users.slice((currentPage - 1) * pageSize, currentPage * pageSize), [currentPage, users]);

  function closeDialog() { if (pending) return; setDialogOpen(false); setEditing(null); setForm(empty); setMessage(''); }
  function add() { setEditing(null); setForm(empty); setMessage(''); setDialogOpen(true); }
  function edit(user: User) { setEditing(user); setForm({ name: user.name, email: user.email, phone: user.phone, password: '', role: user.role, active: user.active }); setMessage(''); setDialogOpen(true); }

  async function save(event: FormEvent) {
    event.preventDefault(); setPending(true); setMessage('');
    try {
      const response = await fetch(editing ? `/api/admin/users/${editing.id}` : '/api/admin/users', { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? 'Gagal menyimpan');
      setUsers((current) => editing ? current.map((item) => item.id === body.id ? body : item) : [body, ...current]);
      if (!editing) setPage(1);
      setDialogOpen(false);
      setEditing(null);
      setForm(empty);
      setMessage('');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Gagal menyimpan'); } finally { setPending(false); }
  }

  async function deactivate(user: User) {
    if (!confirm(`Nonaktifkan ${user.name}?`)) return;
    const response = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
    const body = await response.json();
    if (!response.ok) return setMessage(body.error ?? 'Gagal menonaktifkan');
    setUsers((current) => current.map((item) => item.id === user.id ? body : item));
  }

  async function toggleAssignment(userId: string, eventId: string, active: boolean) {
    const response = await fetch(`/api/admin/users/${userId}/assignments`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId, active }) });
    const body = await response.json();
    if (!response.ok) return setMessage(body.error ?? 'Gagal mengubah assignment');
    setAssignments((current) => active ? [...current.filter((item) => !(item.userId === userId && item.eventId === eventId)), { userId, eventId }] : current.filter((item) => !(item.userId === userId && item.eventId === eventId)));
  }

  return <div>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-3xl font-black">Users</h1><p className="mt-2 text-slate-600">Kelola akun admin, organizer, customer, dan gate.</p></div>
      <Button type="button" onClick={add}>+ Tambah User</Button>
    </div>
    <div className="overflow-x-auto rounded-base border-2 border-black bg-white shadow-shadow"><table className="min-w-full text-sm"><thead><tr className="border-b-2 border-black text-left"><th className="p-3">Nama</th><th className="p-3">Kontak</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Assignment Event</th><th className="p-3">Aksi</th></tr></thead><tbody>{visibleUsers.map((user) => <tr key={user.id} className="border-b border-slate-200 align-top last:border-0"><td className="p-3"><strong>{user.name}</strong></td><td className="p-3">{user.email || user.phone || '-'}</td><td className="p-3">{user.role}</td><td className="p-3">{user.active ? 'Aktif' : 'Nonaktif'}</td><td className="p-3">{user.role === 'GATE' && <div className="grid min-w-52 gap-1">{events.map((event) => { const assigned = assignments.some((item) => item.userId === user.id && item.eventId === event.id); return <label key={event.id} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={assigned} onChange={(input) => void toggleAssignment(user.id, event.id, input.target.checked)} /> {event.title}</label>; })}</div>}</td><td className="p-3"><div className="flex flex-wrap gap-2"><Button variant="neutral" size="xs" onClick={() => edit(user)}>Edit</Button>{user.active && <Button variant="neutral" size="xs" onClick={() => void deactivate(user)}>Nonaktifkan</Button>}</div></td></tr>)}</tbody></table>{users.length === 0 && <p className="p-8 text-center text-slate-500">Belum ada user.</p>}</div>
    {pages > 1 && <nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination"><Button variant="neutral" size="sm" disabled={currentPage === 1} onClick={() => setPage((current) => current - 1)}>Sebelumnya</Button>{Array.from({ length: pages }, (_, index) => index + 1).map((number) => <Button key={number} variant={number === currentPage ? 'default' : 'neutral'} size="sm" onClick={() => setPage(number)}>{number}</Button>)}<Button variant="neutral" size="sm" disabled={currentPage === pages} onClick={() => setPage((current) => current + 1)}>Berikutnya</Button></nav>}
    <Dialog open={dialogOpen} onOpenChange={(open) => { if (open) setDialogOpen(true); else closeDialog(); }}><DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit User' : 'Tambah User'}</DialogTitle><DialogDescription>Isi data akun user.</DialogDescription></DialogHeader><form onSubmit={save} className="grid gap-3"><input value={form.name} onChange={(event) => set('name', event.target.value)} placeholder="Nama" required /><input value={form.email} onChange={(event) => set('email', event.target.value)} placeholder="Email" type="email" /><input value={form.phone} onChange={(event) => set('phone', event.target.value)} placeholder="Nomor HP" /><input value={form.password} onChange={(event) => set('password', event.target.value)} placeholder={editing ? 'Password baru (opsional)' : 'Password'} required={!editing} type="password" /><select value={form.role} onChange={(event) => set('role', event.target.value)}><option value="CUSTOMER">Customer</option><option value="ORGANIZER">Organizer</option><option value="GATE">Gate</option><option value="ADMIN">Admin</option></select><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(event) => set('active', event.target.checked)} /> Aktif</label>{message && <p className="text-sm text-red-600">{message}</p>}<DialogFooter><Button type="button" variant="neutral" onClick={closeDialog}>Batal</Button><Button disabled={pending} type="submit">{pending ? 'Menyimpan...' : 'Simpan'}</Button></DialogFooter></form></DialogContent></Dialog>
  </div>;
}
