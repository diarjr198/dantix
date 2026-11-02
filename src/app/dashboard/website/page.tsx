import { redirect } from 'next/navigation';
import { SettingsForm } from '@/components/dashboard/cms-forms';
import { requireAdmin } from '@/server/auth/authorization';
import { getAdminSiteSettings } from '@/server/site-content';

export default async function WebsitePage() {
  try { await requireAdmin(); } catch { redirect('/dashboard'); }
  const settings = await getAdminSiteSettings();
  return <><div className="mb-6"><p className="text-sm text-slate-500">Konten website</p><h1 className="text-3xl font-heading">Pengaturan Website</h1></div><SettingsForm initialSettings={settings as Parameters<typeof SettingsForm>[0]['initialSettings']} /></>;
}
