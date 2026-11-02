# TipTip Starter

Platform ticketing event end-to-end berbasis Next.js App Router, TypeScript, Tailwind CSS, MongoDB, dan Mongoose. Aplikasi mencakup katalog event publik, pemesanan tiket, penerbitan QR, dashboard organizer/admin, gate scanner, CMS FAQ/identitas situs, serta pengelolaan user.

## Teknologi

- Node.js 22 LTS, pnpm, Next.js 16, React 19, TypeScript 5
- Tailwind CSS 4 dan komponen neobrutalism berbasis Base UI
- MongoDB dan Mongoose 9
- Zod untuk validasi request
- bcrypt untuk hashing password
- Signed HTTP-only cookie untuk session
- `qrcode.react` untuk tiket QR
- `html5-qrcode` untuk pemindaian kamera

## Role dan akun demo

Jalankan `pnpm db:seed` untuk membuat akun berikut.

| Role      | Email                         | Password               | Login         |
| --------- | ----------------------------- | ---------------------- | ------------- |
| Admin     | `demo.admin@tiptip.local`     | `DemoOrganizer123!`    | `/masuk`      |
| Organizer | `demo.organizer@tiptip.local` | `DemoOrganizer123!`    | `/masuk`      |
| Gate      | `demo.gate@tiptip.local`      | `DemoOrganizer123!`    | `/gate/masuk` |
| Customer  | Tidak dibuat oleh seed        | Buat melalui `/daftar` | `/masuk`      |

Customer sengaja dibuat melalui alur registrasi agar alur pengguna baru dapat diuji. Admin juga dapat membuat user ber-role `CUSTOMER` dari Dashboard → Users.

> Akun demo hanya untuk pengembangan lokal. Ganti password dan secret sebelum digunakan pada environment publik.

## Setup pertama kali

### 1. Prasyarat

Pastikan tersedia:

- Node.js `>=22.12.0 <23`
- pnpm melalui Corepack
- MongoDB lokal atau MongoDB Atlas

Jika menggunakan NVM:

```bash
nvm use
corepack enable
```

### 2. Install dependency

```bash
pnpm install
```

### 3. Konfigurasi environment

Salin contoh environment:

```bash
cp .env.example .env.local
```

Isi `.env.local`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=tiptip_starter
APP_URL=http://localhost:3000
AUTH_SESSION_SECRET=ganti-dengan-random-secret-minimal-32-karakter
```

Keterangan:

- `MONGODB_URI`: alamat server MongoDB tanpa nama database jika `MONGODB_DB_NAME` digunakan terpisah.
- `MONGODB_DB_NAME`: nama database aplikasi.
- `APP_URL`: URL aplikasi.
- `AUTH_SESSION_SECRET`: secret untuk signature session dan derivasi kunci enkripsi credential QR. Gunakan nilai acak minimal 32 karakter dan jangan menggantinya setelah tiket diterbitkan karena credential QR lama dapat gagal didekripsi.

Contoh membuat secret:

```bash
openssl rand -base64 48
```

Jangan memakai prefix `NEXT_PUBLIC_` untuk credential atau secret.

### 4. Jalankan MongoDB

Untuk MongoDB lokal, pastikan servicenya aktif dan dapat diakses melalui nilai `MONGODB_URI`. Jika memakai Atlas, izinkan IP pengembangan dan gunakan connection string Atlas pada `.env.local`.

### 5. Inisialisasi collection dan index

```bash
pnpm db:init
```

Perintah ini:

- Membuat collection yang dibutuhkan.
- Membuat index user, event, order, ticket, check-in, dan collection lain.
- Menangani migrasi index check-in lama.
- Aman dijalankan ulang.
- Tidak menjalankan seed dan tidak menghapus seluruh database.

### 6. Isi data demo

```bash
pnpm db:seed
```

Seed membuat atau memperbarui:

- Akun demo Admin, Organizer, dan Gate.
- Organizer demo terverifikasi.
- 20 event published/approved.
- Enam tier tiket per event.
- Assignment user Gate ke event fixture.
- FAQ publik.
- Default website settings hanya jika settings belum ada.

Seed dapat dijalankan ulang. Website settings yang telah diubah Admin tidak ditimpa karena seed memakai insert-only untuk settings. Namun data fixture event dan akun demo diperbarui ke nilai seed.

### 7. Jalankan development server

```bash
pnpm dev
```

Buka `http://localhost:3000`.

