import type { Metadata } from 'next';
import { SiteBrandProvider } from '@/components/site-brand-provider';
import { getPublicSiteSettings } from '@/server/site-content';
import './globals.css';

export const metadata: Metadata = {
  title: 'DANTix - Platform Tiket Konser & Event',
  description: 'Temukan tiket konser dan event pilihan di Indonesia.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPublicSiteSettings();
  return (
    <html lang="id">
      <body><SiteBrandProvider brand={{ siteName: settings.siteName, logoUrl: settings.logoUrl }}>{children}</SiteBrandProvider></body>
    </html>
  );
}
