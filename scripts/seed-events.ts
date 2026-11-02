import 'dotenv/config';
import { hash } from 'bcryptjs';
import {
  connectDatabase,
  disconnectDatabase,
} from '../src/server/db/connection';
import { UserModel } from '../src/server/models/user';
import { OrganizerModel } from '../src/server/models/organizer';
import { EventModel } from '../src/server/models/event';
import { TicketTypeModel } from '../src/server/models/ticket-type';
import { SiteSettingsModel } from '../src/server/models/site-settings';
import { FaqModel } from '../src/server/models/faq';
import { generatedEventImage } from '../src/lib/event-image';
import { DEFAULT_EVENT_TERMS } from '../src/constants/event-terms';
import { defaultSiteSettings } from '../src/server/site-content';
import { EventStaffModel } from '../src/server/models/transaction-models';

const adminEmail = 'demo.admin@tiptip.local';
const organizerEmail = 'demo.organizer@tiptip.local';
const gateEmail = 'demo.gate@tiptip.local';
const seedPassword = 'DemoOrganizer123!';
const faqs = [
  [
    'Apa Itu TipTip?',
    'TipTip adalah platform tiket konser dan berbagai tiket event unggulan Indonesia. TipTip menjadi platform terbaik bagi promotor, kreator konten hingga afilator untuk monetisasi dari konser, festival, karya, maupun kegiatan mereka.',
  ],
  [
    'Bagaimana cara membeli tiket konser atau tiket event di TipTip?',
    'Pilih event yang diinginkan, lengkapi data pemesanan, lalu selesaikan pembayaran untuk menerima tiket digital.',
  ],
  [
    'Metode pembayaran apa saja yang tersedia saat ini di TipTip?',
    'Informasi metode pembayaran tersedia saat menyelesaikan pesanan tiket.',
  ],
  [
    'Bagaimana cara melihat tiket yang telah dibeli?',
    'Masuk ke akun TipTip lalu buka menu Pesanan untuk melihat riwayat dan tiket yang sudah diterbitkan.',
  ],
  [
    'Bagaimana cara menjadi pengguna atau user di TipTip?',
    'Pilih Daftar, lengkapi data akun, lalu masuk untuk mulai membeli tiket event.',
  ],
  [
    'Bagaimana cara menjadi promotor atau kreator di TipTip?',
    'Daftar dan buka Dashboard untuk membuat serta mengelola event Anda.',
  ],
] as const;
const fixtures = [
  [
    '2026-ong-seongwu-fanmeeting-jakarta',
    '2026 ONG SEONGWU FANMEETING in Jakarta',
    'Jakarta Selatan',
    'Ciputra Artpreneur Jakarta',
    'Jl. Prof. DR. Satrio Kav. 3-5',
    0,
  ],
  [
    'creative-market-music-weekend',
    'Creative Market & Music Weekend',
    'Jakarta',
    'Creative Hub Jakarta',
    'Jl. Jend. Sudirman No. 1',
    1,
  ],
  [
    'sound-of-nusantara-2026',
    'Sound of Nusantara 2026',
    'Yogyakarta',
    'Taman Budaya Yogyakarta',
    'Jl. Sriwedani No. 1',
    2,
  ],
  [
    'jakarta-music-weekend-2026',
    'Jakarta Music Weekend 2026',
    'Jakarta',
    'GBK Senayan',
    'Jl. Pintu Satu Senayan',
    3,
  ],
  [
    'bandung-jazz-festival',
    'Bandung Jazz Festival',
    'Bandung',
    'Trans Convention Centre',
    'Jl. Gatot Subroto No. 289',
    4,
  ],
  [
    'surabaya-its-run-festival',
    'Surabaya ITS Run Festival',
    'Surabaya',
    'Balai Kota Surabaya',
    'Jl. Taman Surya No. 1',
    5,
  ],
  [
    'talesverse-creative-expo',
    'Talesverse Creative Expo',
    'Jakarta Selatan',
    'Brickhall Fatmawati',
    'Jl. RS Fatmawati No. 39',
    6,
  ],
  [
    'night-of-tribute-dpoc',
    'Night of Tribute DPOC Vol. 10',
    'Serang',
    'Gedung Juang Kota Serang',
    'Jl. Veteran No. 5',
    7,
  ],
  [
    'concertino-the-prelude',
    'Concertino Jakarta: The Prelude',
    'Jakarta',
    'Financial Club Jakarta',
    'Jl. Jend. Sudirman Kav. 52',
    8,
  ],
  [
    'imperfect-sale-2026',
    'Imperfect Sale 2026',
    'Jakarta Selatan',
    'Blok M Square',
    'Jl. Melawai V No. 1',
    9,
  ],
  [
    'bilature-aethera-2026',
    'Bilature Aethera 2026',
    'Bandung',
    'Lapangan PPNS',
    'Jl. Raya Bandung Sumedang Km. 21',
    10,
  ],
  [
    'bali-sunset-sessions',
    'Bali Sunset Sessions',
    'Badung',
    'Pantai Berawa',
    'Jl. Pantai Berawa',
    11,
  ],
  [
    'semarang-food-carnival',
    'Semarang Food Carnival',
    'Semarang',
    'Kota Lama Semarang',
    'Jl. Letjen Suprapto',
    12,
  ],
  [
    'malang-art-week',
    'Malang Art Week',
    'Malang',
    'Malang Creative Center',
    'Jl. Ahmad Yani No. 53',
    13,
  ],
  [
    'makassar-indie-fest',
    'Makassar Indie Fest',
    'Makassar',
    'Fort Rotterdam',
    'Jl. Ujung Pandang No. 1',
    14,
  ],
  [
    'medan-coffee-culture',
    'Medan Coffee Culture',
    'Medan',
    'Taman Ahmad Yani',
    'Jl. Imam Bonjol',
    15,
  ],
  [
    'solo-batik-concert',
    'Solo Batik Concert',
    'Surakarta',
    'Pura Mangkunegaran',
    'Jl. Ronggowarsito',
    16,
  ],
  [
    'lombok-beach-festival',
    'Lombok Beach Festival',
    'Lombok',
    'Pantai Senggigi',
    'Jl. Raya Senggigi',
    17,
  ],
  [
    'bogor-flower-market',
    'Bogor Flower Market',
    'Bogor',
    'Kebun Raya Bogor',
    'Jl. Ir. H. Juanda No. 13',
    18,
  ],
  [
    'new-year-festival-bali',
    'New Year Festival Bali',
    'Denpasar',
    'Lapangan Puputan Badung',
    'Jl. Gajah Mada',
    19,
  ],
] as const;

