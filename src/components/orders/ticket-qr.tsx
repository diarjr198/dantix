'use client';

import { QRCodeSVG } from 'qrcode.react';

export function TicketQr({ payload, attendeeName, status, checkedInAt }: { payload: string | null; attendeeName: string; status: string; checkedInAt: Date | string | null }) {
  const used = status === 'USED';
  return <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-[160px_1fr] sm:items-center">
    <div className="mx-auto border-2 border-black bg-white p-3 shadow-shadow">
      {payload ? <QRCodeSVG value={payload} size={132} level="M" /> : <div className="flex size-[132px] items-center justify-center text-center text-xs text-slate-500">QR tidak tersedia</div>}
    </div>
    <div><strong>{attendeeName}</strong><p className={`mt-1 text-sm font-bold ${used ? 'text-amber-700' : 'text-[#00a884]'}`}>{used ? 'Sudah check-in' : 'Aktif'}</p>{checkedInAt ? <p className="mt-1 text-xs text-slate-500">Check-in {new Date(checkedInAt).toLocaleString('id-ID')}</p> : <p className="mt-1 text-xs text-slate-500">Tunjukkan QR ini kepada petugas gate.</p>}</div>
  </div>;
}
