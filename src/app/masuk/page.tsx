import type { Metadata } from 'next';

import { LoginPage } from '@/components/auth/login-page';
import { getPublicSiteSettings } from '@/server/site-content';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return {
    title: `Masuk | ${settings.siteName}`,
    description: `Masuk ke ${settings.siteName} menggunakan nomor HP atau email.`,
  };
}

export default function MasukPage() {
  return <LoginPage />;
}
