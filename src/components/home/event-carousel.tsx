'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef } from 'react';

export type EventCardData = {
  title: string;
  date: string;
  location: string;
  price: string;
  originalPrice?: string;
  posterLabel?: string;
  posterTheme?: string;
  imageUrl?: string;
  slug?: string;
};

type EventCarouselProps = {
  title: string;
  accent?: string;
  events: readonly EventCardData[];
  showAll?: boolean;
};

function Arrow({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none">
      <path
        d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 6 6 6-6 6'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EventCard({ event }: { event: EventCardData }) {
  return (
    <article className="w-[250px] shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:w-[270px]">
      {event.imageUrl ? (
        <img
          src={event.imageUrl}
          alt={event.title}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div
          className={`relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br ${event.posterTheme ?? 'from-[#e51d59] to-[#ff7800]'} p-5 text-center text-white`}
        >
          <p className="relative max-w-44 text-xl leading-tight font-black tracking-[-0.03em]">
            {event.posterLabel ?? event.title}
          </p>
        </div>
      )}
      <div className="p-4">
        <h3 className="line-clamp-2 min-h-10 text-sm leading-5 font-bold text-slate-900">
          {event.slug ? (
            <Link href={`/event/${event.slug}`}>{event.title}</Link>
          ) : (
            event.title
          )}
        </h3>
        <div className="mt-3 space-y-2 text-xs text-slate-500">
          <p>▣ {event.date}</p>
          <p className="truncate">⌖ {event.location}</p>
        </div>
        <p className="mt-4 text-sm font-bold text-[#ff4f3d]">{event.price}</p>
        {event.originalPrice ? (
          <p className="text-xs text-slate-400 line-through">
            {event.originalPrice}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function EventCarousel({
  title,
  accent,
  events,
  showAll = false,
}: EventCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const move = useCallback((direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) return;
    const next = direction > 0 && track.scrollLeft >= maxScroll - 8 ? 0 : track.scrollLeft + direction * 290;
    track.scrollTo({ left: Math.max(0, Math.min(next, maxScroll)), behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (events.length < 2) return;
    const interval = window.setInterval(() => move(1), 3000);
    return () => window.clearInterval(interval);
  }, [events.length, move]);

  return (
    <section className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6 sm:py-14">
      <h2 className="mb-7 text-center text-2xl font-black tracking-[-0.03em] text-slate-900 sm:text-3xl">
        {title}{' '}
        {accent ? (
          <em className="font-medium text-[#ff4f3d]">{accent}</em>
        ) : null}
      </h2>

      <div className="relative">
        <div
          ref={trackRef}
          className="flex snap-x [scrollbar-width:none] gap-4 overflow-x-auto pb-3 [&::-webkit-scrollbar]:hidden"
        >
          {events.map((event) => (
            <div key={event.title} className="snap-start">
              <EventCard event={event} />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label={`Geser ${title} ke kiri`}
          className="absolute top-1/2 -left-3 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-[#ff4f3d] bg-white text-[#ff4f3d] shadow-md hover:bg-[#fff5f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff4f3d] sm:grid"
        >
          <Arrow direction="left" />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label={`Geser ${title} ke kanan`}
          className="absolute top-1/2 -right-3 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-[#ff4f3d] bg-white text-[#ff4f3d] shadow-md hover:bg-[#fff5f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff4f3d] sm:grid"
        >
          <Arrow direction="right" />
        </button>
      </div>

      {showAll ? (
        <a
          href="#event"
          className="mx-auto mt-5 flex w-fit items-center gap-3 rounded border border-[#ff4f3d] px-7 py-2 text-xs font-bold text-[#ff4f3d] hover:bg-[#fff5f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff4f3d]"
        >
          Lihat Semua Event <span aria-hidden="true">→</span>
        </a>
      ) : null}
    </section>
  );
}
