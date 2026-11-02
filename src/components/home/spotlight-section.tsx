import Link from 'next/link';

type SpotlightEvent = {
  id: string;
  slug: string;
  title: string;
  bannerImageUrl: string;
  city: string;
  startsAt: string;
  price: number;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);

export function SpotlightSection({ events }: { events: SpotlightEvent[] }) {
  return (
    <section
      id="spotlight"
      aria-labelledby="spotlight-title"
      className="mx-auto max-w-[1240px] px-4 pb-12 sm:px-6 sm:pb-16"
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[#00a884] uppercase">
            Pilihan minggu ini
          </p>
          <h2
            id="spotlight-title"
            className="mt-1 text-2xl font-black tracking-[-0.03em] text-slate-900 sm:text-3xl"
          >
            Spotlight
          </h2>
        </div>
        <Link
          href="#event"
          className="text-sm font-bold text-[#00a884] hover:text-[#008e70]"
        >
          Lihat semua
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/event/${event.slug}`}
            className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00a884]"
          >
            <img
              src={event.bannerImageUrl}
              alt={event.title}
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="p-4">
              <h3 className="line-clamp-2 text-sm leading-5 font-bold text-slate-900">
                {event.title}
              </h3>
              <div className="mt-3 space-y-2 text-xs text-slate-500">
                <p>
                  ▣{' '}
                  {new Intl.DateTimeFormat('id-ID', {
                    dateStyle: 'medium',
                  }).format(new Date(event.startsAt))}
                </p>
                <p>⌖ {event.city}</p>
              </div>
              <p className="mt-4 text-sm font-bold text-[#ff4f3d]">
                {formatPrice(event.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
