import type { Metadata } from 'next';

import { RegisterPage } from '@/components/auth/register-page';
import { getPublicSiteSettings } from '@/server/site-content';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return {
    title: `Daftar | ${settings.siteName}`,
    description: `Buat akun ${settings.siteName} menggunakan nomor HP atau email.`,
  };
}

export default function DaftarPage() {
  return <RegisterPage />;
}
