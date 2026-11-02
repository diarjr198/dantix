'use client';
import { useEffect, useState } from 'react';
const tabs = [{ id: 'tentang', label: 'Tentang' }, { id: 'lokasi', label: 'Lokasi' }, { id: 'penyelenggara', label: 'Penyelenggara' }, { id: 'syarat', label: 'Syarat & Ketentuan' }] as const;
export function EventDetailTabs({ idPrefix = '' }: { idPrefix?: string }) {
  const [active, setActive] = useState<string>('tentang');
  useEffect(() => {
    const firstSection = document.getElementById(`${idPrefix}${tabs[0].id}`);
    const scrollRoot = firstSection?.closest('[data-event-preview-scroll]') as HTMLElement | null;
    const updateActive = () => {
      const marker = scrollRoot ? scrollRoot.getBoundingClientRect().top + 130 : 130;
      let current: string = tabs[0].id;
      for (const tab of tabs) { const section = document.getElementById(`${idPrefix}${tab.id}`); if (section && section.getBoundingClientRect().top <= marker) current = tab.id; }
      const nearBottom = scrollRoot ? scrollRoot.scrollTop + scrollRoot.clientHeight >= scrollRoot.scrollHeight - 4 : window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      setActive(nearBottom ? tabs[tabs.length - 1].id : current);
    };
    updateActive();
    const target: Window | HTMLElement = scrollRoot ?? window;
    target.addEventListener('scroll', updateActive, { passive: true }); window.addEventListener('resize', updateActive);
    return () => { target.removeEventListener('scroll', updateActive); window.removeEventListener('resize', updateActive); };
  }, [idPrefix]);
  function select(id: string) { setActive(id); document.getElementById(`${idPrefix}${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  return <nav className="sticky top-0 z-10 mt-7 flex gap-2 overflow-x-auto border-b-2 border-black bg-[#fffdf5] p-2 text-xs">{tabs.map((tab) => <button type="button" key={tab.id} onClick={() => select(tab.id)} aria-current={active === tab.id ? 'location' : undefined} className={`shrink-0 rounded-base border-2 border-black px-3 py-2 font-heading ${active === tab.id ? 'bg-[#e51d59] text-white shadow-shadow' : 'bg-white'}`}>{tab.label}</button>)}</nav>;
}
