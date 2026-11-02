'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useSiteBrand } from '@/components/site-brand-provider';

type RegistrationMethod = 'phone' | 'email';

function Field({
  id,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-bold text-slate-800" htmlFor={id}>
      {label}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-1 h-9 w-full rounded border border-slate-300 bg-white px-3 text-xs font-normal text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#e51d59] focus:ring-1 focus:ring-[#e51d59]"
      />
    </label>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block text-xs font-bold text-slate-800" htmlFor={id}>
      {label}
      <span className="relative mt-1 block">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={label}
          autoComplete="new-password"
          className="h-9 w-full rounded border border-slate-300 bg-white px-3 pr-11 text-xs font-normal text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#e51d59] focus:ring-1 focus:ring-[#e51d59]"
        />
        <button
          type="button"
          aria-label={visible ? `Sembunyikan ${label}` : `Tampilkan ${label}`}
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r border-l border-slate-200 bg-slate-50 text-slate-400 focus-visible:outline-2 focus-visible:outline-[#e51d59]"
        >
          {visible ? '◉' : '◌'}
        </button>
      </span>
    </label>
  );
}

function PhoneField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className="block text-xs font-bold text-slate-800"
      htmlFor="phone-number"
    >
      Nomor HP
      <span className="mt-1 flex gap-2">
        <span className="relative">
          <select
            aria-label="Kode negara"
            defaultValue="+62"
            className="h-9 appearance-none rounded border border-slate-300 bg-white py-0 pr-8 pl-3 text-xs font-normal text-slate-800 outline-none focus:border-[#e51d59]"
          >
            <option value="+62">🇮🇩 +62</option>
          </select>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-2 right-2 text-slate-500"
          >
            ⌄
          </span>
        </span>
        <input
          id="phone-number"
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="tel-national"
          placeholder="Masukkan nomor HP"
          className="h-9 min-w-0 flex-1 rounded border border-slate-300 bg-white px-3 text-xs font-normal text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#e51d59] focus:ring-1 focus:ring-[#e51d59]"
        />
      </span>
    </label>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const { siteName } = useSiteBrand();
  const [method, setMethod] = useState<RegistrationMethod>('phone');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          name: form.name,
          password: form.password,
          confirmPassword: form.confirmPassword,
          ...(method === 'email'
            ? { email: form.email }
            : { phone: form.phone }),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Gagal membuat akun');
      router.push('/');
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Gagal membuat akun',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="w-full max-w-[402px] overflow-hidden rounded-t-xl border border-slate-300 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
      <form onSubmit={submit} className="space-y-2.5 px-6 pt-8 sm:px-10">
        <h1 className="text-lg font-bold text-slate-900">Daftar</h1>
        <p className="text-sm leading-5 text-slate-500">
          Silahkan buat akun {siteName}, atau klik Masuk Sekarang untuk masuk ke
          akun {siteName} kamu
        </p>
        <div
          role="tablist"
          aria-label="Metode pendaftaran"
          className="mt-3 grid grid-cols-2 border-b border-slate-100"
        >
          {(['phone', 'email'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              id={`register-${tab}-tab`}
              aria-controls={`register-${tab}-panel`}
              aria-selected={method === tab}
              onClick={() => {
                setMethod(tab);
                setForm((current) =>
                  tab === 'email'
                    ? { ...current, phone: '' }
                    : { ...current, email: '' },
                );
                setError('');
              }}
              className={`border-b-2 px-2 pb-2.5 text-xs font-medium ${method === tab ? 'border-[#e51d59] text-slate-800' : 'border-transparent text-slate-400'}`}
            >
              {tab === 'phone' ? 'Nomor HP' : 'Email'}
            </button>
          ))}
        </div>
        <Field
          id="name"
          label="Nama"
          value={form.name}
          onChange={update('name')}
          placeholder="Nama lengkap"
          autoComplete="name"
        />
        <div
          role="tabpanel"
          id={`register-${method}-panel`}
          aria-labelledby={`register-${method}-tab`}
        >
          {method === 'email' ? (
            <Field
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="Alamat email"
              autoComplete="email"
            />
          ) : (
            <PhoneField value={form.phone} onChange={update('phone')} />
          )}
        </div>
        <PasswordField
          id="password"
          label="Password"
          value={form.password}
          onChange={update('password')}
        />
        <PasswordField
          id="confirm-password"
          label="Konfirmasi Password"
          value={form.confirmPassword}
          onChange={update('confirmPassword')}
        />
        {error ? (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        ) : null}
        <p className="pt-1 text-[10px] leading-4 text-slate-500">
          Dengan menekan tombol “Lanjutkan” saya setuju dengan{' '}
          <b>Syarat dan Ketentuan</b>, <b>Kebijakan Privasi</b>, dan{' '}
          <b>Pedoman Komunitas</b> milik {siteName}.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="h-9 w-full rounded bg-slate-100 text-xs font-bold text-slate-500 disabled:opacity-60"
        >
          {pending ? 'Memproses...' : 'Lanjutkan'}
        </button>
        <p className="py-2 text-center text-[10px] text-slate-500">atau</p>
        <button
          type="button"
          disabled
          className="flex h-9 w-full items-center justify-center gap-2 rounded bg-slate-100 text-xs font-bold text-slate-800"
        >
          G <span>Google</span>
        </button>
      </form>
      <p className="mt-6 border-t border-slate-100 px-6 py-4 text-center text-[11px] text-slate-600 sm:px-10">
        Sudah punya akun?{' '}
        <Link href="/masuk" className="font-bold text-[#e51d59]">
          Masuk Sekarang
        </Link>
      </p>
    </section>
  );
}