`pnpm dev` tidak otomatis menjalankan `db:init` atau `db:seed`. Jalankan kedua perintah tersebut secara eksplisit saat setup awal atau saat memang diperlukan.

### 8. Verifikasi instalasi

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
```

Health endpoint:

- `GET /api/health`: status aplikasi tanpa memerlukan MongoDB.
- `GET /api/health/db`: status koneksi database; `200` jika ping berhasil dan `503` jika database tidak tersedia.

## Menjalankan production build

```bash
pnpm build
pnpm start
```

Pastikan environment production sudah tersedia, MongoDB dapat dijangkau, `AUTH_SESSION_SECRET` kuat dan stabil, serta aplikasi dijalankan melalui HTTPS agar cookie `Secure` bekerja.

## Gambaran alur sistem

```text
Customer memilih event
  → memilih tier dan jumlah tiket
  → mengisi kontak serta data peserta
  → order PENDING dibuat dan quota direservasi
  → Organizer/Admin mengonfirmasi pembayaran
  → order menjadi PAID
  → tiket + QR terenkripsi diterbitkan
  → Customer membuka QR di detail pesanan
  → Gate yang ditugaskan memindai QR
  → tiket valid berubah ACTIVE → USED
```

Session customer/admin/organizer dan session gate memakai cookie berbeda. Artinya akun customer dapat tetap login di situs publik ketika akun gate login pada browser/domain yang sama.

## Alur Customer

### Tugas dan akses

Customer bertindak sebagai pembeli dan pemilik tiket.

1. Buka homepage `/` dan lihat katalog/spotlight event.
2. Buka detail melalui `/event/[slug]`.
3. Pilih ticket tier dan jumlah tiket.
4. Lanjutkan ke opsi pemesanan.
5. Isi data kontak pemesan dan data tiap peserta, termasuk nama, email, telepon, domisili, dan identitas jika diminta.
6. Submit pesanan. Sistem membuat order berstatus `PENDING` dan mereservasi inventory.
7. Buka `/pesanan` untuk melihat riwayat transaksi.
8. Buka `/pesanan/[orderId]` untuk melihat booking code, peserta, status, dan tiket.
9. Setelah pembayaran dikonfirmasi Organizer/Admin, status menjadi `PAID` dan QR tiket muncul.
10. Tunjukkan QR kepada petugas Gate saat masuk event.
11. Setelah check-in berhasil, status tiket berubah menjadi `USED` dan waktu check-in terlihat pada detail pesanan.

### Akun dan profil

- Registrasi: `/daftar`, menggunakan email atau nomor HP.
- Login: `/masuk`.
- Profil: `/profile` untuk mengubah nama, email, dan password.
- Mengubah email atau password membutuhkan password saat ini.
- Logout hanya menghapus session publik dan tidak mengganggu session Gate.

### Status penting

- Order `PENDING`: menunggu verifikasi pembayaran.
- Order `PAID`: pembayaran dikonfirmasi dan tiket diterbitkan.
- Ticket `ACTIVE`: QR valid dan belum digunakan.
- Ticket `USED`: sudah check-in dan tidak dapat digunakan kembali.
- Ticket `VOID`: tiket tidak berlaku.

## Alur Organizer

### Tugas dan akses

Organizer mengelola event miliknya melalui `/dashboard`.

1. Login melalui `/masuk` menggunakan akun Organizer.
2. Dashboard Overview menampilkan total event, pesanan, pembayaran berhasil, pendapatan, dan pesanan terbaru untuk event miliknya.
3. Buka Dashboard → Events untuk:
   - Membuat event.
   - Mengedit detail event.
   - Mengatur banner, venue, tanggal, deskripsi, terms, seat map, ticket tier, harga, quota, periode penjualan, benefit, dan batas pembelian.
   - Preview event.
   - Menghapus draft yang belum memiliki order.
4. Buka Dashboard → Pesanan untuk:
   - Melihat pesanan event sendiri.
   - Memeriksa booking, pembeli, total, dan status.
   - Mengonfirmasi pembayaran order `PENDING`.
5. Konfirmasi pembayaran menjalankan transaksi database:
   - Order berubah menjadi `PAID`.
   - Payment dicatat.
   - Inventory reserved dipindahkan menjadi sold.
   - Tiket tiap peserta diterbitkan.
   - Credential QR random dibuat, hash disimpan untuk lookup, dan payload terenkripsi disimpan untuk ditampilkan kembali.
6. Buka Dashboard → Tiket Terjual untuk memantau peserta, pembeli, event/tier, booking, dan status tiket.

Organizer hanya dapat mengakses event, order, dan tiket milik organizer yang terhubung ke user tersebut.

## Alur Gate

### Tugas dan akses

Gate adalah petugas check-in dan tidak memakai login publik biasa.

1. Admin membuat atau mengaktifkan user role `GATE`.
2. Admin memberi assignment event kepada user Gate melalui Dashboard → Users.
3. Gate login melalui URL khusus `/gate/masuk`.
4. Setelah login, `/gate` hanya menampilkan event aktif yang ditugaskan.
5. Pilih event untuk membuka `/gate/[eventId]`.
6. Scan QR menggunakan kamera belakang atau masukkan payload secara manual.
7. Server memvalidasi:
   - Session Gate valid.
   - Gate memiliki assignment `CHECKIN` untuk event tersebut.
   - Format dan hash QR valid.
   - Tiket berasal dari event yang dipilih.
   - Status tiket masih `ACTIVE` dan QR `READY`.
8. Check-in dilakukan secara atomic:
   - Ticket berubah `ACTIVE` → `USED`.
   - `checkedInAt` dan petugas disimpan.
   - Audit Checkin dibuat.
9. Scan ulang tiket yang sama ditolak sebagai `ALREADY_USED`.
10. Logout Gate hanya menghapus cookie Gate; session customer/public tetap aktif.

Session Gate disimpan pada `tiptip_gate_session`, terpisah dari session publik `tiptip_session`.

## Alur Admin

### Tugas dan akses

Admin memiliki akses global melalui `/dashboard`.

### Event, order, dan tiket

- Melihat seluruh event dari semua organizer.
- Membuat, preview, mengedit, dan menghapus draft event sesuai aturan data.
- Melihat seluruh pesanan beserta organizer dan detail pembayaran.
- Mengonfirmasi pembayaran order `PENDING`.
- Melihat seluruh tiket terjual dan status QR/check-in.
- Halaman event, pesanan, dan tiket memakai pagination.

### Pengelolaan user

Dashboard → Users menyediakan:

- Daftar user dengan pagination.
- Tambah user melalui modal.
- Edit nama, email, nomor HP, password, role, dan status aktif melalui modal.
- Role tersedia: `ADMIN`, `ORGANIZER`, `CUSTOMER`, dan `GATE`.
- Menonaktifkan user menggunakan soft delete (`active: false`).
- Proteksi agar admin tidak menonaktifkan/menurunkan role dirinya sendiri dan admin aktif terakhir tidak dapat dihapus.
- Assignment user Gate ke satu atau lebih event.

### CMS FAQ

Dashboard → FAQ menyediakan pengelolaan:

- Pertanyaan dan jawaban.
- Urutan tampil.
- Status published/unpublished.

FAQ published tampil pada homepage.

### Identitas website

Dashboard → Website mengelola identitas situs, antara lain:

- Nama website.
- Deskripsi/about.
- Logo.
- Alamat.
- Email dan nomor kontak.
- Link media sosial.

Perubahan digunakan oleh Navbar, Footer, dashboard, halaman login/register, metadata auth, dan halaman profil. Cache layout direvalidasi setelah settings diperbarui.

## Otorisasi dan keamanan

- Password di-hash dengan bcrypt.
- Session memakai token HMAC-SHA256 pada cookie HTTP-only.
- Cookie memakai `SameSite=Lax`, `Secure` pada production, dan masa berlaku tujuh hari.
- Public session tidak menerima role Gate.
- Gate session hanya menerima role Gate atau Admin yang diizinkan.
- API manager memfilter data berdasarkan kepemilikan organizer; Admin mendapat cakupan global.
- Update profil menargetkan user dari session, bukan ID dari request.
- Perubahan email/password membutuhkan password saat ini.
- Credential QR berupa bearer token random versi `tiptip:v1`, disimpan sebagai hash untuk lookup dan AES-256-GCM ciphertext untuk redisplay.
- Check-in memakai conditional update dan unique index agar tiket hanya dapat digunakan sekali meskipun terjadi scan bersamaan.

## Route utama

| Route                | Akses               | Fungsi                            |
| -------------------- | ------------------- | --------------------------------- |
| `/`                  | Publik              | Homepage dan katalog event        |
| `/event/[slug]`      | Publik              | Detail event dan pemilihan tiket  |
| `/daftar`            | Publik              | Registrasi Customer               |
| `/masuk`             | Publik              | Login Customer/Organizer/Admin    |
| `/profile`           | Login publik        | Edit profil sendiri               |
| `/pesanan`           | Login publik        | Riwayat pesanan Customer          |
| `/pesanan/[orderId]` | Pemilik order       | Detail order dan QR tiket         |
| `/dashboard`         | Organizer/Admin     | Ringkasan operasional             |
| `/dashboard/events`  | Organizer/Admin     | CRUD event                        |
| `/dashboard/orders`  | Organizer/Admin     | Pesanan dan konfirmasi pembayaran |
| `/dashboard/tickets` | Organizer/Admin     | Tiket terjual                     |
| `/dashboard/users`   | Admin               | CRUD user dan assignment Gate     |
| `/dashboard/faqs`    | Admin               | CMS FAQ                           |
| `/dashboard/website` | Admin               | Identitas website                 |
| `/gate/masuk`        | Gate                | Login khusus petugas              |
| `/gate`              | Gate                | Daftar assignment event           |
| `/gate/[eventId]`    | Gate ter-assignment | Scanner tiket                     |

## Perintah proyek

| Perintah            | Fungsi                                                  |
| ------------------- | ------------------------------------------------------- |
| `pnpm dev`          | Menjalankan development server tanpa init/seed otomatis |
| `pnpm build`        | Membuat production build                                |
| `pnpm start`        | Menjalankan production build                            |
| `pnpm lint`         | Menjalankan ESLint                                      |
| `pnpm typecheck`    | Memeriksa TypeScript tanpa emit                         |
| `pnpm format`       | Memformat repository dengan Prettier                    |
| `pnpm format:check` | Memeriksa format tanpa mengubah file                    |
| `pnpm db:init`      | Membuat collection/index dan migrasi index terkait      |
| `pnpm db:seed`      | Membuat fixture event, FAQ, assignment, dan akun demo   |

## Troubleshooting

### Database tidak terhubung

- Pastikan MongoDB aktif.
- Periksa `MONGODB_URI` dan `MONGODB_DB_NAME`.
- Coba `GET /api/health/db`.

### Login selalu gagal setelah mengganti environment

- Pastikan `AUTH_SESSION_SECRET` sama pada seluruh instance aplikasi.
- Hapus cookie lama dan login ulang jika secret memang diganti.

### Gate login tetapi API mengembalikan 401 setelah perubahan kode

Restart development server agar module session terbaru dimuat:

```bash
pnpm dev
```

### Data demo tidak muncul

Jalankan secara eksplisit:

```bash
pnpm db:init
pnpm db:seed
```

### Kamera scanner tidak terbuka

Browser biasanya mensyaratkan secure context. Gunakan `localhost` saat development atau HTTPS pada deployment, lalu berikan izin kamera.

### QR tiket lama tidak memiliki payload

Saat detail order paid dibuka, sistem dapat menerbitkan credential QR untuk tiket legacy yang belum memiliki ciphertext, selama tiket masih valid dan tidak revoked/void.
