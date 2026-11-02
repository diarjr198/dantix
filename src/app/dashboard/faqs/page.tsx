import { redirect } from 'next/navigation';
import { FaqManager } from '@/components/dashboard/cms-forms';
import { requireAdmin } from '@/server/auth/authorization';
import { listAdminFaqs } from '@/server/site-content';

export default async function FaqsPage() {
  try { await requireAdmin(); } catch { redirect('/dashboard'); }
  const faqs = await listAdminFaqs();
  return <><div className="mb-6"><p className="text-sm text-slate-500">Konten website</p><h1 className="text-3xl font-heading">Kelola FAQ</h1></div><FaqManager initialFaqs={faqs as Parameters<typeof FaqManager>[0]['initialFaqs']} /></>;
}
