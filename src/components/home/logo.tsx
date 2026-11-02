'use client';

import Link from 'next/link';
import { useSiteBrand } from '@/components/site-brand-provider';

export function Logo() {
  const { siteName, logoUrl } = useSiteBrand();
  return (
    <Link
      href="/"
      className="flex items-center text-[1.75rem] font-black tracking-[-0.08em] text-[#00a884] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00a884]"
      aria-label={`${siteName} home`}
    >
      {logoUrl ? <img src={logoUrl} alt={siteName} className="h-10 max-w-40 object-contain" /> : siteName}
    </Link>
  );
}
