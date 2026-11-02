'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function GateLoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setError('');
    try { const response = await fetch('/api/auth/gate-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ method: identifier.includes('@') ? 'email' : 'phone', identifier, password }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error ?? 'Gagal masuk'); router.push('/gate'); router.refresh(); } catch (error) { setError(error instanceof Error ? error.message : 'Gagal masuk'); } finally { setPending(false); }
  }
  return <form onSubmit={submit} className="mx-auto mt-16 grid max-w-sm gap-4 rounded-xl border-2 border-black bg-white p-6 shadow-shadow"><h1 className="text-2xl font-black">Gate Scanner</h1><p className="text-sm text-slate-600">Masuk khusus petugas pemeriksaan tiket.</p><input required value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="Email atau nomor HP" className="nb-input" /><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="nb-input" />{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<button disabled={pending} className="nb-button nb-primary" type="submit">{pending ? 'Memproses...' : 'Masuk'}</button></form>;
}
