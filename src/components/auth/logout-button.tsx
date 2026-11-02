'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function logout() {
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Gagal keluar');
      router.push('/');
      router.refresh();
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Gagal keluar');
      setPending(false);
    }
  }

  return (
    <div className="text-right">
      <Button type="button" onClick={logout} disabled={pending} variant="neutral" size="sm" className="cursor-pointer text-xs">
        {pending ? 'Keluar...' : 'Keluar'}
      </Button>
      {error ? <p className="text-[10px] text-red-600">{error}</p> : null}
    </div>
  );
}
