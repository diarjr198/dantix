const benefits = [
  { icon: 'ticket', label: 'Tiket Official' },
  { icon: 'bolt', label: 'Pesan Instan' },
  { icon: 'shield', label: 'Bayar Aman' },
] as const;

function BenefitIcon({ type }: { type: (typeof benefits)[number]['icon'] }) {
  const path = {
    ticket: 'M4 7h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V7Zm8 1v10',
    bolt: 'm13 2-8 11h6l-1 9 9-12h-6V2Z',
    shield: 'M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Zm-3 8 2 2 4-4',
  }[type];

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none">
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrustBanner() {
  return (
    <section className="bg-[#fff8f6] px-5 py-9" aria-label="Jaminan platform">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-7 md:flex-row md:justify-center">
        <h2 className="shrink-0 text-center text-xl leading-tight font-bold text-slate-900 md:text-right">
          Platform tiket
          <span className="block font-medium text-[#ff5a3d] italic">
            terpercaya
          </span>
        </h2>

        <div className="w-full max-w-xl">
          <div className="grid grid-cols-3 divide-x divide-slate-300 border-b border-slate-300 pb-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.label}
                className="flex flex-col items-center gap-2 px-2 text-center text-xs text-slate-700 sm:flex-row sm:justify-center sm:text-sm"
              >
                <span className="text-[#ff6a3d]">
                  <BenefitIcon type={benefit.icon} />
                </span>
                {benefit.label}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 text-xs text-slate-700 sm:flex-row sm:gap-0 sm:text-sm">
            <span className="px-4 text-center">
              <b className="text-[#ff6a3d]">✓</b> <b>1M+</b> tiket terjual
            </span>
            <span className="border-slate-300 px-4 text-center sm:border-l">
              <b className="text-[#ff6a3d]">✓</b> Platform tiket <b>100+</b>{' '}
              promotor
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
