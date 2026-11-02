'use client';
import { useState } from 'react';
import { EventDetail } from './event-detail';
import { OrderDetails } from './order-details';
import type { CurrentUser } from '@/server/auth/session';
import type { FooterSettings } from '@/components/home/footer';

function consumeSavedOrder(slug: string) {
  if (typeof window === 'undefined') return null;
  const key = `tiptip-order:${slug}`;
  const saved = sessionStorage.getItem(key);
  sessionStorage.removeItem(key);
  if (!saved) return null;
  try { return JSON.parse(saved) as Record<string, number>; } catch { return null; }
}
type EventData = NonNullable<
  Awaited<ReturnType<typeof import('@/server/events').publicEvent>>
>;
export function EventOrderPage({
  event,
  user,
  settings,
}: {
  event: EventData;
  user: CurrentUser | null;
  settings: FooterSettings;
}) {
  const [order] = useState<Record<string, number> | null>(() =>
    consumeSavedOrder(event.slug),
  );
  if (order && Object.values(order).some(Boolean))
    return <OrderDetails event={event} user={user} quantities={order} settings={settings} />;
  return <EventDetail event={event} user={user} settings={settings} />;
}
