import {
  EventCarousel,
  type EventCardData,
} from '@/components/home/event-carousel';
type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  bannerImageUrl: string;
  location: string;
  city: string;
  startsAt: string;
  price: number;
};
export function FeaturedEvents({ events }: { events: PublicEvent[] }) {
  const cards: EventCardData[] = events.map((event) => ({
    title: event.title,
    date: new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(event.startsAt)),
    location: event.location,
    price: new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(event.price),
    imageUrl: event.bannerImageUrl,
    slug: event.slug,
  }));
  return (
    <div id="event" className="bg-white">
      <EventCarousel
        title="Pilihan Teratas"
        accent="untuk Kamu"
        events={cards}
        showAll
      />
      <EventCarousel title="Events of The Month" events={cards} />
    </div>
  );
}
