'use client';

import Link from 'next/link';
import { useSiteBrand } from '@/components/site-brand-provider';

export function AuthLogo() {
  const { siteName, logoUrl } = useSiteBrand();
  return <Link href="/" aria-label={`${siteName} home`} className="flex items-center gap-1.5 text-2xl font-black text-[#e51d59] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e51d59]">
    {logoUrl ? <img src={logoUrl} alt={siteName} className="h-9 max-w-44 object-contain" /> : siteName}
  </Link>;
}
