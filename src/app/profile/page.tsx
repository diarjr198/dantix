import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Footer } from '@/components/home/footer';
import { Navbar } from '@/components/home/navbar';
import { ProfileForm } from '@/components/profile/profile-form';
import { getCurrentUser } from '@/server/auth/session';
import { getPublicSiteSettings } from '@/server/site-content';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return { title: `Profil | ${settings.siteName}`, description: `Kelola profil akun ${settings.siteName}.` };
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/masuk');
  const settings = await getPublicSiteSettings();
  return <><Navbar user={user} /><main className="min-h-[70vh] bg-[#fffdf5] px-5 py-10"><div className="mx-auto max-w-xl"><ProfileForm profile={{ name: user.name, email: user.email ?? '' }} /></div></main><Footer settings={settings} /></>;
}
