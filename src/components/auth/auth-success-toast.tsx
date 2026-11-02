'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type AuthSuccessToastProps = {
  action: 'login' | 'register';
};

export function AuthSuccessToast({ action }: AuthSuccessToastProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const message = action === 'login' ? 'Berhasil masuk ke akun.' : 'Akun berhasil dibuat.';

  useEffect(() => {
    router.replace('/', { scroll: false });
    const timeout = window.setTimeout(() => setVisible(false), 4000);
    return () => window.clearTimeout(timeout);
  }, [router]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="fixed top-24 right-5 z-50 flex max-w-sm items-center gap-4 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-800 shadow-lg"
    >
      <span aria-hidden="true" className="font-bold">✓</span>
      <span>{message}</span>
      <button type="button" onClick={() => setVisible(false)} aria-label="Tutup notifikasi" className="ml-auto text-slate-400 hover:text-slate-700">×</button>
    </div>
  );
}
