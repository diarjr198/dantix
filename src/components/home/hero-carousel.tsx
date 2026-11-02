'use client';

import { useEffect, useState } from 'react';

const slides = [
  {
    eyebrow: 'Tiket konser favoritmu',
    title: 'Temukan keseruan di setiap panggung.',
    description:
      'Jelajahi konser, festival, dan event pilihan dalam satu tempat.',
    cta: 'Cari Event',
    theme: 'from-[#071d22] via-[#10343a] to-[#087c6d]',
    accent: 'bg-[#9bf5d5]',
  },
  {
    eyebrow: 'Event pilihan minggu ini',
    title: 'Momen terbaik dimulai dari sini.',
    description: 'Pilih pengalaman baru dan pesan tiketmu dengan lebih mudah.',
    cta: 'Lihat Pilihan',
    theme: 'from-[#1d1539] via-[#402568] to-[#c0527d]',
    accent: 'bg-[#ffc0d5]',
  },
  {
    eyebrow: 'Nikmati pengalaman langsung',
    title: 'Lebih dekat dengan artis favoritmu.',
    description:
      'Jangan lewatkan jadwal terbaru dari berbagai kota di Indonesia.',
    cta: 'Jelajahi Jadwal',
    theme: 'from-[#1c1a0f] via-[#4d4018] to-[#b77a1f]',
    accent: 'bg-[#ffe093]',
  },
] as const;

function Arrow({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none">
      <path
        d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 6 6 6-6 6'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4000);
    return () => window.clearInterval(interval);
  }, []);

  const move = (offset: number) => {
    setActiveIndex(
      (current) => (current + offset + slides.length) % slides.length,
    );
  };

  return (
    <section
      className="mx-auto max-w-[1240px] px-4 py-5 sm:px-6 sm:py-8"
      aria-roledescription="carousel"
      aria-label="Event unggulan"
    >
      <div
        className={`relative isolate min-h-[390px] overflow-hidden rounded-[1.75rem] bg-gradient-to-r ${activeSlide.theme} px-7 py-12 text-white shadow-[0_22px_60px_rgba(15,23,42,0.16)] sm:min-h-[420px] sm:px-14 lg:px-20`}
      >
        <div className="absolute inset-0 -z-10 [background-image:radial-gradient(circle_at_72%_50%,rgba(255,255,255,.28),transparent_20%),radial-gradient(circle_at_88%_22%,rgba(255,255,255,.18),transparent_12%)] opacity-40" />
        <div
          className={`absolute top-8 -right-16 -z-10 size-72 rotate-12 rounded-[4rem] ${activeSlide.accent} opacity-20 sm:right-10 sm:size-80`}
        />
        <div className="absolute right-[12%] bottom-[-7rem] -z-10 h-64 w-72 rotate-[-12deg] rounded-[50%] border-[42px] border-white/10 sm:w-96" />

        <div className="flex min-h-[290px] max-w-2xl flex-col justify-center">
          <p className="mb-4 text-xs font-bold tracking-[0.22em] text-[#9bf5d5] uppercase">
            {activeSlide.eyebrow}
          </p>
          <h1 className="max-w-xl text-4xl leading-[1.08] font-black tracking-[-0.04em] sm:text-5xl lg:text-[3.5rem]">
            {activeSlide.title}
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/75 sm:text-base">
            {activeSlide.description}
          </p>
          <a
            href="#event"
            className="mt-7 w-fit rounded-full bg-white px-6 py-3 text-sm font-bold text-[#087c6d] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            {activeSlide.cta}
          </a>
        </div>

        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Banner sebelumnya"
          className="absolute top-1/2 left-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-5"
        >
          <Arrow direction="left" />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Banner berikutnya"
          className="absolute top-1/2 right-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-5"
        >
          <Arrow direction="right" />
        </button>

        <div
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2"
          role="group"
          aria-label="Pilih banner"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Tampilkan banner ${index + 1}`}
              aria-current={index === activeIndex}
              className={`h-2.5 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${index === activeIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
