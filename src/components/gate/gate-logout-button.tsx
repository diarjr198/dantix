'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function GateLogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function logout() {
    setPending(true);
    await fetch('/api/auth/gate-logout', { method: 'POST' });
    router.push('/gate/masuk');
    router.refresh();
  }
  return <Button type="button" variant="neutral" size="sm" disabled={pending} onClick={() => void logout()}>{pending ? 'Keluar...' : 'Keluar Gate'}</Button>;
}
