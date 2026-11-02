'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useSiteBrand } from '@/components/site-brand-provider';

type LoginMethod = 'phone' | 'email';

export function LoginForm() {
  const router = useRouter();
  const { siteName } = useSiteBrand();
  const [method, setMethod] = useState<LoginMethod>('phone');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, identifier, password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Gagal masuk');
      router.push('/');
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Gagal masuk',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="w-full max-w-[402px] overflow-hidden rounded-xl border border-slate-300 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
      <form onSubmit={submit} className="px-6 pt-8">
        <h1 className="text-lg font-bold text-slate-900">Masuk</h1>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          Silahkan masuk ke akun {siteName} kamu, atau klik Daftar Sekarang untuk
          mendaftar di {siteName}
        </p>
        <div
          role="tablist"
          aria-label="Metode masuk"
          className="mt-5 grid grid-cols-2 border-b border-slate-100"
        >
          {(['phone', 'email'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={method === tab}
              onClick={() => {
                setMethod(tab);
                setIdentifier('');
                setError('');
              }}
              className={`border-b-2 px-2 pb-2.5 text-xs font-medium ${method === tab ? 'border-[#e51d59] text-slate-800' : 'border-transparent text-slate-400'}`}
            >
              {tab === 'phone' ? 'Nomor HP' : 'Email'}
            </button>
          ))}
        </div>
        <div role="tabpanel" className="mt-5 space-y-3">
          <label
            className="block text-xs font-bold text-slate-800"
            htmlFor="login-identifier"
          >
            {method === 'phone' ? 'Nomor HP' : 'Email'}
            <span className="mt-1 flex gap-2">
              {method === 'phone' ? (
                <span className="grid h-9 place-items-center rounded border border-slate-300 px-3 text-xs font-normal">
                  🇮🇩 +62
                </span>
              ) : null}
              <input
                id="login-identifier"
                type={method === 'phone' ? 'tel' : 'email'}
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                autoComplete={method === 'phone' ? 'tel-national' : 'email'}
                placeholder={
                  method === 'phone' ? 'Masukkan nomor HP' : 'Alamat email'
                }
                className="h-9 min-w-0 flex-1 rounded border border-slate-300 px-3 text-xs font-normal outline-none placeholder:text-slate-400 focus:border-[#e51d59] focus:ring-1 focus:ring-[#e51d59]"
              />
            </span>
          </label>
          <label
            className="block text-xs font-bold text-slate-800"
            htmlFor="login-password"
          >
            Password
            <span className="relative mt-1 block">
              <input
                id="login-password"
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Password"
                className="h-9 w-full rounded border border-slate-300 px-3 pr-11 text-xs font-normal outline-none placeholder:text-slate-400 focus:border-[#e51d59] focus:ring-1 focus:ring-[#e51d59]"
              />
              <button
                type="button"
                aria-label={
                  passwordVisible
                    ? 'Sembunyikan password'
                    : 'Tampilkan password'
                }
                onClick={() => setPasswordVisible((current) => !current)}
                className="absolute inset-y-0 right-0 w-11 border-l border-slate-200 text-slate-400"
              >
                {passwordVisible ? '◉' : '◌'}
              </button>
            </span>
          </label>
        </div>
        {method === 'email' ? (
          <a
            href="#lupa-password"
            className="mt-3 block text-[10px] font-bold text-[#e51d59]"
          >
            Lupa Password?
          </a>
        ) : null}
        {error ? (
          <p role="alert" className="mt-3 text-xs text-red-600">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-3 h-9 w-full rounded bg-slate-100 text-xs font-bold text-slate-500 disabled:opacity-60"
        >
          {pending ? 'Memproses...' : 'Lanjutkan'}
        </button>
        <p className="my-4 text-center text-[10px] text-slate-500">atau</p>
        <button
          type="button"
          disabled
          className="flex h-9 w-full items-center justify-center gap-2 rounded bg-slate-100 text-xs font-bold text-slate-800"
        >
          G <span>Google</span>
        </button>
      </form>
      <p className="mt-6 border-t border-slate-100 px-6 py-4 text-center text-[11px] text-slate-600">
        Belum punya akun?{' '}
        <Link href="/daftar" className="font-bold text-[#e51d59]">
          Daftar Sekarang
        </Link>
      </p>
    </section>
  );
}
