'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type Result = { status?: string; attendeeName?: string; eventTitle?: string; ticketType?: string; bookingCode?: string; checkedInAt?: string; error?: string };

export function TicketScanner({ eventId }: { eventId: string }) {
  const scannerRef = useRef<{ stop(): Promise<void>; clear(): void } | null>(null);
  const handlingRef = useRef(false);
  const [payload, setPayload] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [running, setRunning] = useState(false);

  async function submit(value: string) {
    if (handlingRef.current || !value.trim()) return;
    handlingRef.current = true;
    try { const response = await fetch('/api/gate/checkins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId, payload: value.trim() }) }); const body = await response.json(); setResult(response.ok ? body : { error: body.error ?? 'INVALID_TICKET' }); if (response.ok) await stop(); } catch { setResult({ error: 'Gagal memeriksa tiket' }); } finally { handlingRef.current = false; }
  }
  async function start() {
    setResult(null);
    const { Html5Qrcode } = await import('html5-qrcode');
    const scanner = new Html5Qrcode('gate-reader');
    scannerRef.current = scanner;
    await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 240, height: 240 } }, (text) => void submit(text), () => undefined);
    setRunning(true);
  }
  async function stop() {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) { try { await scanner.stop(); } catch {} scanner.clear(); }
    setRunning(false);
  }
  useEffect(() => () => { void stop(); }, []);
  function manual(event: FormEvent) { event.preventDefault(); void submit(payload); }

  return <div className="mt-6 grid gap-5"><div id="gate-reader" className="overflow-hidden rounded-base border-2 border-black bg-black" />{!running ? <Button onClick={() => void start()} className="cursor-pointer">Mulai Kamera</Button> : <Button onClick={() => void stop()} variant="neutral">Hentikan Kamera</Button>}<form onSubmit={manual} className="grid gap-2"><label htmlFor="manual-ticket" className="text-sm font-bold">Input kode manual</label><input id="manual-ticket" value={payload} onChange={(event) => setPayload(event.target.value)} placeholder="tiptip:v1:..." /><Button type="submit" variant="neutral">Periksa Kode</Button></form>{result && <div className={`nb-alert ${result.status === 'VALID' ? 'bg-green-100' : result.error === 'ALREADY_USED' ? 'bg-amber-100' : 'bg-red-100'}`}>{result.status === 'VALID' ? <><strong>Tiket valid</strong><p>{result.attendeeName} · {result.ticketType}</p><p className="text-sm">{result.bookingCode} · {new Date(result.checkedInAt!).toLocaleString('id-ID')}</p></> : <><strong>{result.error === 'ALREADY_USED' ? 'Tiket sudah digunakan' : 'Tiket tidak valid'}</strong><p className="text-sm">Silakan periksa tiket atau event.</p></>}</div>}</div>;
}
