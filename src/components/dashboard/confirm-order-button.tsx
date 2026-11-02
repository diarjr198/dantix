'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
export function ConfirmOrderButton({ id }: { id: string }) { const router = useRouter(); const [loading, setLoading] = useState(false); async function confirm() { setLoading(true); const response = await fetch(`/api/dashboard/orders/${id}/confirm`, { method: 'POST' }); setLoading(false); if (response.ok) router.refresh(); else alert('Gagal mengonfirmasi pembayaran'); } return <Button onClick={confirm} disabled={loading} size="sm" className="bg-[#00a884]">{loading ? 'Memproses…' : 'Konfirmasi Bayar'}</Button>; }
