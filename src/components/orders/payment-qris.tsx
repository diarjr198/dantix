'use client';

import { QRCodeSVG } from 'qrcode.react';

export function PaymentQris({ payload, amount }: { payload: string; amount: number }) {
  return (
    <div className="mt-5 text-center">
      <div className="mx-auto w-fit rounded-lg border bg-white p-3">
        <QRCodeSVG value={payload} size={220} level="M" />
      </div>
      <p className="mt-3 text-xs text-slate-500">Scan QRIS lalu bayar sesuai nominal tepat.</p>
      <strong className="mt-1 block text-xl">Rp{amount.toLocaleString('id-ID')}</strong>
    </div>
  );
}
