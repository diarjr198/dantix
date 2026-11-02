'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Profile = { name: string; email: string };

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: profile.name, email: profile.email, currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage(''); setSuccess(false);
    try {
      const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? 'Gagal memperbarui profil');
      setForm((current) => ({ ...current, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setMessage('Profil berhasil diperbarui.'); setSuccess(true); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Gagal memperbarui profil'); } finally { setPending(false); }
  }

  return <form onSubmit={submit} className="grid gap-5 rounded-base border-2 border-black bg-white p-5 shadow-shadow sm:p-8"><div><h1 className="text-2xl font-black">Profil</h1><p className="mt-1 text-sm text-slate-600">Kelola nama, email, dan password akun kamu.</p></div><div className="grid gap-4"><label className="grid gap-1 text-sm font-bold">Nama<input value={form.name} onChange={(event) => set('name', event.target.value)} required /></label><label className="grid gap-1 text-sm font-bold">Email<input type="email" value={form.email} onChange={(event) => set('email', event.target.value)} required /></label></div><div className="border-t-2 border-dashed border-slate-300 pt-5"><h2 className="font-bold">Ubah password</h2><p className="mt-1 text-xs text-slate-500">Kosongkan jika tidak ingin mengubah password.</p><div className="mt-4 grid gap-4"><label className="grid gap-1 text-sm font-bold">Password saat ini<input type="password" value={form.currentPassword} onChange={(event) => set('currentPassword', event.target.value)} autoComplete="current-password" /></label><label className="grid gap-1 text-sm font-bold">Password baru<input type="password" value={form.newPassword} onChange={(event) => set('newPassword', event.target.value)} autoComplete="new-password" /></label><label className="grid gap-1 text-sm font-bold">Konfirmasi password baru<input type="password" value={form.confirmPassword} onChange={(event) => set('confirmPassword', event.target.value)} autoComplete="new-password" /></label></div></div>{message && <p className={`text-sm ${success ? 'text-emerald-700' : 'text-red-600'}`} role="alert">{message}</p>}<Button type="submit" disabled={pending}>{pending ? 'Menyimpan...' : 'Simpan perubahan'}</Button></form>;
}
