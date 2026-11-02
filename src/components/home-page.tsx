import type { CurrentUser } from '@/server/auth/session';
import { AuthSuccessToast } from '@/components/auth/auth-success-toast';
import { FaqSection } from '@/components/home/faq-section';
import { FeaturedEvents } from '@/components/home/featured-events';
import { Footer } from '@/components/home/footer';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { Navbar } from '@/components/home/navbar';
import { SpotlightSection } from '@/components/home/spotlight-section';
import { TrustBanner } from '@/components/home/trust-banner';

type HomePageProps = {
  user: CurrentUser | null;
  authSuccess?: 'login' | 'register';
  events: Parameters<typeof FeaturedEvents>[0]['events'];
  publishedFaqs: Parameters<typeof FaqSection>[0]['faqs'];
  settings: NonNullable<Parameters<typeof Footer>[0]['settings']>;
};

export function HomePage({ user, authSuccess, events, publishedFaqs, settings }: HomePageProps) {
  return (
    <main className="min-h-screen bg-[#fffdf5] text-slate-900">
      {authSuccess ? <AuthSuccessToast action={authSuccess} /> : null}
      <Navbar user={user} />
      <HeroCarousel />
      <SpotlightSection events={events.slice(0, 6)} />
      <TrustBanner />
      <FeaturedEvents events={events} />
      <FaqSection faqs={publishedFaqs} title={settings.aboutTitle} />
      <Footer settings={settings} />
    </main>
  );
}
