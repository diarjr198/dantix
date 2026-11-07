import Link from 'next/link';
import { LogoutButton } from '@/components/auth/logout-button';
import { MobileBottomNav } from '@/components/home/mobile-bottom-nav';
import { Logo } from '@/components/home/logo';
import { buttonVariants } from '@/components/ui/button';
import type { CurrentUser } from '@/server/auth/session';

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0" fill="none"><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

export function Navbar({ user }: { user: CurrentUser | null }) {
  return <>
    <header className="border-b-[3px] border-slate-900 bg-[#ffd23f]">
      <div className="mx-auto grid min-h-20 max-w-[1180px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 md:flex md:flex-nowrap md:gap-5 md:px-8">
        <Logo />
        <div className="justify-self-end md:hidden">
          {user ? <LogoutButton /> : <Link href="/masuk" className={buttonVariants({ variant: 'neutral', size: 'sm', className: 'cursor-pointer' })}>Masuk</Link>}
        </div>
        <form id="navbar-search-form" action="/#event" className="col-span-2 flex h-11 w-full items-center gap-2 rounded-base border-2 border-black bg-white px-3 shadow-shadow md:col-span-1 md:ml-2 md:max-w-[400px]">
          <SearchIcon />
          <input id="navbar-search-input" name="q" type="search" placeholder="Cari event, artist, lokasi" aria-label="Cari event, artist, lokasi" className="min-w-0 flex-1 appearance-none p-0 text-sm outline-none ring-0 placeholder:text-slate-500 focus:ring-0" />
        </form>
        <div className="ml-auto hidden items-center gap-3 md:flex">
          <label className="sr-only" htmlFor="site-language">Bahasa</label>
          <select id="site-language" defaultValue="ID" className="h-9 cursor-pointer rounded-base border-2 border-black bg-white px-2 text-xs font-heading shadow-shadow outline-none"><option value="ID">ID</option><option value="EN">EN</option></select>
          {user ? <>
            <Link id="navbar-action-orders" href="/pesanan" style={{ backgroundColor: '#b9fbc0' }} className={buttonVariants({ variant: 'neutral', size: 'sm', className: 'cursor-pointer text-xs' })}>Pesanan</Link>
            <Link href="/profile" style={{ backgroundColor: '#fbc4d9' }} className={buttonVariants({ variant: 'neutral', size: 'sm', className: 'cursor-pointer text-xs' })}>Profil</Link>
            {user.role !== 'CUSTOMER' && <Link id="navbar-action-dashboard" href="/dashboard" style={{ backgroundColor: '#a9def9' }} className={buttonVariants({ variant: 'neutral', size: 'sm', className: 'cursor-pointer text-xs' })}>Dashboard</Link>}
            <LogoutButton />
          </> : <>
            <Link href="/masuk" className={buttonVariants({ variant: 'neutral', size: 'sm', className: 'cursor-pointer' })}>Masuk</Link>
            <Link href="/daftar" className={buttonVariants({ size: 'sm', className: 'cursor-pointer bg-[#00a884] text-white' })}>Daftar</Link>
          </>}
        </div>
      </div>
    </header>
    <MobileBottomNav user={user} />
  </>;
}