async function main() {
  await connectDatabase();
  await EventModel.updateMany({}, { $set: { terms: DEFAULT_EVENT_TERMS } });
  const passwordHash = await hash(seedPassword, 10);
  await UserModel.findOneAndUpdate(
    { email: adminEmail },
    {
      $set: {
        name: 'Demo Admin',
        email: adminEmail,
        passwordHash,
        isAdmin: true,
        role: 'ADMIN',
        active: true,
      },
    },
    { upsert: true, returnDocument: 'after' },
  );
  const gateUser = await UserModel.findOneAndUpdate(
    { email: gateEmail },
    { $set: { name: 'Demo Gate', email: gateEmail, passwordHash, isAdmin: false, role: 'GATE', active: true } },
    { upsert: true, returnDocument: 'after' },
  );
  const organizerUser = await UserModel.findOneAndUpdate(
    { email: organizerEmail },
    {
      $set: {
        name: 'Demo Organizer',
        email: organizerEmail,
        passwordHash,
        isAdmin: false,
        role: 'ORGANIZER',
        active: true,
      },
    },
    { upsert: true, returnDocument: 'after' },
  );
  const organizer = await OrganizerModel.findOneAndUpdate(
    { ownerUserId: organizerUser._id },
    {
      $set: {
        name: 'TipTip Demo Organizer',
        description: 'Penyelenggara event pilihan di TipTip.',
        verificationStatus: 'VERIFIED',
      },
    },
    { upsert: true, returnDocument: 'after' },
  );
  await SiteSettingsModel.findOneAndUpdate(
    { key: 'default' },
    { $setOnInsert: { ...defaultSiteSettings, key: 'default' } },
    { upsert: true, returnDocument: 'after' },
  );
  for (const [sortOrder, [question, answer]] of faqs.entries()) {
    await FaqModel.findOneAndUpdate(
      { question },
      { $set: { question, answer, sortOrder, published: true } },
      { upsert: true, returnDocument: 'after' },
    );
  }
  for (const [slug, title, city, venueName, venueAddress, index] of fixtures) {
    const startsAt = new Date(
      Date.UTC(
        2026,
        10 + Math.floor(index / 6),
        1 + (index % 6) * 4,
        11 + (index % 7),
        0,
      ),
    );
    const endsAt = new Date(startsAt.getTime() + 4 * 60 * 60 * 1000);
    const event = await EventModel.findOneAndUpdate(
      { slug },
      {
        $set: {
          organizerId: organizer._id,
          title,
          shortDescription: 'Event seru pilihan TipTip.',
          description: `${title}\n\nNikmati pengalaman tak terlupakan bersama TipTip.`,
          bannerImageUrl:
            index === 1
              ? 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200'
              : generatedEventImage(title),
          seatMapMode: 'DEFAULT',
          seatMapImageUrl: undefined,
          location: `${venueName}, ${city}`,
          venueName,
          venueAddress,
          city,
          terms: DEFAULT_EVENT_TERMS,
          startsAt,
          endsAt,
          status: 'PUBLISHED',
          moderationStatus: 'APPROVED',
          guestCheckoutEnabled: true,
        },
      },
      { upsert: true, returnDocument: 'after' },
    );
    const regularPrice = 50000 + index * 10000;
    for (const ticket of [
      {
        name: 'Platinum',
        price: regularPrice + 350000,
        quota: 60,
        benefits: ['Area terdekat panggung', 'Jalur masuk prioritas'],
      },
      {
        name: 'Gold',
        price: regularPrice + 250000,
        quota: 100,
        benefits: ['Area Gold', 'Merchandise event'],
      },
      {
        name: 'Stall',
        price: regularPrice + 150000,
        quota: 180,
        benefits: ['Area Stall', 'Akses event'],
      },
      {
        name: 'Silver',
        price: regularPrice + 90000,
        quota: 220,
        benefits: ['Area Silver', 'Akses event'],
      },
      {
        name: 'Bronze',
        price: regularPrice + 40000,
        quota: 300,
        benefits: ['Area Bronze', 'Akses event'],
      },
      {
        name: 'Balcony',
        price: regularPrice,
        quota: 400,
        benefits: ['Area Balcony', 'Akses event'],
      },
    ].map((ticket, sortOrder) => ({ ...ticket, sortOrder }))) {
      await TicketTypeModel.findOneAndUpdate(
        { eventId: event._id, name: ticket.name },
        {
          $set: {
            ...ticket,
            salesStartAt: new Date('2026-01-01T00:00:00Z'),
            salesEndAt: startsAt,
            maxPerOrder: 10,
          },
        },
        { upsert: true, returnDocument: 'after' },
      );
    }
    await EventStaffModel.findOneAndUpdate(
      { eventId: event._id, userId: gateUser._id },
      { $set: { role: 'CHECKIN', active: true } },
      { upsert: true, returnDocument: 'after' },
    );
    console.log(`Seeded ${slug}`);
  }
}
main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
