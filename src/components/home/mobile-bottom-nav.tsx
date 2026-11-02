'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Grid2X2, House, Ticket } from 'lucide-react';
import { LogoutButton } from '@/components/auth/logout-button';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CurrentUser } from '@/server/auth/session';

const items = [
  { label: 'Home', href: '/', icon: House },
  { label: 'Pesanan', href: '/pesanan', icon: Ticket },
] as const;

export function MobileBottomNav({ user }: { user: CurrentUser | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href.split('#')[0]);

  return (
    <>
      <nav aria-label="Navigasi mobile" className="mobile-bottom-nav md:hidden">
        {items.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return <Link key={label} href={href} aria-current={active ? 'page' : undefined} className={`mobile-bottom-nav__item${active ? ' is-active' : ''}`}><Icon aria-hidden="true" /><span>{label}</span></Link>;
        })}
        <button type="button" aria-label="Buka menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)} className={`mobile-bottom-nav__item${menuOpen ? ' is-active' : ''}`}><Grid2X2 aria-hidden="true" /><span>Menu</span></button>
      </nav>
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="md:hidden">
          <DialogHeader><DialogTitle>Menu</DialogTitle><DialogDescription>Akses cepat akun dan halaman utama.</DialogDescription></DialogHeader>
          <div className="grid gap-3">
            {user ? <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="mobile-menu-link">Dashboard</Link>
              <Link href="/pesanan" onClick={() => setMenuOpen(false)} className="mobile-menu-link">Pesanan</Link>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="mobile-menu-link">Profil</Link>
              <LogoutButton />
            </> : <>
              <Link href="/masuk" onClick={() => setMenuOpen(false)} className="mobile-menu-link">Masuk</Link>
              <Link href="/daftar" onClick={() => setMenuOpen(false)} className="mobile-menu-link">Daftar</Link>
              <Link href="/pesanan" onClick={() => setMenuOpen(false)} className="mobile-menu-link">Pesanan</Link>
            </>}
            <Button type="button" variant="neutral" onClick={() => setMenuOpen(false)}>Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
