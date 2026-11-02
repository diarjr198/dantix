'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const money = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

type Ticket = { id: string; name: string; price: number };

export function TicketPriceCard({
  tickets,
  eventSlug,
}: {
  tickets: Ticket[];
  eventSlug: string;
}) {
  const [open, setOpen] = useState(false);
  const visibleTickets = tickets.slice(0, 3);

  return (
    <>
      <div className="mt-5 w-full max-w-full rounded-base border-2 border-black bg-white p-4 shadow-shadow">
        <h2 className="font-heading">Harga Tiket</h2>
        <div className="divide-y-2 divide-slate-200">
          {visibleTickets.map((ticket) => (
            <div key={ticket.id} className="flex justify-between gap-3 py-3 text-xs first:pt-4">
              <span className="min-w-0 truncate uppercase">{ticket.name}</span>
              <strong className="shrink-0">{money(ticket.price)}</strong>
            </div>
          ))}
        </div>
        {tickets.length > 3 && (
          <Button
            type="button"
            variant="neutral"
            size="sm"
            onClick={() => setOpen(true)}
            className="mt-2 w-full cursor-pointer"
          >
            Lihat semua tiket
          </Button>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogTitle className="border-b-2 border-slate-200 px-4 py-4 text-sm">
            Harga Tiket
          </DialogTitle>
          <div className="max-h-[60vh] overflow-y-auto px-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex justify-between gap-3 border-b-2 border-slate-200 py-3 text-xs">
                <span className="min-w-0 truncate uppercase">{ticket.name}</span>
                <strong className="shrink-0">{money(ticket.price)}</strong>
              </div>
            ))}
          </div>
          <div className="p-4">
            <Link href={`/event/${eventSlug}?show_options=true`} className="block">
              <Button className="w-full cursor-pointer bg-[#d71955] text-white">Beli Tiket</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
