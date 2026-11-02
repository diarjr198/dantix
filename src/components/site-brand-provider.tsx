'use client';

import { createContext, useContext } from 'react';

type SiteBrand = { siteName: string; logoUrl: string };

const SiteBrandContext = createContext<SiteBrand>({ siteName: 'TipTip', logoUrl: '' });

export function SiteBrandProvider({ brand, children }: { brand: SiteBrand; children: React.ReactNode }) {
  return <SiteBrandContext.Provider value={brand}>{children}</SiteBrandContext.Provider>;
}

export function useSiteBrand() {
  return useContext(SiteBrandContext);
}
