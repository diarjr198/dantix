const companyLinks = [
  'Pusat Bantuan',
  'About Us',
  'Terms & Conditions',
  'Career',
];

export type FooterSettings = { siteName: string; logoUrl: string; address: string; aboutTitle: string; aboutDescription: string; contactEmail: string; contactPhone: string; instagramUrl: string; xUrl: string; facebookUrl: string };

export function Footer({ settings }: { settings?: FooterSettings }) {
  return (
    <footer className="bg-[#f4f4f4] px-5 py-10 text-sm text-slate-700 sm:px-10">
      <div className="mx-auto grid max-w-[1140px] gap-9 md:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
        <div>
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.siteName}
              className="h-12 max-w-56 object-contain object-left"
            />
          ) : (
            <p className="text-3xl font-black tracking-[-0.08em] text-[#e51d59]">
              <span className="text-[#ff7800]">▶</span>{' '}
              {settings?.siteName ?? 'TipTip'}
            </p>
          )}
          {settings?.address ? <p className="mt-5 max-w-56 text-xs leading-5">{settings.address}</p> : null}
          <p className="mt-3 max-w-56 text-xs leading-5">{settings?.aboutDescription ?? 'TipTip membantu kamu menemukan event dan membeli tiket dengan mudah.'}</p>
          {settings?.contactPhone ? <p className="mt-3 text-xs">◉ {settings.contactPhone}</p> : null}
          {settings?.contactEmail ? <p className="mt-2 text-xs">✉ {settings.contactEmail}</p> : null}
          <h3 className="mt-7 font-bold text-slate-900">
            Terhubung dengan Kami
          </h3>
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-[#e51d59]">
            {settings?.instagramUrl ? <a href={settings.instagramUrl} target="_blank" rel="noreferrer">Instagram</a> : null}
            {settings?.xUrl ? <a href={settings.xUrl} target="_blank" rel="noreferrer">X</a> : null}
            {settings?.facebookUrl ? <a href={settings.facebookUrl} target="_blank" rel="noreferrer">Facebook</a> : null}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-slate-900">Company</h3>
          <ul className="mt-4 space-y-2 text-xs underline decoration-slate-400 underline-offset-2">
            {companyLinks.map((link) => (
              <li key={link}>
                <a href="#footer" className="hover:text-[#e51d59]">
                  {link}
                </a>
              </li>
            ))}
          </ul>
          <h3 className="mt-7 font-bold text-slate-900">Ekosistem Kami</h3>
          <p className="mt-4 text-xs">
            <a href="#footer">{settings?.siteName ?? 'TipTip'}</a> <span className="mx-2">·</span>{' '}
            <a href="#footer" className="underline">
              SatuSatu
            </a>
          </p>
        </div>

        <div>
          <h3 className="font-bold text-slate-900">Unduh Aplikasi</h3>
          <ul className="mt-4 space-y-2 text-xs">
            <li>◦ Promo eksklusif di aplikasi</li>
            <li>◦ Pemesanan lebih cepat</li>
            <li>◦ Akses tiket lebih mudah</li>
          </ul>
          <div className="mt-5 flex gap-2">
            <a
              href="#footer"
              className="rounded border border-[#e51d59] px-3 py-2 text-xs text-[#e51d59]"
            >
               iOS
            </a>
            <a
              href="#footer"
              className="rounded border border-[#e51d59] px-3 py-2 text-xs text-[#e51d59]"
            >
              ▣ Android
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-slate-900">Pilihan Pembayaran</h3>
          <p className="mt-4 text-xs font-bold tracking-wider text-[#2064b4]">
            ● VISA · JCB · BCA · ◉
          </p>
          <p className="mt-3 text-xs">gopay　◉　●　dan lainnya</p>
          <h3 className="mt-7 font-bold text-slate-900">Pilihan Paylater</h3>
          <p className="mt-4 text-lg font-black text-[#e51d59]">K　◉</p>
        </div>
      </div>
      <div
        id="footer"
        className="mx-auto mt-8 max-w-[1140px] border-t border-slate-300 pt-5 text-center text-[10px] text-slate-500"
      >
        Direktorat Jenderal Perlindungan Konsumen dan Tertib Niaga Kementerian
        Perdagangan Republik Indonesia　•　☎ 0853–1111–1010
        <p className="mt-3">
          © 2026 {settings?.siteName ?? 'TipTip'}. Seluruh hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}
