'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EventDetailContent } from '@/components/events/event-detail';
type EventData = NonNullable<Awaited<ReturnType<typeof import('@/server/events').publicEvent>>>;
export function EventPreviewDialog({ event }: { event: EventData }) { return <Dialog><DialogTrigger render={<Button variant="neutral" size="sm" className="cursor-pointer" />}>Lihat</DialogTrigger><DialogContent className="fixed inset-0 h-dvh max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none border-0 p-0 shadow-none sm:max-w-none" data-event-preview-scroll=""><DialogHeader className="sr-only"><DialogTitle>Preview {event.title}</DialogTitle></DialogHeader><div className="min-h-full bg-[#fffdf5] pt-10"><EventDetailContent event={event} showPurchase={false} preview /></div></DialogContent></Dialog>; }
