'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export function OrderExpiryCountdown({ expiresAt }: { expiresAt: string }) {
  const router = useRouter();
  const refreshed = useRef(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    const deadline = Date.parse(expiresAt);
    let interval: ReturnType<typeof setInterval>;

    function update() {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining === 0 && !refreshed.current) {
        refreshed.current = true;
        clearInterval(interval);
        router.refresh();
      }
    }

    update();
    if (!refreshed.current) interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, router]);

  const minutes = Math.floor((remainingSeconds ?? 0) / 60);
  const seconds = (remainingSeconds ?? 0) % 60;

  return (
    <div className="mt-4 rounded bg-amber-50 p-3 text-amber-700">
      <p className="text-xs">Selesaikan pembayaran sebelum reservasi berakhir.</p>
      <strong className="mt-1 block text-2xl tabular-nums">
        {remainingSeconds === null
          ? '--:--'
          : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
      </strong>
    </div>
  );
}
