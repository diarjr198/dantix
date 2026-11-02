export function InitialSetup() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
      <p className="mb-4 text-sm font-semibold tracking-[0.25em] text-cyan-300 uppercase">
        tiptip-starter
      </p>
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
        Fondasi platform tiket konser dan event.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
        Initial setup Next.js, MongoDB, dan Mongoose untuk pengembangan fitur
        event berikutnya.
      </p>
      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
        Scope tahap ini: konfigurasi, koneksi database, schema, indeks, health
        check, dan halaman awal.
      </div>
    </main>
  );
}
