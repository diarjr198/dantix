import { HomePage } from '@/components/home-page';
import { getCurrentUser } from '@/server/auth/session';
import { publicEvents } from '@/server/events';
import { getPublicSiteSettings, listPublicFaqs } from '@/server/site-content';

type HomeProps = {
  searchParams: Promise<{ auth?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const [user, params, events, publishedFaqs, settings] = await Promise.all([
    getCurrentUser(),
    searchParams,
    publicEvents(),
    listPublicFaqs(),
    getPublicSiteSettings(),
  ]);
  const authSuccess =
    params.auth === 'login' || params.auth === 'register'
      ? params.auth
      : undefined;

  return <HomePage user={user} authSuccess={authSuccess} events={events} publishedFaqs={publishedFaqs as Parameters<typeof HomePage>[0]['publishedFaqs']} settings={settings as Parameters<typeof HomePage>[0]['settings']} />;
}
